import { useEffect, useMemo, useState } from 'react';
import { fetchFinance, fetchGoals, updateProfileName } from '../api/api';
import './Profile.css';

const sumValues = (obj) =>
  Object.values(obj || {}).reduce((total, value) => total + (Number(value) || 0), 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token?.split('.')?.[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const Profile = () => {
  const [finance, setFinance] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [savingName, setSavingName] = useState(false);

  const storedUser = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}');
      if (parsed?.email) return parsed;

      const token = localStorage.getItem('token');
      const payload = decodeJwtPayload(token);
      const emailFromToken = payload?.email || payload?.user?.email;

      if (emailFromToken) {
        const merged = { ...parsed, email: emailFromToken };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      }

      const lastLoginEmail = localStorage.getItem('lastLoginEmail');
      if (lastLoginEmail) {
        const merged = { ...parsed, email: lastLoginEmail };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      }

      return parsed;
    } catch {
      return {};
    }
  }, []);

  const [displayUser, setDisplayUser] = useState(storedUser);
  const [nameInput, setNameInput] = useState(storedUser?.name || '');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [financeRes, goalsRes] = await Promise.all([fetchFinance(), fetchGoals()]);
        setFinance(financeRes?.data || null);
        setGoals(Array.isArray(goalsRes?.data) ? goalsRes.data : []);
      } catch {
        setError('Could not load profile stats right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError('');
    setSaveMessage('');

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setError('Please enter a name.');
      return;
    }

    try {
      setSavingName(true);
      const response = await updateProfileName({ name: trimmedName });
      const updatedUser = {
        ...displayUser,
        name: response.data?.name || trimmedName,
        email: response.data?.email || displayUser?.email || '',
        id: response.data?._id || displayUser?.id || '',
      };
      setDisplayUser(updatedUser);
      setNameInput(updatedUser.name);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSaveMessage('Name updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update name right now.');
    } finally {
      setSavingName(false);
    }
  };

  const totalAssets = sumValues(finance?.assets);
  const totalLiabilities = sumValues(finance?.liabilities);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {(displayUser?.name || 'U')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('')}
        </div>
        <div className="profile-user-info">
          <h1>{displayUser?.name || 'User'}</h1>
          <p>{displayUser?.email || 'No email available'}</p>
        </div>
      </div>

      <div className="stats-wrap">
        {loading ? <p className="profile-note">Loading your profile stats...</p> : null}
        {error ? <p className="profile-note error">{error}</p> : null}
        {saveMessage ? <p className="profile-note success">{saveMessage}</p> : null}

        <form className="profile-name-card" onSubmit={handleSaveName}>
          <div>
            <h3>Your Name</h3>
            <p>Set the name you want the app to display for your account.</p>
          </div>
          <div className="profile-name-row">
            <input
              type="text"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button type="submit" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </form>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Assets</h3>
            <p>{formatCurrency(totalAssets)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Liabilities</h3>
            <p>{formatCurrency(totalLiabilities)}</p>
          </div>
          <div className="stat-card">
            <h3>Net Worth</h3>
            <p>{formatCurrency(netWorth)}</p>
          </div>
          <div className="stat-card">
            <h3>Goals Created</h3>
            <p>{goals.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
