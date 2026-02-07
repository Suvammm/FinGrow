import React, { useState } from 'react';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "Emergency Fund", target: 50000, date: "2026-12-31" },
    { id: 2, title: "New Car", target: 1500000, date: "2028-06-15" }
  ]);

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>Financial Goals</h2>
        <p>Define your milestones and track your journey to wealth.</p>
      </div>

      {/* ADD GOAL FORM */}
      <div className="add-goal-card">
        <div className="goal-form-grid">
          <div className="input-box">
            <label>Goal Title</label>
            <input type="text" placeholder="e.g. Home Downpayment" />
          </div>
          <div className="input-box">
            <label>Target Amount ($)</label>
            <input type="number" placeholder="0.00" />
          </div>
          <div className="input-box">
            <label>Target Date</label>
            <input type="date" />
          </div>
          <button className="add-goal-btn">Set Goal</button>
        </div>
      </div>

      {/* GOALS LIST */}
      <div className="goals-grid">
        {goals.map(goal => (
          <div key={goal.id} className="goal-item-card">
            <div className="goal-info">
              <h3>{goal.title}</h3>
              <span className="goal-date">Target: {new Date(goal.date).toLocaleDateString()}</span>
            </div>
            <div className="goal-amount">
              ${goal.target.toLocaleString()}
            </div>
            <div className="progress-container">
               <div className="progress-bar" style={{width: '45%'}}></div>
            </div>
            <button className="view-details">Track Progress</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;