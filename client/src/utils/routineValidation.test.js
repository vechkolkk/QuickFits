import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRoutine } from './routineValidation.js';

const validRoutine = {
  day: 'Monday',
  workoutType: 'Upper body',
  exercises: [{ exerciseName: 'Bench press', sets: 3, reps: 10 }]
};

test('accepts a complete routine', () => {
  assert.equal(validateRoutine(validRoutine), '');
});

test('requires a workout type', () => {
  assert.equal(validateRoutine({ ...validRoutine, workoutType: ' ' }), 'Workout type is required.');
});

test('requires at least one exercise', () => {
  assert.equal(validateRoutine({ ...validRoutine, exercises: [] }), 'Add at least one exercise.');
});

test('rejects exercises without names', () => {
  const exercises = [{ exerciseName: ' ', sets: 3, reps: 10 }];
  assert.equal(validateRoutine({ ...validRoutine, exercises }), 'Every exercise needs a name.');
});

test('rejects negative sets and reps', () => {
  const exercises = [{ exerciseName: 'Bench press', sets: -1, reps: 10 }];
  assert.equal(validateRoutine({ ...validRoutine, exercises }), 'Sets and reps cannot be negative.');
});
