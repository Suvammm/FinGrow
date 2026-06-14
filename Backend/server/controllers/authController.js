const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendEmailOtpMail, isReminderEmailConfigured } = require('../services/reminderMailer');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeName = (name) => String(name || '').trim();
const normalizePassword = (password) => String(password || '');

const createOtpHash = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);
    const normalizedPassword = normalizePassword(password);

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(normalizedPassword, user.password))) {
      return res.json(buildAuthResponse(user));
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login' });
  }
};

exports.sendEmailOtp = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!isReminderEmailConfigured()) {
    return res.status(400).json({ message: 'Email OTP is not configured on the backend' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.emailOtpCode = createOtpHash(otp);
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmailOtpMail({
      to: user.email,
      otp,
      userName: user.name,
    });

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(`OTP send failed for ${normalizedEmail}: ${error.message}`);
    return res.status(500).json({ message: error.message || 'Could not send OTP right now' });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || '').trim();

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.emailOtpCode || !user.emailOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP has not been requested for this account' });
    }

    if (user.emailOtpExpiresAt < new Date()) {
      user.emailOtpCode = '';
      user.emailOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.emailOtpCode !== createOtpHash(otp)) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    user.emailOtpCode = '';
    user.emailOtpExpiresAt = null;
    await user.save();

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    console.error(`OTP verify failed for ${normalizedEmail}: ${error.message}`);
    return res.status(500).json({ message: error.message || 'Could not verify OTP right now' });
  }
};

exports.googleCredentialLogin = async (req, res) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID || !credential || !googleClient) {
    return res.status(400).json({ message: 'Google login is not configured on the backend' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const normalizedEmail = normalizeEmail(payload?.email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Google account email could not be verified' });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: normalizeName(payload?.name || 'Google User'),
        email: normalizedEmail,
        password: crypto.randomBytes(24).toString('hex'),
        googleId: String(payload?.sub || ''),
      });
    } else if (!user.googleId && payload?.sub) {
      user.googleId = String(payload.sub);
      await user.save();
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(401).json({ message: 'Google login could not be verified' });
  }
};

exports.updateProfileName = async (req, res) => {
  const normalizedName = normalizeName(req.body.name);

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }

  if (!normalizedName) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: normalizedName },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update name right now' });
  }
};
