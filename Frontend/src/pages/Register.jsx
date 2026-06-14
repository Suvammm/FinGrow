import { useEffect, useState } from 'react';
import { register } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError('Please fill your name, email, and password.');
      return;
    }

    try {
      setSubmitting(true);
      await register(payload);
      localStorage.setItem('lastLoginEmail', payload.email);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-shell">
        <section className="register-showcase">
          <span className="register-pill">FinGrow</span>
          <h1>Start building better money habits with one calm workspace.</h1>
          <p>
            Track finances, goals, reminders, and market opportunities from a single account.
          </p>
          <div className="showcase-points">
            <div className="showcase-item">
              <strong>Smart tracking</strong>
              <span>Watch your assets, goals, and receivables in one place.</span>
            </div>
            <div className="showcase-item">
              <strong>Personal flow</strong>
              <span>Create your account once and sign in using the same email and password.</span>
            </div>
            <div className="showcase-item">
              <strong>Clean focus</strong>
              <span>A simple dashboard built to keep your financial decisions clear.</span>
            </div>
          </div>
        </section>

        <section className="register-card">
          <form className="register-form" onSubmit={handleSignup}>
            <div className="register-head">
              <h2>Create your account</h2>
              <p>Use your email once here, then log in with the same credentials anytime.</p>
            </div>

            {error ? <p className="register-message error">{error}</p> : null}

            <div className="register-input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
              />
            </div>

            <div className="register-input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                required
              />
            </div>

            <div className="register-input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Register'}
            </button>

            <p className="register-footer">
              Already have an account? <span onClick={() => navigate('/login')}>Sign in here</span>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Register;
