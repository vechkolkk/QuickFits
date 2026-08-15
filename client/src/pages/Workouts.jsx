import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';

function newExercise() {
  return { exerciseName: '', sets: 3, reps: 10, weight: 0, duration: 0 };
}

function initialForm() {
  return {
    workoutName: '',
    date: new Date().toISOString().slice(0, 10),
    exercises: [newExercise()],
    notes: ''
  };
}

function toDateInputValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function normalizeWorkoutPayload(form) {
  return {
    ...form,
    workoutName: form.workoutName.trim(),
    notes: form.notes.trim(),
    exercises: form.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName.trim(),
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      weight: Number(exercise.weight),
      duration: Number(exercise.duration)
    }))
  };
}

function validateWorkout(form) {
  if (!form.workoutName.trim()) {
    return 'Workout name is required.';
  }

  if (form.exercises.length === 0) {
    return 'Add at least one exercise.';
  }

  if (form.exercises.some((exercise) => !exercise.exerciseName.trim())) {
    return 'Every exercise needs a name.';
  }

  const hasInvalidNumber = form.exercises.some((exercise) =>
    ['sets', 'reps', 'weight', 'duration'].some((field) => Number(exercise[field]) < 0)
  );

  if (hasInvalidNumber) {
    return 'Sets, reps, weight, and duration cannot be negative.';
  }

  return '';
}

export function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadWorkouts() {
    try {
      const { data } = await api.get('/workouts');
      setWorkouts(data.workouts);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadWorkouts();
  }, []);

  function updateExercise(index, field, value) {
    const exercises = form.exercises.map((exercise, currentIndex) =>
      currentIndex === index ? { ...exercise, [field]: value } : exercise
    );
    setForm({ ...form, exercises });
  }

  function addExercise() {
    setForm({ ...form, exercises: [...form.exercises, newExercise()] });
  }

  function removeExercise(index) {
    if (form.exercises.length === 1) {
      setError('A workout needs at least one exercise.');
      return;
    }

    setError('');
    setForm({ ...form, exercises: form.exercises.filter((exercise, currentIndex) => currentIndex !== index) });
  }

  function resetForm() {
    setForm(initialForm());
    setEditingId(null);
    setError('');
  }

  function startEditing(workout) {
    setEditingId(workout._id);
    setError('');
    setSuccess('');
    setForm({
      workoutName: workout.workoutName,
      date: toDateInputValue(workout.date),
      notes: workout.notes || '',
      exercises: workout.exercises.map((exercise) => ({ ...newExercise(), ...exercise }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateWorkout(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = normalizeWorkoutPayload(form);

    try {
      if (editingId) {
        await api.put(`/workouts/${editingId}`, payload);
        setSuccess('Workout updated.');
      } else {
        await api.post('/workouts', payload);
        setSuccess('Workout saved.');
      }

      resetForm();
      await loadWorkouts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteWorkout(id) {
    setError('');
    setSuccess('');

    try {
      await api.delete(`/workouts/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadWorkouts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const visibleWorkouts = workouts.slice(0, visibleCount);

  return (
    <>
      <PageHeader title="Workout Log" eyebrow="Training" />
      <section className="panel">
        <div className="section-title-row">
          <h2>{editingId ? 'Edit Workout' : 'Add Workout'}</h2>
          {editingId && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              <X size={16} /> Cancel edit
            </button>
          )}
        </div>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Workout name
            <input
              placeholder="Push day"
              value={form.workoutName}
              onChange={(event) => setForm({ ...form, workoutName: event.target.value })}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
            />
          </label>
          <label className="full">
            Notes
            <textarea
              placeholder="How did the workout feel?"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
          <div className="full exercise-builder">
            <div className="exercise-header">
              <span>Exercise</span>
              <span>Sets</span>
              <span>Reps</span>
              <span>Weight</span>
              <span>Duration</span>
              <span>Remove</span>
            </div>
            {form.exercises.map((exercise, index) => (
              <div className="exercise-row" key={index}>
                <input
                  aria-label={`Exercise ${index + 1} name`}
                  placeholder="Bench press"
                  value={exercise.exerciseName}
                  onChange={(event) => updateExercise(index, 'exerciseName', event.target.value)}
                  required
                />
                <input
                  aria-label={`Exercise ${index + 1} sets`}
                  type="number"
                  min="0"
                  placeholder="3"
                  value={exercise.sets}
                  onChange={(event) => updateExercise(index, 'sets', Number(event.target.value))}
                />
                <input
                  aria-label={`Exercise ${index + 1} reps`}
                  type="number"
                  min="0"
                  placeholder="10"
                  value={exercise.reps}
                  onChange={(event) => updateExercise(index, 'reps', Number(event.target.value))}
                />
                <input
                  aria-label={`Exercise ${index + 1} weight`}
                  type="number"
                  min="0"
                  placeholder="135"
                  value={exercise.weight}
                  onChange={(event) => updateExercise(index, 'weight', Number(event.target.value))}
                />
                <input
                  aria-label={`Exercise ${index + 1} duration`}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={exercise.duration}
                  onChange={(event) => updateExercise(index, 'duration', Number(event.target.value))}
                />
                <button
                  type="button"
                  className="icon-button danger-button"
                  onClick={() => removeExercise(index)}
                  disabled={form.exercises.length === 1}
                  aria-label={`Remove exercise ${index + 1}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={addExercise}>
              <Plus size={16} /> Add exercise
            </button>
          </div>
          {error && <p className="error full">{error}</p>}
          {success && <p className="success full">{success}</p>}
          <button type="submit">{editingId ? 'Update workout' : 'Save workout'}</button>
        </form>
      </section>
      <section className="panel">
        <div className="section-title-row">
          <h2>History</h2>
          <span className="muted-label">Showing {visibleWorkouts.length} of {workouts.length}</span>
        </div>
        <div className="list">
          {visibleWorkouts.length === 0 ? (
            <p className="empty">No workouts logged yet.</p>
          ) : (
            visibleWorkouts.map((workout) => (
              <article className="workout-history-card" key={workout._id}>
                <div className="workout-history-top">
                  <div>
                    <strong>{workout.workoutName}</strong>
                    <span>{new Date(workout.date).toLocaleDateString()} - {workout.exercises.length} exercises</span>
                  </div>
                  <div className="history-actions">
                    <button className="icon-button" onClick={() => startEditing(workout)} aria-label="Edit workout">
                      <Pencil size={17} />
                    </button>
                    <button className="icon-button danger-button" onClick={() => deleteWorkout(workout._id)} aria-label="Delete workout">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <ul className="exercise-summary-list">
                  {workout.exercises.map((exercise, index) => (
                    <li key={`${workout._id}-${exercise.exerciseName}-${index}`}>
                      <strong>{exercise.exerciseName}</strong>
                      <span>
                        {exercise.sets} sets x {exercise.reps} reps
                        {exercise.weight > 0 ? ` @ ${exercise.weight} lb` : ''}
                        {exercise.duration > 0 ? ` - ${exercise.duration} min` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                {workout.notes && <p className="workout-notes">{workout.notes}</p>}
              </article>
            ))
          )}
          {visibleCount < workouts.length && (
            <button type="button" className="secondary-button" onClick={() => setVisibleCount(visibleCount + 10)}>
              Show more workouts
            </button>
          )}
          {visibleCount > 10 && (
            <button type="button" className="ghost-inline-button" onClick={() => setVisibleCount(10)}>
              Show latest 10
            </button>
          )}
        </div>
      </section>
    </>
  );
}
