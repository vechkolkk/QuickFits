import assert from 'node:assert/strict';
import test from 'node:test';
import { filterAndSortWorkouts } from './workoutFilters.js';

const workouts = [
  {
    _id: '1',
    workoutName: 'Push Day',
    date: '2026-08-10T12:00:00.000Z',
    exercises: [{ exerciseName: 'Bench Press' }]
  },
  {
    _id: '2',
    workoutName: 'Leg Day',
    date: '2026-08-12T12:00:00.000Z',
    exercises: [{ exerciseName: 'Back Squat' }]
  },
  {
    _id: '3',
    workoutName: 'Conditioning',
    date: '2026-08-14T12:00:00.000Z',
    exercises: [{ exerciseName: 'Rowing' }]
  }
];

const defaultFilters = { query: '', startDate: '', endDate: '', sort: 'newest' };

test('searches workout names without matching case', () => {
  const result = filterAndSortWorkouts(workouts, { ...defaultFilters, query: 'push' });
  assert.deepEqual(result.map((workout) => workout._id), ['1']);
});

test('searches exercise names', () => {
  const result = filterAndSortWorkouts(workouts, { ...defaultFilters, query: 'squat' });
  assert.deepEqual(result.map((workout) => workout._id), ['2']);
});

test('includes workouts on both date-range boundaries', () => {
  const result = filterAndSortWorkouts(workouts, {
    ...defaultFilters,
    startDate: '2026-08-10',
    endDate: '2026-08-12'
  });
  assert.deepEqual(result.map((workout) => workout._id), ['2', '1']);
});

test('sorts workouts oldest first', () => {
  const result = filterAndSortWorkouts(workouts, { ...defaultFilters, sort: 'oldest' });
  assert.deepEqual(result.map((workout) => workout._id), ['1', '2', '3']);
});

test('returns an empty list when no workouts match', () => {
  const result = filterAndSortWorkouts(workouts, { ...defaultFilters, query: 'deadlift' });
  assert.deepEqual(result, []);
});
