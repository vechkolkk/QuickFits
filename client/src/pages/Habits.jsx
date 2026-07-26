import React, { useEffect, useState } from 'react';
import { Bell, Check, Flame, Target, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function Habits() {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ habitName: '', target: 'Daily', reminderTime: '', notificationsEnabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const today = getTodayKey();

  async function loadHabits() {
    setError('');

    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSavingId('new');

    try {
      await api.post('/habits', form);
      setForm({ habitName: '', target: 'Daily', reminderTime: '', notificationsEnabled: false });
      await loadHabits();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId('');
    }
  }

  async function toggleHabit(id) {
    setError('');
    setSavingId(id);

    try {
      const { data } = await api.post(`/habits/${id}/checkin`, { date: today });
      setHabits((currentHabits) => currentHabits.map((habit) => (habit._id === id ? data.habit : habit)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId('');
    }
  }

  async function deleteHabit(id) {
    setError('');
    setSavingId(id);

    try {
      await api.delete(`/habits/${id}`);
      setHabits((currentHabits) => currentHabits.filter((habit) => habit._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId('');
    }
  }

  if (isLoading) {
    return <div className="loading">Loading habits...</div>;
  }

  return (
    <>
      <PageHeader title="Habit Tracker" eyebrow="Consistency" />
      <section className="panel">
        <h2>Add Habit</h2>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Habit
            <input value={form.habitName} onChange={(event) => setForm({ ...form, habitName: event.target.value })} required />
          </label>
          <label>
            Reminder
            <input type="time" value={form.reminderTime} onChange={(event) => setForm({ ...form, reminderTime: event.target.value })} />
          </label>
          <label className="check-label">
            <input type="checkbox" checked={form.notificationsEnabled} onChange={(event) => setForm({ ...form, notificationsEnabled: event.target.checked })} />
            Enable reminders
          </label>
          {error && <p className="error full">{error}</p>}
          <button type="submit" disabled={savingId === 'new'}>{savingId === 'new' ? 'Saving...' : 'Save habit'}</button>
        </form>
      </section>
      <section className="habit-grid">
        {habits.length === 0 ? (
          <article className="habit-card habit-empty-card">
            <Target size={24} />
            <h2>No habits yet</h2>
            <span>Add one small daily habit to start a streak.</span>
          </article>
        ) : habits.map((habit) => {
          const complete = habit.completedDates.includes(today);
          const weekSummary = habit.weekSummary || { completed: 0, total: 7, days: [] };

          return (
            <article className="habit-card" key={habit._id}>
              <div className="habit-top">
                <button
                  className={complete ? 'check-button complete' : 'check-button'}
                  onClick={() => toggleHabit(habit._id)}
                  disabled={savingId === habit._id}
                  aria-label="Toggle habit"
                >
                  <Check size={18} />
                </button>
                <button
                  className="icon-button"
                  onClick={() => deleteHabit(habit._id)}
                  disabled={savingId === habit._id}
                  aria-label="Delete habit"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <h2>{habit.habitName}</h2>
              <p><Flame size={18} /> {habit.currentStreak} day current streak</p>
              <span>{habit.longestStreak} longest streak</span>
              <div className="habit-week">
                <strong>{weekSummary.completed}/{weekSummary.total} this week</strong>
                <div className="habit-week-days" aria-label={`${weekSummary.completed} of ${weekSummary.total} habit days completed this week`}>
                  {weekSummary.days.map((day) => (
                    <span
                      className={day.completed ? 'complete' : ''}
                      key={day.date}
                      title={`${day.date}: ${day.completed ? 'Complete' : 'Missed'}`}
                    />
                  ))}
                </div>
              </div>
              {habit.notificationsEnabled && <small><Bell size={14} /> {habit.reminderTime || 'Reminder on'}</small>}
            </article>
          );
        })}
      </section>
    </>
  );
}
