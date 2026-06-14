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

const formatDate = (value, withTime = false) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [finance, setFinance] = useState({ assets: {} });
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
  });
  const [receivableForm, setReceivableForm] = useState({
    debtorName: '',
    targetAmount: '',
    reason: '',
    recipientEmail: '',
    deadline: '',
    reminderDate: '',
    reminderFrequency: 'Once',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingGoalId, setDeletingGoalId] = useState('');

  const currentAssets = useMemo(() => sumValues(finance?.assets), [finance]);
  const trackingAssets = useMemo(() => Math.round(currentAssets * 0.25), [currentAssets]);
  const financialGoals = useMemo(
    () => goals.filter((goal) => goal.goalType !== 'receivable'),
    [goals]
  );
  const receivableGoals = useMemo(
    () => goals.filter((goal) => goal.goalType === 'receivable'),
    [goals]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, financeRes] = await Promise.all([fetchGoals(), fetchFinance()]);
      setGoals(Array.isArray(goalsRes?.data) ? goalsRes.data : []);
      setFinance(financeRes?.data || { assets: {} });
      setError('');
    } catch {
      setError('Could not load goals right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onGoalChange = (key, value) => {
    setGoalForm((prev) => ({ ...prev, [key]: value }));
  };

  const onReceivableChange = (key, value) => {
    setReceivableForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim() || !goalForm.targetAmount || !goalForm.deadline) {
      setError('Please fill title, target amount and target date.');
      setSuccess('');
      return;
    }

    try {
      const payload = {
        goalType: 'financial',
        title: goalForm.title.trim(),
        targetAmount: Number(goalForm.targetAmount),
        deadline: goalForm.deadline,
        currentAmount: trackingAssets,
      };
      const response = await createGoal(payload);
      setGoals((prev) => [response.data, ...prev]);
      setGoalForm({ title: '', targetAmount: '', deadline: '' });
      setError('');
      setSuccess('Financial goal added successfully.');
    } catch {
      setError('Failed to create goal. Try again.');
      setSuccess('');
    }
  };

  const handleCreateReceivable = async (e) => {
    e.preventDefault();
    if (
      !receivableForm.debtorName.trim() ||
      !receivableForm.targetAmount ||
      !receivableForm.reason.trim() ||
      !receivableForm.recipientEmail.trim() ||
      !receivableForm.deadline ||
      !receivableForm.reminderDate
    ) {
      setError('Please fill person name, amount, reason, Gmail, due date and reminder date.');
      setSuccess('');
      return;
    }

    try {
      const payload = {
        goalType: 'receivable',
        title: `Collect from ${receivableForm.debtorName.trim()}`,
        debtorName: receivableForm.debtorName.trim(),
        targetAmount: Number(receivableForm.targetAmount),
        reason: receivableForm.reason.trim(),
        recipientEmail: receivableForm.recipientEmail.trim().toLowerCase(),
        deadline: receivableForm.deadline,
        reminderDate: receivableForm.reminderDate,
        reminderFrequency: receivableForm.reminderFrequency,
      };
      const response = await createGoal(payload);
      setGoals((prev) => [response.data, ...prev]);
      setReceivableForm({
        debtorName: '',
        targetAmount: '',
        reason: '',
        recipientEmail: '',
        deadline: '',
        reminderDate: '',
        reminderFrequency: 'Once',
      });
      setError('');
      setSuccess(
        response.data?.emailReady
          ? 'Money reminder saved. The app will send the reminder to the Gmail you entered when the reminder time is reached.'
          : 'Money reminder saved. Entered Gmail is stored, but email sending is not ready on the backend yet.'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create money reminder. Try again.');
      setSuccess('');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!goalId) return;
    setDeletingGoalId(goalId);
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => (goal._id || goal.id) !== goalId));
      setError('');
      setSuccess('Entry deleted successfully.');
    } catch {
      setError('Failed to delete goal. Try again.');
      setSuccess('');
    } finally {
      setDeletingGoalId('');
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>Financial Goals</h2>
        <p>Create custom targets and also track money you should receive from others.</p>
      </div>

      <section className="goals-section">
        <div className="section-head">
          <div>
            <h3>Set a financial goal</h3>
            <p>Track savings targets using your current asset base.</p>
          </div>
        </div>

        <form className="add-goal-card" onSubmit={handleCreateGoal}>
          <div className="goal-form-grid">
            <div className="input-box">
              <label>Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Home Downpayment"
                value={goalForm.title}
                onChange={(e) => onGoalChange('title', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Target Amount (INR)</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={goalForm.targetAmount}
                onChange={(e) => onGoalChange('targetAmount', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Target Date</label>
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => onGoalChange('deadline', e.target.value)}
              />
            </div>
            <button type="submit" className="add-goal-btn">Set Goal</button>
          </div>
        </form>

        <p className="assets-tracker">
          Tracking Base (25% of Assets): {formatCurrency(trackingAssets)} from total {formatCurrency(currentAssets)}
        </p>
      </section>

      <section className="goals-section">
        <div className="section-head">
          <div>
            <h3>Money to receive reminders</h3>
            <p>Add who owes you money, why, and when FinGrow should remind you by email.</p>
          </div>
        </div>

        <form className="add-goal-card receivable-card" onSubmit={handleCreateReceivable}>
          <div className="receivable-demo-note">
            <strong>Demo flow:</strong> Enter only the Gmail that should receive the reminder. No Gmail password is needed from the user here.
          </div>
          <div className="receivable-form-grid">
            <div className="input-box">
              <label>Person Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={receivableForm.debtorName}
                onChange={(e) => onReceivableChange('debtorName', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Amount (INR)</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={receivableForm.targetAmount}
                onChange={(e) => onReceivableChange('targetAmount', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Reason</label>
              <input
                type="text"
                placeholder="e.g. Personal loan"
                value={receivableForm.reason}
                onChange={(e) => onReceivableChange('reason', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Gmail Address</label>
              <input
                type="email"
                placeholder="e.g. you@gmail.com"
                value={receivableForm.recipientEmail}
                onChange={(e) => onReceivableChange('recipientEmail', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Expected Date</label>
              <input
                type="date"
                value={receivableForm.deadline}
                onChange={(e) => onReceivableChange('deadline', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>First Reminder</label>
              <input
                type="datetime-local"
                value={receivableForm.reminderDate}
                onChange={(e) => onReceivableChange('reminderDate', e.target.value)}
              />
            </div>
            <div className="input-box">
              <label>Frequency</label>
              <select
                value={receivableForm.reminderFrequency}
                onChange={(e) => onReceivableChange('reminderFrequency', e.target.value)}
              >
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <button type="submit" className="add-goal-btn receivable-submit">Save Reminder</button>
          </div>
        </form>
      </section>

      {loading ? <p className="goals-note">Loading goals...</p> : null}
      {error ? <p className="goals-note error">{error}</p> : null}
      {success ? <p className="goals-note success">{success}</p> : null}

      <section className="goals-section">
        <div className="section-head">
          <div>
            <h3>Saved financial goals</h3>
            <p>Your long-term and short-term targets.</p>
          </div>
        </div>

        <div className="goals-grid">
          {financialGoals.map((goal) => {
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
                <div className="goal-amount">{formatCurrency(goal.targetAmount)}</div>
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
            );
          })}
        </div>
      </section>

      <section className="goals-section">
        <div className="section-head">
          <div>
            <h3>Money you should receive</h3>
            <p>These reminders will email your registered account when due.</p>
          </div>
        </div>

        <div className="goals-grid">
          {receivableGoals.map((goal) => (
            <div key={goal._id || goal.id} className="goal-item-card receivable-item-card">
              <div className="goal-info">
                <h3>{goal.debtorName}</h3>
                <span className="goal-date">Reason: {goal.reason || 'Not provided'}</span>
              </div>
              <div className="goal-amount">{formatCurrency(goal.targetAmount)}</div>
              <div className="receivable-meta">
                <span>Gmail: {goal.recipientEmail || 'Uses account email'}</span>
                <span>Expected by: {formatDate(goal.deadline)}</span>
                <span>First reminder: {formatDate(goal.reminderDate, true)}</span>
                <span>Frequency: {goal.reminderFrequency || 'Once'}</span>
                <span>
                  Next email: {goal.reminderCompleted ? 'Completed' : formatDate(goal.nextReminderAt, true)}
                </span>
              </div>
              <button className="view-details receivable-status" type="button">
                {goal.reminderSentCount || 0} reminder{goal.reminderSentCount === 1 ? '' : 's'} sent
              </button>
              <button
                className="delete-goal-btn"
                type="button"
                onClick={() => handleDeleteGoal(goal._id || goal.id)}
                disabled={deletingGoalId === (goal._id || goal.id)}
              >
                {deletingGoalId === (goal._id || goal.id) ? 'Deleting...' : 'Delete Reminder'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Goals;
