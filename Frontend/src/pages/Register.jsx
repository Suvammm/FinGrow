import { useState } from 'react';
import { register } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    await register(form);
    navigate('/login');
  };

  return (
    <div className="auth-screen">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Create Account</h2>
        <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
        <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
export default Register;