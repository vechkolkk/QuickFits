import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import { PageHeader } from '../components/PageHeader.jsx';

const blankExercise = { exerciseName: '', sets: 3, reps: 10, weight: 0, duration: 0 };

export function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({
    workoutName: '',
    date: new Date().toISOString().slice(0, 10),
    exercises: [blankExercise],
    notes: ''
  });

  async function loadWorkouts() {
    const { data } = await api.get('/workouts');
    setWorkouts(data.workouts);
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

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post('/workouts', form);
    setForm({ workoutName: '', date: new Date().toISOString().slice(0, 10), exercises: [blankExercise], notes: '' });
    loadWorkouts();
  }

  async function deleteWorkout(id) {
    await api.delete(`/workouts/${id}`);
    loadWorkouts();
  }

  return (
    <>
      <PageHeader title="Workout Log" eyebrow="Training" />
      <section className="panel">
        <h2>Add Workout</h2>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Workout name
            <input value={form.workoutName} onChange={(event) => setForm({ ...form, workoutName: event.target.value })} required />
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          </label>
          <label className="full">
            Notes
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="full exercise-builder">
            {form.exercises.map((exercise, index) => (
              <div className="exercise-row" key={index}>
                <input placeholder="Exercise" value={exercise.exerciseName} onChange={(event) => updateExercise(index, 'exerciseName', event.target.value)} required />
                <input type="number" min="0" value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', Number(event.target.value))} />
                <input type="number" min="0" value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', Number(event.target.value))} />
                <input type="number" min="0" value={exercise.weight} onChange={(event) => updateExercise(index, 'weight', Number(event.target.value))} />
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={() => setForm({ ...form, exercises: [...form.exercises, blankExercise] })}>
              <Plus size={16} /> Add exercise
            </button>
          </div>
          <button type="submit">Save workout</button>
        </form>
      </section>
      <section className="panel">
        <h2>History</h2>
        <div className="list">
          {workouts.map((workout) => (
            <article className="row-item" key={workout._id}>
              <div>
                <strong>{workout.workoutName}</strong>
                <span>{new Date(workout.date).toLocaleDateString()} · {workout.exercises.length} exercises</span>
              </div>
              <button className="icon-button" onClick={() => deleteWorkout(workout._id)} aria-label="Delete workout">
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
