import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, Flame, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { getScheduleLabel, WEEKDAYS } from '../utils/habitReminders.js';
import { getDateKeyInTimeZone } from '../utils/preferences.js';

const blankForm = () => ({ habitName: '', scheduleDays: [0, 1, 2, 3, 4, 5, 6], reminderTimes: [''], notificationsEnabled: false });

export function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [permission, setPermission] = useState(() => !window.Notification ? 'unsupported' : window.Notification.permission);
  const timezone = user.timezone || 'UTC';
  const today = getDateKeyInTimeZone(new Date(), timezone);

  const loadHabits = useCallback(async () => {
    setError('');
    try { const { data } = await api.get('/habits'); setHabits(data.habits); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  async function requestNotifications() {
    if (window.Notification) setPermission(await window.Notification.requestPermission());
  }

  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    const reminderTimes = form.reminderTimes.filter(Boolean);
    if (!form.scheduleDays.length) { setError('Choose at least one scheduled day'); return; }
    if (form.notificationsEnabled && !reminderTimes.length) { setError('Add a reminder time or turn reminders off'); return; }
    setSavingId(editingId || 'new');
    const payload = { ...form, reminderTimes, target: getScheduleLabel(form.scheduleDays) };
    try {
      if (editingId) await api.put(`/habits/${editingId}`, payload); else await api.post('/habits', payload);
      setForm(blankForm()); setEditingId(''); await loadHabits(); window.dispatchEvent(new window.Event('quickfit-habits-updated'));
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingId(''); }
  }

  function editHabit(habit) {
    setEditingId(habit._id);
    setForm({ habitName: habit.habitName, scheduleDays: habit.scheduleDays, reminderTimes: habit.reminderTimes.length ? habit.reminderTimes : [''], notificationsEnabled: habit.notificationsEnabled });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleDay(day) {
    setForm((current) => ({ ...current, scheduleDays: current.scheduleDays.includes(day) ? current.scheduleDays.filter((value) => value !== day) : [...current.scheduleDays, day].sort() }));
  }

  function updateReminder(index, value) {
    setForm((current) => ({ ...current, reminderTimes: current.reminderTimes.map((time, timeIndex) => timeIndex === index ? value : time) }));
  }

  async function toggleHabit(id) {
    setError(''); setSavingId(id);
    try { const { data } = await api.post(`/habits/${id}/checkin`, { date: today }); setHabits((current) => current.map((habit) => habit._id === id ? data.habit : habit)); window.dispatchEvent(new window.Event('quickfit-habits-updated')); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingId(''); }
  }

  async function deleteHabit(id) {
    const habit = habits.find((item) => item._id === id);
    if (!window.confirm(`Delete “${habit?.habitName || 'this habit'}” and its check-in history?`)) return;
    setError(''); setSavingId(id);
    try { await api.delete(`/habits/${id}`); setHabits((current) => current.filter((item) => item._id !== id)); window.dispatchEvent(new window.Event('quickfit-habits-updated')); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingId(''); }
  }

  if (isLoading) return <div className="loading">Loading habits...</div>;

  return <>
    <PageHeader title="Habit Tracker" eyebrow="Consistency" />
    <section className="panel">
      <div className="section-title-row"><div><h2>{editingId ? 'Edit habit' : 'Add habit'}</h2><p>Choose the days and times that fit your routine.</p></div>{editingId && <button className="secondary-button" onClick={() => { setEditingId(''); setForm(blankForm()); }}><X size={16} /> Cancel</button>}</div>
      <form className="grid-form habit-form" onSubmit={handleSubmit}>
        <label>Habit<input value={form.habitName} onChange={(event) => setForm({ ...form, habitName: event.target.value })} required /></label>
        <fieldset className="habit-schedule full"><legend>Schedule</legend><div>{WEEKDAYS.map((day) => <button type="button" className={form.scheduleDays.includes(day.value) ? 'selected' : ''} onClick={() => toggleDay(day.value)} key={day.value} aria-pressed={form.scheduleDays.includes(day.value)}>{day.short}</button>)}</div></fieldset>
        <fieldset className="habit-reminders full"><legend>Reminder times</legend>{form.reminderTimes.map((time, index) => <div key={index}><input type="time" value={time} onChange={(event) => updateReminder(index, event.target.value)} aria-label={`Reminder time ${index + 1}`} />{form.reminderTimes.length > 1 && <button type="button" className="icon-button" onClick={() => setForm({ ...form, reminderTimes: form.reminderTimes.filter((_, timeIndex) => timeIndex !== index) })} aria-label={`Remove reminder time ${index + 1}`}><X size={16} /></button>}</div>)}{form.reminderTimes.length < 5 && <button type="button" className="secondary-button" onClick={() => setForm({ ...form, reminderTimes: [...form.reminderTimes, ''] })}><Plus size={16} /> Add time</button>}</fieldset>
        <label className="check-label full"><input type="checkbox" checked={form.notificationsEnabled} onChange={(event) => setForm({ ...form, notificationsEnabled: event.target.checked })} />Enable browser reminders</label>
        {form.notificationsEnabled && permission !== 'granted' && <div className="reminder-permission full"><span>{permission === 'denied' ? 'Notifications are blocked in your browser settings.' : permission === 'unsupported' ? 'This browser does not support notifications.' : 'Allow notifications so QuickFit can remind you while the app is open.'}</span>{permission === 'default' && <button type="button" className="secondary-button" onClick={requestNotifications}><Bell size={16} /> Allow notifications</button>}</div>}
        {error && <p className="error full" role="alert">{error}</p>}
        <button type="submit" disabled={Boolean(savingId)}>{savingId === (editingId || 'new') ? 'Saving...' : editingId ? 'Update habit' : 'Save habit'}</button>
      </form>
    </section>
    <section className="habit-grid">
      {habits.length === 0 ? <article className="habit-card habit-empty-card"><Target size={24} /><h2>No habits yet</h2><span>Add one small habit to start a streak.</span></article> : habits.map((habit) => {
        const complete = habit.completedDates.includes(today);
        const scheduledToday = habit.scheduleDays.includes(new Date(`${today}T12:00:00`).getDay());
        const week = habit.weekSummary || { completed: 0, total: 0, days: [] };
        return <article className="habit-card" key={habit._id}>
          <div className="habit-top"><button className={complete ? 'check-button complete' : 'check-button'} onClick={() => toggleHabit(habit._id)} disabled={savingId === habit._id || !scheduledToday} aria-label={scheduledToday ? `Toggle ${habit.habitName}` : `${habit.habitName} is not scheduled today`}><Check size={18} /></button><div><button className="icon-button" onClick={() => editHabit(habit)} disabled={savingId === habit._id} aria-label={`Edit ${habit.habitName}`}><Pencil size={17} /></button><button className="icon-button danger-button" onClick={() => deleteHabit(habit._id)} disabled={savingId === habit._id} aria-label={`Delete ${habit.habitName}`}><Trash2 size={17} /></button></div></div>
          <h2>{habit.habitName}</h2><span className="habit-schedule-label">{getScheduleLabel(habit.scheduleDays)}{!scheduledToday ? ' · Not scheduled today' : ''}</span><p><Flame size={18} /> {habit.currentStreak} day current streak</p><span>{habit.longestStreak} longest streak</span>
          <div className="habit-week"><strong>{week.completed}/{week.total} scheduled days this week</strong><div className="habit-week-days" aria-label={`${week.completed} of ${week.total} scheduled habit days completed`}>{week.days.map((day) => <span className={`${day.scheduled ? 'scheduled' : ''} ${day.completed ? 'complete' : ''}`} key={day.date} title={`${day.date}: ${day.scheduled ? day.completed ? 'Complete' : 'Scheduled' : 'Not scheduled'}`} />)}</div></div>
          {habit.notificationsEnabled && <small><Bell size={14} /> {habit.reminderTimes.join(', ') || 'Reminder on'}</small>}
        </article>;
      })}
    </section>
  </>;
}
