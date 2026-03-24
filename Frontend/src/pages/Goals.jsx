import { useEffect, useMemo, useState } from 'react';
import { createGoal, deleteGoal, fetchFinance, fetchGoals } from '../api/api';
import './Goals.css';

const sumValues = (obj) =>
  Object.values(obj || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [finance, setFinance] = useState({ assets: {} });
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingGoalId, setDeletingGoalId] = useState('');

  const currentAssets = useMemo(() => sumValues(finance?.assets), [finance]);
  const trackingAssets = useMemo(() => Math.round(currentAssets * 0.25), [currentAssets]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, financeRes] = await Promise.all([fetchGoals(), fetchFinance()]);
      setGoals(Array.isArray(goalsRes?.data) ? goalsRes.data : []);
      setFinance(financeRes?.data || { assets: {} });
      setError('');
    } catch (err) {
      setError('Could not load goals right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetAmount || !form.deadline) {
      setError('Please fill title, target amount and target date.');
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline,
        currentAmount: trackingAssets,
      };
      const response = await createGoal(payload);
      setGoals((prev) => [response.data, ...prev]);
      setForm({ title: '', targetAmount: '', deadline: '' });
      setError('');
    } catch (err) {
      setError('Failed to create goal. Try again.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!goalId) return;
    setDeletingGoalId(goalId);
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => (goal._id || goal.id) !== goalId));
      setError('');
    } catch (err) {
      setError('Failed to delete goal. Try again.');
    } finally {
      setDeletingGoalId('');
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>Financial Goals</h2>
        <p>Create custom targets and track each goal using your present assets.</p>
      </div>

      {/* ADD GOAL FORM */}
      <form className="add-goal-card" onSubmit={handleCreateGoal}>
        <div className="goal-form-grid">
          <div className="input-box">
            <label>Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Home Downpayment"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
            />
          </div>
          <div className="input-box">
            <label>Target Amount (INR)</label>
            <input
              type="number"
              min="1"
              placeholder="0"
              value={form.targetAmount}
              onChange={(e) => onChange('targetAmount', e.target.value)}
            />
          </div>
          <div className="input-box">
            <label>Target Date</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => onChange('deadline', e.target.value)}
            />
          </div>
          <button type="submit" className="add-goal-btn">Set Goal</button>
        </div>
      </form>

      <p className="assets-tracker">
        Tracking Base (25% of Assets): {formatCurrency(trackingAssets)} from total {formatCurrency(currentAssets)}
      </p>
      {loading ? <p className="goals-note">Loading goals...</p> : null}
      {error ? <p className="goals-note error">{error}</p> : null}

      {/* GOALS LIST */}
      <div className="goals-grid">
        {goals.map((goal) => {
          const target = Number(goal.targetAmount) || 0;
          const progressRaw = target > 0 ? Math.round((trackingAssets / target) * 100) : 0;
          const progress = Math.min(progressRaw, 100);

          return (
          <div key={goal._id || goal.id} className="goal-item-card">
            <div className="goal-info">
              <h3>{goal.title}</h3>
              <span className="goal-date">
                Target: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="goal-amount">
              {formatCurrency(goal.targetAmount)}
            </div>
            <div className="progress-container">
               <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <button className="view-details" type="button">
              {progress}% tracked from current assets
            </button>
            <button
              className="delete-goal-btn"
              type="button"
              onClick={() => handleDeleteGoal(goal._id || goal.id)}
              disabled={deletingGoalId === (goal._id || goal.id)}
            >
              {deletingGoalId === (goal._id || goal.id) ? 'Deleting...' : 'Delete Goal'}
            </button>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Goals;
