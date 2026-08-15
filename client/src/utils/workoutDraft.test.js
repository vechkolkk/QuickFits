import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorkoutDraftFromRoutine } from './workoutDraft.js';

const routine = {
  workoutType: 'Upper body',
  exercises: [
    { exerciseName: 'Bench press', sets: 3, reps: 10 },
    { exerciseName: 'Row', sets: '4', reps: '8' }
  ]
};

test('creates a workout draft from a routine', () => {
  const draft = createWorkoutDraftFromRoutine(routine, '2026-08-15');
  assert.equal(draft.workoutName, 'Upper body');
  assert.equal(draft.date, '2026-08-15');
  assert.deepEqual(draft.exercises, [
    { exerciseName: 'Bench press', sets: 3, reps: 10, weight: 0, duration: 0 },
    { exerciseName: 'Row', sets: 4, reps: 8, weight: 0, duration: 0 }
  ]);
});

test('creates independent exercise objects', () => {
  const draft = createWorkoutDraftFromRoutine(routine, '2026-08-15');
  draft.exercises[0].exerciseName = 'Changed';
  assert.equal(routine.exercises[0].exerciseName, 'Bench press');
});
