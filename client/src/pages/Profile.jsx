import React, { useState } from 'react';
import { BadgeCheck, Globe2, Mail, Ruler, Target, UserCircle } from 'lucide-react';
import { getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: user.username || '',
    goal: user.goal || '',
    experienceLevel: user.experienceLevel || 'Beginner',
    timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    unitSystem: user.unitSystem || 'imperial'
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const timezones = Intl.supportedValuesOf?.('timeZone') || ['UTC'];

  const hasChanges =
    form.username.trim() !== user.username ||
    form.goal.trim() !== (user.goal || '') ||
    form.experienceLevel !== user.experienceLevel ||
    form.timezone !== (user.timezone || 'UTC') ||
    form.unitSystem !== (user.unitSystem || 'imperial');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved(false);

    const payload = {
      username: form.username.trim(),
      goal: form.goal.trim(),
      experienceLevel: form.experienceLevel,
      timezone: form.timezone,
      unitSystem: form.unitSystem
    };

    if (payload.username.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (!payload.goal) {
      setError('Add a fitness goal before saving your profile.');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(payload);
      setForm(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile Settings" eyebrow="Account" />
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="section-title-row">
            <div>
              <h2>Edit profile</h2>
              <p>Keep your account details and fitness focus up to date.</p>
            </div>
          </div>

          <form className="grid-form profile-form" onSubmit={handleSubmit} noValidate>
            <label>
              Username
              <input
                autoComplete="username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
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
            <label className="full">
              Fitness goal
              <input
                value={form.goal}
                onChange={(event) => setForm({ ...form, goal: event.target.value })}
                required
              />
            </label>
            <label>
              Weight units
              <select value={form.unitSystem} onChange={(event) => setForm({ ...form, unitSystem: event.target.value })}>
                <option value="imperial">Pounds (lb)</option>
                <option value="metric">Kilograms (kg)</option>
              </select>
            </label>
            <label>
              Timezone
              <select value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })}>
                {!timezones.includes(form.timezone) && <option>{form.timezone}</option>}
                {timezones.map((timezone) => (
                  <option value={timezone} key={timezone}>{timezone.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </label>
            <div className="profile-actions full">
              <button type="submit" disabled={isSaving || !hasChanges}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && <p className="success" role="status">Profile updated.</p>}
              {error && <p className="error" role="alert">{error}</p>}
            </div>
          </form>
        </section>

        <aside className="panel profile-summary">
          <div className="profile-avatar" aria-hidden="true">
            <UserCircle size={38} />
          </div>
          <div>
            <h2>{user.username}</h2>
            <p>{user.goal || 'No goal set yet'}</p>
          </div>
          <dl className="profile-details">
            <div>
              <dt><Mail size={16} /> Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt><Target size={16} /> Goal</dt>
              <dd>{user.goal || 'Not set'}</dd>
            </div>
            <div>
              <dt><BadgeCheck size={16} /> Experience</dt>
              <dd>{user.experienceLevel}</dd>
            </div>
            <div>
              <dt><Ruler size={16} /> Units</dt>
              <dd>{user.unitSystem === 'metric' ? 'Kilograms' : 'Pounds'}</dd>
            </div>
            <div>
              <dt><Globe2 size={16} /> Timezone</dt>
              <dd>{user.timezone || 'UTC'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
