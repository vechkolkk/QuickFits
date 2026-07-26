import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { CheckCircle2, Dumbbell } from 'lucide-react';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password
    };

    if (!payload.email || !payload.password) {
      setError('Enter your email and password to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(payload);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        <section className="auth-panel">
          <div className="auth-brand">
            <Dumbbell size={30} />
            <strong>QuickFit</strong>
          </div>
          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Log in to keep your workouts, habits, and streaks moving.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
        </section>

        <aside className="auth-side" aria-label="QuickFit account benefits">
          <span>Beginner friendly tracking</span>
          <h2>One place for your workouts and daily habits.</h2>
          <ul className="auth-points">
            <li><CheckCircle2 size={18} /> Fast workout history</li>
            <li><CheckCircle2 size={18} /> Habit streak summaries</li>
            <li><CheckCircle2 size={18} /> Progress charts after login</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
