import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { filterAndSortWorkouts } from '../utils/workoutFilters.js';
import { getDateKeyInTimeZone, getWeightUnit } from '../utils/preferences.js';
import { createWorkoutDraftFromRoutine } from '../utils/workoutDraft.js';
import { createSet, expandExerciseSets, getExerciseHistory, serializeExerciseSets } from '../utils/workoutSets.js';

function newExercise() {
  return { exerciseName: '', duration: 0, setDetails: [createSet()] };
}

function initialForm(timezone = 'UTC') {
  return {
    workoutName: '',
    date: getDateKeyInTimeZone(new Date(), timezone),
    exercises: [newExercise()],
    notes: ''
  };
}

function toDateInputValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function normalizeWorkoutPayload(form, unitSystem) {
  return {
    ...form,
    workoutName: form.workoutName.trim(),
    notes: form.notes.trim(),
    exercises: form.exercises.map((exercise) => serializeExerciseSets(exercise, unitSystem))
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

  const hasMissingSets = form.exercises.some((exercise) => exercise.setDetails.length === 0);
  if (hasMissingSets) return 'Every exercise needs at least one set.';

  const hasInvalidNumber = form.exercises.some((exercise) =>
    Number(exercise.duration) < 0 || exercise.setDetails.some((set) => Number(set.reps) < 0 || Number(set.weight) < 0)
  );

  if (hasInvalidNumber) {
    return 'Reps, weight, and duration cannot be negative.';
  }

  return '';
}

export function Workouts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const unitSystem = user.unitSystem || 'imperial';
  const weightUnit = getWeightUnit(unitSystem);
  const routineDraft = location.state?.routine;
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(() => routineDraft
    ? createWorkoutDraftFromRoutine(routineDraft, getDateKeyInTimeZone(new Date(), user.timezone || 'UTC'))
    : initialForm(user.timezone || 'UTC'));
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [filters, setFilters] = useState({ query: '', startDate: '', endDate: '', sort: 'newest' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(routineDraft ? 'Routine loaded. Add weight or duration, then save your workout.' : '');

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

  useEffect(() => {
    if (routineDraft) {
      navigate('/workouts', { replace: true, state: null });
    }
  }, [navigate, routineDraft]);

  useEffect(() => {
    setVisibleCount(10);
  }, [filters]);

  function updateExercise(index, field, value) {
    const exercises = form.exercises.map((exercise, currentIndex) =>
      currentIndex === index ? { ...exercise, [field]: value } : exercise
    );
    setForm({ ...form, exercises });
  }

  function addExercise() {
    setForm({ ...form, exercises: [...form.exercises, newExercise()] });
  }

  function updateSet(exerciseIndex, setIndex, field, value) {
    setForm({
      ...form,
      exercises: form.exercises.map((exercise, currentExerciseIndex) => currentExerciseIndex === exerciseIndex
        ? { ...exercise, setDetails: exercise.setDetails.map((set, currentSetIndex) => currentSetIndex === setIndex ? { ...set, [field]: value } : set) }
        : exercise)
    });
  }

  function addSet(exerciseIndex) {
    setForm({
      ...form,
      exercises: form.exercises.map((exercise, index) => index === exerciseIndex
        ? { ...exercise, setDetails: [...exercise.setDetails, { ...exercise.setDetails.at(-1) }] }
        : exercise)
    });
  }

  function removeSet(exerciseIndex, setIndex) {
    setForm({
      ...form,
      exercises: form.exercises.map((exercise, index) => index === exerciseIndex
        ? { ...exercise, setDetails: exercise.setDetails.filter((_, currentSetIndex) => currentSetIndex !== setIndex) }
        : exercise)
    });
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
    setForm(initialForm(user.timezone || 'UTC'));
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
      exercises: workout.exercises.map((exercise) => expandExerciseSets(exercise, unitSystem))
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

    const payload = normalizeWorkoutPayload(form, unitSystem);

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
    const workout = workouts.find((item) => item._id === id);
    if (!window.confirm(`Delete “${workout?.workoutName || 'this workout'}”?`)) return;

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

  const filteredWorkouts = useMemo(() => {
    return filterAndSortWorkouts(workouts, filters);
  }, [filters, workouts]);

  const visibleWorkouts = filteredWorkouts.slice(0, visibleCount);
  const hasActiveFilters = Boolean(filters.query || filters.startDate || filters.endDate);

  function clearFilters() {
    setFilters({ query: '', startDate: '', endDate: '', sort: 'newest' });
  }

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
            {form.exercises.map((exercise, exerciseIndex) => {
              const exerciseHistory = getExerciseHistory(workouts, exercise.exerciseName, unitSystem);
              return (
                <section className="set-exercise-card" key={exerciseIndex}>
                  <div className="set-exercise-heading">
                    <label>Exercise<input placeholder="Bench press" value={exercise.exerciseName} onChange={(event) => updateExercise(exerciseIndex, 'exerciseName', event.target.value)} required /></label>
                    <label>Duration (min)<input type="number" min="0" value={exercise.duration} onChange={(event) => updateExercise(exerciseIndex, 'duration', Number(event.target.value))} /></label>
                    <button type="button" className="icon-button danger-button" onClick={() => removeExercise(exerciseIndex)} disabled={form.exercises.length === 1} aria-label={`Remove exercise ${exerciseIndex + 1}`}><Trash2 size={17} /></button>
                  </div>
                  <div className="set-table-header" aria-hidden="true"><span>Set</span><span>Reps</span><span>Weight ({weightUnit})</span><span>Remove</span></div>
                  {exercise.setDetails.map((set, setIndex) => (
                    <div className="set-row" key={setIndex}>
                      <strong>{setIndex + 1}</strong>
                      <label><span className="mobile-field-label">Reps</span><input aria-label={`Exercise ${exerciseIndex + 1} set ${setIndex + 1} reps`} type="number" min="0" value={set.reps} onChange={(event) => updateSet(exerciseIndex, setIndex, 'reps', Number(event.target.value))} /></label>
                      <label><span className="mobile-field-label">Weight ({weightUnit})</span><input aria-label={`Exercise ${exerciseIndex + 1} set ${setIndex + 1} weight in ${weightUnit}`} type="number" min="0" step="0.1" value={set.weight} onChange={(event) => updateSet(exerciseIndex, setIndex, 'weight', Number(event.target.value))} /></label>
                      <button type="button" className="icon-button danger-button" onClick={() => removeSet(exerciseIndex, setIndex)} disabled={exercise.setDetails.length === 1} aria-label={`Remove set ${setIndex + 1}`}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" className="secondary-button" onClick={() => addSet(exerciseIndex)}><Plus size={16} /> Add set</button>
                  {exerciseHistory.length > 0 && (
                    <div className="exercise-history-preview">
                      <strong>Recent performance</strong>
                      {exerciseHistory.map((session) => <span key={session.workoutId}>{new Date(session.date).toLocaleDateString()}: {session.sets.map((set) => `${set.weight}${weightUnit} × ${set.reps}`).join(', ')}</span>)}
                    </div>
                  )}
                </section>
              );
            })}
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
          <div>
            <h2>History</h2>
            <p>Find workouts by name, exercise, or date.</p>
          </div>
          <span className="muted-label">Showing {visibleWorkouts.length} of {filteredWorkouts.length}</span>
        </div>
        <div className="workout-filters" role="search" aria-label="Filter workout history">
          <label className="workout-search">
            Search
            <span className="search-input-wrap">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Workout or exercise"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
            </span>
          </label>
          <label>
            From
            <input
              type="date"
              max={filters.endDate || undefined}
              value={filters.startDate}
              onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
            />
          </label>
          <label>
            To
            <input
              type="date"
              min={filters.startDate || undefined}
              value={filters.endDate}
              onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
            />
          </label>
          <label>
            Sort
            <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          {hasActiveFilters && (
            <button type="button" className="ghost-inline-button clear-workout-filters" onClick={clearFilters}>
              <X size={16} /> Clear filters
            </button>
          )}
        </div>
        <div className="list">
          {workouts.length === 0 ? (
            <p className="empty">No workouts logged yet.</p>
          ) : filteredWorkouts.length === 0 ? (
            <div className="workout-empty-state">
              <Search size={24} aria-hidden="true" />
              <strong>No workouts match your filters</strong>
              <span>Try a different search term or date range.</span>
              <button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>
            </div>
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
                  {workout.exercises.map((exercise, index) => {
                    const sets = expandExerciseSets(exercise, unitSystem).setDetails;
                    return (
                      <li key={`${workout._id}-${exercise.exerciseName}-${index}`}>
                        <strong>{exercise.exerciseName}</strong>
                        <span>{sets.map((set) => `${set.weight} ${weightUnit} × ${set.reps}`).join(' · ')}{exercise.duration > 0 ? ` · ${exercise.duration} min` : ''}</span>
                      </li>
                    );
                  })}
                </ul>
                {workout.notes && <p className="workout-notes">{workout.notes}</p>}
              </article>
            ))
          )}
          {visibleCount < filteredWorkouts.length && (
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
