import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await login(form);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-panel">
        <div className="auth-brand">
          <Dumbbell size={30} />
          <strong>QuickFit</strong>
        </div>
        <h1>Welcome back</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Log in</button>
        </form>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </section>
    </div>
  );
}
