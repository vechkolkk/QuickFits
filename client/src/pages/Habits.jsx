import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';

export function Habits() {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ habitName: '', target: 'Daily', reminderTime: '', notificationsEnabled: false });
  const today = new Date().toISOString().slice(0, 10);

  async function loadHabits() {
    const { data } = await api.get('/habits');
    setHabits(data.habits);
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post('/habits', form);
    setForm({ habitName: '', target: 'Daily', reminderTime: '', notificationsEnabled: false });
    loadHabits();
  }

  async function toggleHabit(id) {
    await api.post(`/habits/${id}/checkin`, { date: today });
    loadHabits();
  }

  async function deleteHabit(id) {
    await api.delete(`/habits/${id}`);
    loadHabits();
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
          <button type="submit">Save habit</button>
        </form>
      </section>
      <section className="habit-grid">
        {habits.map((habit) => {
          const complete = habit.completedDates.includes(today);

          return (
            <article className="habit-card" key={habit._id}>
              <div className="habit-top">
                <button className={complete ? 'check-button complete' : 'check-button'} onClick={() => toggleHabit(habit._id)} aria-label="Toggle habit">
                  <Check size={18} />
                </button>
                <button className="icon-button" onClick={() => deleteHabit(habit._id)} aria-label="Delete habit">
                  <Trash2 size={17} />
                </button>
              </div>
              <h2>{habit.habitName}</h2>
              <p>{habit.currentStreak} day current streak</p>
              <span>{habit.longestStreak} longest streak</span>
              {habit.notificationsEnabled && <small><Bell size={14} /> {habit.reminderTime || 'Reminder on'}</small>}
            </article>
          );
        })}
      </section>
    </>
  );
}
