import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const blankExercise = { exerciseName: '', sets: 3, reps: 10 };

export function Routines() {
  const [routines, setRoutines] = useState([]);
  const [form, setForm] = useState({ day: 'Monday', workoutType: '', exercises: [blankExercise] });

  async function loadRoutines() {
    const { data } = await api.get('/routines');
    setRoutines(data.routines);
  }

  useEffect(() => {
    loadRoutines();
  }, []);

  function updateExercise(index, field, value) {
    setForm({
      ...form,
      exercises: form.exercises.map((exercise, currentIndex) =>
        currentIndex === index ? { ...exercise, [field]: value } : exercise
      )
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post('/routines', form);
    setForm({ day: 'Monday', workoutType: '', exercises: [blankExercise] });
    loadRoutines();
  }

  async function deleteRoutine(id) {
    await api.delete(`/routines/${id}`);
    loadRoutines();
  }

  return (
    <>
      <PageHeader title="Routine Builder" eyebrow="Weekly plan" />
      <section className="panel">
        <h2>Create Routine</h2>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Day
            <select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>
              {days.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>
          <label>
            Workout type
            <input value={form.workoutType} onChange={(event) => setForm({ ...form, workoutType: event.target.value })} required />
          </label>
          <div className="full exercise-builder">
            {form.exercises.map((exercise, index) => (
              <div className="routine-row" key={index}>
                <input placeholder="Exercise" value={exercise.exerciseName} onChange={(event) => updateExercise(index, 'exerciseName', event.target.value)} required />
                <input type="number" min="0" value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', Number(event.target.value))} />
                <input type="number" min="0" value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', Number(event.target.value))} />
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={() => setForm({ ...form, exercises: [...form.exercises, blankExercise] })}>
              <Plus size={16} /> Add exercise
            </button>
          </div>
          <button type="submit">Save routine</button>
        </form>
      </section>
      <section className="routine-grid">
        {routines.map((routine) => (
          <article className="routine-card" key={routine._id}>
            <div>
              <span>{routine.day}</span>
              <button className="icon-button" onClick={() => deleteRoutine(routine._id)} aria-label="Delete routine">
                <Trash2 size={17} />
              </button>
            </div>
            <h2>{routine.workoutType}</h2>
            <ul>
              {routine.exercises.map((exercise, index) => (
                <li key={`${exercise.exerciseName}-${index}`}>{exercise.exerciseName} · {exercise.sets}x{exercise.reps}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
