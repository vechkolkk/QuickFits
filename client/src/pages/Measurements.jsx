import React, { useEffect, useState } from 'react';
import { Pencil, Scale, Trash2, X } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { measurementFormToPayload, measurementToForm } from '../utils/measurements.js';
import { getDateKeyInTimeZone, getLengthUnit, getWeightUnit, inchesToDisplayLength, poundsToDisplayWeight } from '../utils/preferences.js';

function blankForm(timezone) {
  return { date: getDateKeyInTimeZone(new Date(), timezone), weight: '', bodyFat: '', waist: '', chest: '', hips: '', arm: '', notes: '' };
}

export function Measurements() {
  const { user } = useAuth();
  const unitSystem = user.unitSystem || 'imperial';
  const weightUnit = getWeightUnit(unitSystem);
  const lengthUnit = getLengthUnit(unitSystem);
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState(() => blankForm(user.timezone || 'UTC'));
  const [editingId, setEditingId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadMeasurements() {
    try { const { data } = await api.get('/measurements'); setMeasurements(data.measurements); }
    catch (err) { setError(getErrorMessage(err)); }
  }

  useEffect(() => { loadMeasurements(); }, []);

  function resetForm() { setForm(blankForm(user.timezone || 'UTC')); setEditingId(''); setError(''); }

  async function submit(event) {
    event.preventDefault(); setError('');
    const payload = measurementFormToPayload(form, unitSystem);
    if (!['weight', 'bodyFat', 'waist', 'chest', 'hips', 'arm'].some((field) => payload[field] !== undefined)) {
      setError('Add at least one measurement.'); return;
    }
    try {
      setIsSaving(true);
      if (editingId) await api.put(`/measurements/${editingId}`, payload);
      else await api.post('/measurements', payload);
      resetForm(); await loadMeasurements();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setIsSaving(false); }
  }

  function edit(item) { setEditingId(item._id); setForm(measurementToForm(item, unitSystem)); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  async function remove(item) {
    if (!window.confirm(`Delete measurements from ${new Date(item.date).toLocaleDateString()}?`)) return;
    try { await api.delete(`/measurements/${item._id}`); await loadMeasurements(); }
    catch (err) { setError(getErrorMessage(err)); }
  }

  const chartData = [...measurements].reverse().filter((item) => item.weight != null).map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: poundsToDisplayWeight(item.weight, unitSystem)
  }));

  function summarize(item) {
    const values = [];
    if (item.weight != null) values.push(`${poundsToDisplayWeight(item.weight, unitSystem)} ${weightUnit}`);
    if (item.bodyFat != null) values.push(`${item.bodyFat}% body fat`);
    [['waist', 'Waist'], ['chest', 'Chest'], ['hips', 'Hips'], ['arm', 'Arm']].forEach(([field, label]) => {
      if (item[field] != null) values.push(`${label} ${inchesToDisplayLength(item[field], unitSystem)} ${lengthUnit}`);
    });
    return values.join(' · ');
  }

  return <>
    <PageHeader title="Body Measurements" eyebrow="Progress" />
    <section className="panel">
      <div className="section-title-row"><div><h2>{editingId ? 'Edit entry' : 'Log measurements'}</h2><p>Track only the metrics that matter to you.</p></div>{editingId && <button className="secondary-button" onClick={resetForm}><X size={16} /> Cancel</button>}</div>
      <form className="grid-form" onSubmit={submit}>
        <label>Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
        <label>Weight ({weightUnit})<input type="number" min="0" step="0.1" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></label>
        <label>Body fat (%)<input type="number" min="0" max="100" step="0.1" value={form.bodyFat} onChange={(event) => setForm({ ...form, bodyFat: event.target.value })} /></label>
        {['waist', 'chest', 'hips', 'arm'].map((field) => <label key={field}>{field[0].toUpperCase() + field.slice(1)} ({lengthUnit})<input type="number" min="0" step="0.1" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}
        <label className="full">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        {error && <p className="error full" role="alert">{error}</p>}
        <button disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Update entry' : 'Save entry'}</button>
      </form>
    </section>
    <section className="panel"><h2>Weight Trend</h2><div className="chart-frame">{chartData.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis domain={['dataMin - 5', 'dataMax + 5']} /><Tooltip /><Line type="monotone" dataKey="weight" name={`Weight (${weightUnit})`} stroke="#166534" strokeWidth={3} /></LineChart></ResponsiveContainer> : <div className="chart-empty"><Scale size={28} /><strong>No weight data yet</strong><span>Log weight to see your trend.</span></div>}</div></section>
    <section className="panel"><h2>Measurement History</h2><div className="measurement-list">{measurements.length ? measurements.map((item) => <article key={item._id}><div><strong>{new Date(item.date).toLocaleDateString()}</strong><span>{summarize(item)}</span></div><div><button className="icon-button" onClick={() => edit(item)} aria-label="Edit measurements"><Pencil size={17} /></button><button className="icon-button danger-button" onClick={() => remove(item)} aria-label="Delete measurements"><Trash2 size={17} /></button></div></article>) : <p className="empty">No measurements logged yet.</p>}</div></section>
  </>;
}
