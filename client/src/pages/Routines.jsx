import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Dumbbell, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { validateRoutine } from '../utils/routineValidation.js';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function newExercise() {
  return { exerciseName: '', sets: 3, reps: 10 };
}

function initialForm() {
  return { day: 'Monday', workoutType: '', exercises: [newExercise()] };
}

function normalizeRoutine(form) {
  return {
    ...form,
    workoutType: form.workoutType.trim(),
    exercises: form.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName.trim(),
      sets: Number(exercise.sets),
      reps: Number(exercise.reps)
    }))
  };
}

export function Routines() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadRoutines() {
    try {
      const { data } = await api.get('/routines');
      setRoutines(data.routines);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadRoutines();
  }, []);

  const orderedRoutines = useMemo(() => (
    [...routines].sort((first, second) => days.indexOf(first.day) - days.indexOf(second.day))
  ), [routines]);

  function updateExercise(index, field, value) {
    setForm({
      ...form,
      exercises: form.exercises.map((exercise, currentIndex) =>
        currentIndex === index ? { ...exercise, [field]: value } : exercise
      )
    });
  }

  function addExercise() {
    setForm({ ...form, exercises: [...form.exercises, newExercise()] });
  }

  function removeExercise(index) {
    if (form.exercises.length === 1) {
      setError('A routine needs at least one exercise.');
      return;
    }
    setError('');
    setForm({ ...form, exercises: form.exercises.filter((_, currentIndex) => currentIndex !== index) });
  }

  function resetForm() {
    setForm(initialForm());
    setEditingId('');
    setError('');
  }

  function startEditing(routine) {
    setEditingId(routine._id);
    setError('');
    setSuccess('');
    setForm({
      day: routine.day,
      workoutType: routine.workoutType,
      exercises: routine.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps
      }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startWorkout(routine) {
    navigate('/workouts', {
      state: {
        routine: {
          workoutType: routine.workoutType,
          exercises: routine.exercises
        }
      }
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validateRoutine(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      const payload = normalizeRoutine(form);

      if (editingId) {
        await api.put(`/routines/${editingId}`, payload);
        setSuccess('Routine updated.');
      } else {
        await api.post('/routines', payload);
        setSuccess('Routine saved.');
      }

      resetForm();
      await loadRoutines();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRoutine(id) {
    const routine = routines.find((item) => item._id === id);
    if (!window.confirm(`Delete the ${routine?.day || ''} ${routine?.workoutType || 'routine'}?`.replace('  ', ' '))) return;

    setError('');
    setSuccess('');

    try {
      setDeletingId(id);
      await api.delete(`/routines/${id}`);
      if (editingId === id) resetForm();
      await loadRoutines();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId('');
    }
  }

  return (
    <>
      <PageHeader title="Routine Builder" eyebrow="Weekly plan" />
      <section className="panel">
        <div className="section-title-row">
          <div>
            <h2>{editingId ? 'Edit Routine' : 'Create Routine'}</h2>
            <p>Plan at least one exercise for a day of the week.</p>
          </div>
          {editingId && (
            <button type="button" className="secondary-button" onClick={resetForm} disabled={isSaving}>
              <X size={16} /> Cancel edit
            </button>
          )}
        </div>
        <form className="grid-form routine-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="full day-picker">
            <legend>Training day</legend>
            <div role="group" aria-label="Training day">
              {days.map((day) => (
                <button
                  type="button"
                  className={form.day === day ? 'day-button selected' : 'day-button'}
                  aria-pressed={form.day === day}
                  onClick={() => setForm({ ...form, day })}
                  key={day}
                >
                  <span>{day.slice(0, 3)}</span>
                  <small>{day}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="full">
            Workout type
            <input
              placeholder="Upper body, cardio, mobility..."
              value={form.workoutType}
              onChange={(event) => setForm({ ...form, workoutType: event.target.value })}
              required
            />
          </label>
          <div className="full exercise-builder routine-exercise-builder">
            <div className="routine-exercise-header" aria-hidden="true">
              <span>Exercise</span><span>Sets</span><span>Reps</span><span>Remove</span>
            </div>
            {form.exercises.map((exercise, index) => (
              <div className="routine-row" key={index}>
                <label>
                  <span className="mobile-field-label">Exercise</span>
                  <input aria-label={`Exercise ${index + 1} name`} placeholder="Exercise name" value={exercise.exerciseName} onChange={(event) => updateExercise(index, 'exerciseName', event.target.value)} required />
                </label>
                <label>
                  <span className="mobile-field-label">Sets</span>
                  <input aria-label={`Exercise ${index + 1} sets`} type="number" min="0" value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', Number(event.target.value))} />
                </label>
                <label>
                  <span className="mobile-field-label">Reps</span>
                  <input aria-label={`Exercise ${index + 1} reps`} type="number" min="0" value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', Number(event.target.value))} />
                </label>
                <button type="button" className="icon-button danger-button" onClick={() => removeExercise(index)} disabled={form.exercises.length === 1} aria-label={`Remove exercise ${index + 1}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={addExercise}>
              <Plus size={16} /> Add exercise
            </button>
          </div>
          {error && <p className="error full" role="alert">{error}</p>}
          {success && <p className="success full" role="status">{success}</p>}
          <button type="submit" disabled={isSaving}>
            {isSaving ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update routine' : 'Save routine')}
          </button>
        </form>
      </section>
      <section className="routine-grid">
        {orderedRoutines.length === 0 ? (
          <article className="routine-card routine-empty-card">
            <CalendarDays size={26} />
            <h2>No routines planned</h2>
            <p>Create your first routine to map out the week.</p>
          </article>
        ) : orderedRoutines.map((routine) => {
          const isDeleting = deletingId === routine._id;
          return (
            <article className="routine-card" key={routine._id}>
              <div className="routine-card-header">
                <span className="routine-day">{routine.day}</span>
                <div className="history-actions">
                  <button className="icon-button" onClick={() => startEditing(routine)} disabled={isDeleting || isSaving} aria-label={`Edit ${routine.day} routine`}>
                    <Pencil size={17} />
                  </button>
                  <button className="icon-button danger-button" onClick={() => deleteRoutine(routine._id)} disabled={isDeleting || isSaving} aria-label={`Delete ${routine.day} routine`}>
                    {isDeleting ? <span className="button-spinner" aria-hidden="true" /> : <Trash2 size={17} />}
                  </button>
                </div>
              </div>
              <div className="routine-card-title">
                <h2>{routine.workoutType}</h2>
                <span>{routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'}</span>
              </div>
              <ul>
                {routine.exercises.map((exercise, index) => (
                  <li key={`${exercise.exerciseName}-${index}`}>
                    <strong>{exercise.exerciseName}</strong>
                    <span>{exercise.sets} sets × {exercise.reps} reps</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="secondary-button routine-start-button"
                onClick={() => startWorkout(routine)}
                disabled={isDeleting || isSaving}
              >
                <Dumbbell size={17} /> Start workout
              </button>
            </article>
          );
        })}
      </section>
    </>
  );
}
