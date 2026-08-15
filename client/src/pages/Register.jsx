import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      goal: form.goal.trim(),
      experienceLevel: form.experienceLevel,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      unitSystem: 'imperial'
    };

    if (!payload.username || !payload.email || !payload.password || !payload.goal) {
      setError('Fill in all required fields to create your account.');
      return;
    }

    if (payload.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(payload);
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
            <Activity size={30} />
            <strong>QuickFit</strong>
          </div>
          <div className="auth-heading">
            <h1>Start tracking</h1>
            <p>Create your account and set up a simple routine you can stick with.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Username
              <input
                autoComplete="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                required
              />
            </label>
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
                minLength="8"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <span className="field-hint">Use 8 or more characters.</span>
            </label>
            <label>
              Fitness goal
              <input
                placeholder="Build consistency"
                value={form.goal}
                onChange={(event) => setForm({ ...form, goal: event.target.value })}
                required
              />
            </label>
            <label>
              Experience
              <select value={form.experienceLevel} onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}>
                <option>Beginner</option>
                <option>Casual</option>
                <option>Intermediate</option>
              </select>
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
        </section>

        <aside className="auth-side" aria-label="QuickFit setup benefits">
          <span>Built for consistency</span>
          <h2>Start small, track clearly, and keep your streak alive.</h2>
          <ul className="auth-points">
            <li><CheckCircle2 size={18} /> Guided beginner setup</li>
            <li><CheckCircle2 size={18} /> Workout and habit logging</li>
            <li><CheckCircle2 size={18} /> Dashboard progress views</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
