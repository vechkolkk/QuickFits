import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: user.username,
    goal: user.goal,
    experienceLevel: user.experienceLevel
  });
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHeader title="Profile Settings" eyebrow="Account" />
      <section className="panel narrow-panel">
        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </label>
          <label>
            Goal
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
          <button type="submit">Save changes</button>
          {saved && <p className="success">Profile updated.</p>}
        </form>
      </section>
    </>
  );
}
