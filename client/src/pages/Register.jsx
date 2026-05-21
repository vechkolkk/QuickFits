import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

export function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    goal: 'Build consistency',
    experienceLevel: 'Beginner'
  });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await register(form);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-panel">
        <div className="auth-brand">
          <Activity size={30} />
          <strong>QuickFit</strong>
        </div>
        <h1>Start tracking</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <label>
            Fitness goal
            <input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
          </label>
          <label>
            Experience
            <select value={form.experienceLevel} onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}>
              <option>Beginner</option>
              <option>Casual</option>
              <option>Intermediate</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Create account</button>
        </form>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </div>
  );
}
