import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Salad, Trash2, X } from 'lucide-react';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { calculateNutritionTotals, nutritionProgress } from '../utils/nutrition.js';
import { getDateKeyInTimeZone } from '../utils/preferences.js';

const blankEntry = (date) => ({ date, name: '', mealType: 'Breakfast', calories: '', protein: '', carbs: '', fat: '' });

export function Nutrition() {
  const { user, updateProfile } = useAuth();
  const [date, setDate] = useState(() => getDateKeyInTimeZone(new Date(), user.timezone || 'UTC'));
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(() => blankEntry(date));
  const [editingId, setEditingId] = useState('');
  const [goals, setGoals] = useState(user.nutritionGoals || { calories: 2000, protein: 150, carbs: 250, fat: 65 });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [goalsStatus, setGoalsStatus] = useState('');

  const loadEntries = useCallback(async (selectedDate) => {
    try { const { data } = await api.get('/nutrition', { params: { date: selectedDate } }); setEntries(data.entries); }
    catch (err) { setError(getErrorMessage(err)); }
  }, []);
  useEffect(() => { loadEntries(date); }, [date, loadEntries]);

  function changeDate(days) {
    const next = new Date(`${date}T00:00:00.000Z`); next.setUTCDate(next.getUTCDate() + days);
    const key = next.toISOString().slice(0, 10); setDate(key); setForm(blankEntry(key)); setEditingId('');
  }

  async function submit(event) {
    event.preventDefault(); setError(''); setIsSaving(true);
    const payload = { ...form, date, calories: Number(form.calories), protein: Number(form.protein || 0), carbs: Number(form.carbs || 0), fat: Number(form.fat || 0) };
    try {
      if (editingId) await api.put(`/nutrition/${editingId}`, payload); else await api.post('/nutrition', payload);
      setForm(blankEntry(date)); setEditingId(''); await loadEntries(date);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setIsSaving(false); }
  }

  function edit(entry) { setEditingId(entry._id); setForm({ ...entry, date, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat }); }
  async function remove(entry) {
    if (!window.confirm(`Delete “${entry.name}”?`)) return;
    setError(''); setDeletingId(entry._id);
    try { await api.delete(`/nutrition/${entry._id}`); await loadEntries(date); } catch (err) { setError(getErrorMessage(err)); }
    finally { setDeletingId(''); }
  }
  async function saveGoals() {
    setError(''); setGoalsStatus('Saving...');
    try {
      await updateProfile({ nutritionGoals: Object.fromEntries(Object.entries(goals).map(([key, value]) => [key, Number(value)])) });
      setGoalsStatus('Targets saved');
    }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setTimeout(() => setGoalsStatus(''), 2500); }
  }

  const totals = calculateNutritionTotals(entries);
  return <>
    <PageHeader title="Nutrition" eyebrow="Daily fuel" />
    <section className="panel nutrition-date-row"><button className="icon-button" onClick={() => changeDate(-1)} aria-label="Previous day"><ChevronLeft /></button><div><strong>{new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong><span>{date}</span></div><button className="icon-button" onClick={() => changeDate(1)} aria-label="Next day"><ChevronRight /></button></section>
    <section className="nutrition-summary-grid">{['calories', 'protein', 'carbs', 'fat'].map((key) => <article className="stat-card" key={key}><span>{key[0].toUpperCase() + key.slice(1)}</span><strong>{totals[key]}{key !== 'calories' ? 'g' : ''}</strong><small>of {goals[key]}{key !== 'calories' ? 'g' : ''}</small><div className="nutrition-progress"><span style={{ width: `${nutritionProgress(totals[key], goals[key])}%` }} /></div></article>)}</section>
    <section className="panel"><div className="section-title-row"><h2>{editingId ? 'Edit food' : 'Add food'}</h2>{editingId && <button className="secondary-button" onClick={() => { setEditingId(''); setForm(blankEntry(date)); }}><X size={16} /> Cancel</button>}</div><form className="grid-form" onSubmit={submit}><label>Food or meal<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Meal<select value={form.mealType} onChange={(event) => setForm({ ...form, mealType: event.target.value })}>{['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((meal) => <option key={meal}>{meal}</option>)}</select></label>{['calories', 'protein', 'carbs', 'fat'].map((key) => <label key={key}>{key[0].toUpperCase() + key.slice(1)}{key !== 'calories' ? ' (g)' : ''}<input type="number" min="0" step="0.1" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={key === 'calories'} /></label>)}{error && <p className="error full">{error}</p>}<button disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Update food' : 'Add food'}</button></form></section>
    <section className="panel"><h2>Daily entries</h2><div className="nutrition-entry-list">{entries.length ? entries.map((entry) => <article key={entry._id}><div><span>{entry.mealType}</span><strong>{entry.name}</strong><small>{entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat</small></div><strong>{entry.calories} cal</strong><div><button className="icon-button" onClick={() => edit(entry)} disabled={deletingId === entry._id} aria-label={`Edit ${entry.name}`}><Pencil size={17} /></button><button className="icon-button danger-button" onClick={() => remove(entry)} disabled={deletingId === entry._id} aria-label={`Delete ${entry.name}`}><Trash2 size={17} /></button></div></article>) : <div className="chart-empty"><Salad size={28} /><strong>No food logged</strong><span>Add your first meal for this day.</span></div>}</div></section>
    <section className="panel"><h2>Daily targets</h2><div className="nutrition-goals">{Object.keys(goals).map((key) => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<input type="number" min="0" value={goals[key]} onChange={(event) => setGoals({ ...goals, [key]: event.target.value })} /></label>)}<button onClick={saveGoals} disabled={goalsStatus === 'Saving...'}>Save targets</button>{goalsStatus && <span className="success" role="status">{goalsStatus}</span>}</div></section>
  </>;
}
