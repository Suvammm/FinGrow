const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  sendEmailOtp,
  verifyEmailOtp,
  googleCredentialLogin,
  updateProfileName,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard Auth Endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/otp/send', sendEmailOtp);
router.post('/otp/verify', verifyEmailOtp);
router.post('/google/credential', googleCredentialLogin);
router.put('/profile/name', protect, updateProfileName);

module.exports = router;
