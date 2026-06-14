import { useEffect, useRef, useState } from 'react';
import {
  login,
  loginWithGoogleCredential,
  sendLoginOtp,
  updateProfileName,
  verifyLoginOtp,
} from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const saveAuthSession = (responseData, fallbackEmail = '') => {
  if (!responseData?.token) return false;

  const finalEmail = responseData.email || fallbackEmail || '';
  localStorage.setItem('token', responseData.token);
  if (finalEmail) {
    localStorage.setItem('lastLoginEmail', finalEmail);
  }
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: responseData._id,
      name: responseData.name,
      email: finalEmail,
    })
  );

  return true;
};

const Login = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [mode, setMode] = useState('password');
  const [creds, setCreds] = useState({
    email: localStorage.getItem('lastLoginEmail') || '',
    password: '',
  });
  const [otpState, setOtpState] = useState({
    name: '',
    email: localStorage.getItem('lastLoginEmail') || '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const apiResponse = await loginWithGoogleCredential({
              credential: response.credential,
            });

            if (saveAuthSession(apiResponse.data, apiResponse.data?.email)) {
              navigate('/');
            }
          } catch (googleError) {
            setError(googleError.response?.data?.message || 'Google login failed.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'signin_with',
      });
      window.google.accounts.id.prompt();
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = setupGoogle;
    document.body.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const payload = {
        email: creds.email.trim().toLowerCase(),
        password: creds.password,
      };
      const response = await login(payload);

      if (saveAuthSession(response.data, payload.email)) {
        navigate('/');
      } else {
        setError('Login failed: No token received from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const payload = { email: otpState.email.trim().toLowerCase() };
      await sendLoginOtp(payload);
      localStorage.setItem('lastLoginEmail', payload.email);
      setOtpSent(true);
      setInfo('OTP sent to your email. It will expire in 10 minutes.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const payload = {
        email: otpState.email.trim().toLowerCase(),
        otp: otpState.otp.trim(),
      };
      const response = await verifyLoginOtp(payload);

      if (saveAuthSession(response.data, payload.email)) {
        const trimmedName = otpState.name.trim();
        if (trimmedName) {
          try {
            await updateProfileName({ name: trimmedName });
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem(
              'user',
              JSON.stringify({
                ...storedUser,
                name: trimmedName,
              })
            );
          } catch {
            // Keep OTP login successful even if name sync does not complete.
          }
        }
        navigate('/');
      } else {
        setError('OTP login failed: No token received from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card-wide">
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={mode === 'password' ? 'active' : ''}
            onClick={() => {
              setMode('password');
              setError('');
              setInfo('');
              setOtpSent(false);
            }}
          >
            Password
          </button>
          <button
            type="button"
            className={mode === 'otp' ? 'active' : ''}
            onClick={() => {
              setMode('otp');
              setError('');
              setInfo('');
              setOtpState((prev) => ({
                ...prev,
                email: creds.email || prev.email,
              }));
            }}
          >
            Email OTP
          </button>
        </div>

        {mode === 'password' ? (
          <form className="auth-form" onSubmit={handlePasswordLogin}>
            <h2>Wealth Engine Login</h2>
            <p className="auth-subtitle">Sign in with your email and password or use Google below.</p>

            {error && <p className="error-message">{error}</p>}
            {info && <p className="info-message">{info}</p>}

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. test@gmail.com"
                value={creds.email}
                onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="google-auth-block">
              <div ref={googleButtonRef} className="google-button-slot" />
              {!googleReady ? (
                <p className="google-note">
                  Add `VITE_GOOGLE_CLIENT_ID` in the frontend env and `GOOGLE_CLIENT_ID` on the backend to enable Google Login and One Tap.
                </p>
              ) : (
                <p className="google-note">
                  Google One Tap will appear automatically when supported in the browser.
                </p>
              )}
            </div>

            <p className="auth-footer">
              Don&apos;t have an account? <span onClick={() => navigate('/register')}>Register here</span>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <h2>Email OTP Login</h2>
            <p className="auth-subtitle">Get a one-time code in your email and log in without typing your password.</p>

            {error && <p className="error-message">{error}</p>}
            {info && <p className="info-message">{info}</p>}

            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your display name"
                value={otpState.name}
                onChange={(e) => setOtpState({ ...otpState, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. test@gmail.com"
                value={otpState.email}
                onChange={(e) => {
                  setOtpSent(false);
                  setOtpState({ ...otpState, email: e.target.value });
                }}
                required
              />
            </div>

            <button type="button" className="secondary-auth-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Sending OTP...' : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>

            <div className="input-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otpState.otp}
                onChange={(e) => setOtpState({ ...otpState, otp: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading || !otpSent}>
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>

            <p className="auth-footer">
              Back to password login? <span onClick={() => setMode('password')}>Use password</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
