import { useState, useEffect } from 'react';
import { fetchGoals, createGoal } from '../api/api';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '' });

  useEffect(() => {
    fetchGoals().then(res => setGoals(res.data));
  }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    const { data } = await createGoal(newGoal);
    setGoals([...goals, data]);
  };

  return (
    <div className="goals-container">
      <form className="goal-form" onSubmit={addGoal}>
        <input placeholder="Goal Title" onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
        <input type="number" placeholder="Target" onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} />
        <input type="date" onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
        <button type="submit">Add Goal</button>
      </form>
      <div className="goals-list">
        {goals.map(g => (
          <div key={g._id} className="goal-card">
            <h4>{g.title}</h4>
            <p>${g.targetAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Goals;