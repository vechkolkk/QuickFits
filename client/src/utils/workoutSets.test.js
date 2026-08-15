import assert from 'node:assert/strict';
import test from 'node:test';
import { expandExerciseSets, getExerciseHistory, serializeExerciseSets } from './workoutSets.js';

test('expands legacy aggregate exercise data into individual sets', () => {
  const exercise = { exerciseName: 'Squat', sets: 2, reps: 5, weight: 220.5, duration: 0 };
  assert.deepEqual(expandExerciseSets(exercise, 'metric').setDetails, [
    { reps: 5, weight: 100 }, { reps: 5, weight: 100 }
  ]);
});

test('serializes individual sets with aggregate compatibility fields', () => {
  const exercise = { exerciseName: 'Squat', duration: 0, setDetails: [{ reps: 8, weight: 100 }, { reps: 6, weight: 110 }] };
  const result = serializeExerciseSets(exercise, 'imperial');
  assert.equal(result.sets, 2);
  assert.equal(result.reps, 8);
  assert.equal(result.weight, 110);
});

test('returns latest matching exercise sessions', () => {
  const workouts = [
    { _id: '1', date: '2026-08-10', exercises: [{ exerciseName: 'Row', sets: 1, reps: 10, weight: 50 }] },
    { _id: '2', date: '2026-08-12', exercises: [{ exerciseName: 'row', setDetails: [{ reps: 8, weight: 60 }] }] }
  ];
  assert.deepEqual(getExerciseHistory(workouts, 'ROW', 'imperial').map((item) => item.workoutId), ['2', '1']);
});
