import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRecentActivity } from './activity.js';

const workouts = [
  { _id: 'w1', workoutName: 'Push Day', date: '2026-08-12T00:00:00.000Z', exercises: [{}, {}] },
  { _id: 'w2', workoutName: 'Run', date: '2026-08-15T00:00:00.000Z', exercises: [{}] }
];

const habits = [
  { _id: 'h1', habitName: 'Drink water', completedDates: ['2026-08-13', '2026-08-14'] }
];

test('combines workout and habit activity newest first', () => {
  const activity = buildRecentActivity(workouts, habits);
  assert.deepEqual(activity.map((item) => item.id), [
    'workout-w2',
    'habit-h1-2026-08-14',
    'habit-h1-2026-08-13',
    'workout-w1'
  ]);
});

test('provides navigation targets for each activity type', () => {
  const activity = buildRecentActivity(workouts, habits);
  assert.equal(activity.find((item) => item.type === 'workout').href, '/workouts');
  assert.equal(activity.find((item) => item.type === 'habit').href, '/habits');
});

test('uses singular and plural exercise descriptions', () => {
  const activity = buildRecentActivity(workouts, []);
  assert.equal(activity.find((item) => item.id === 'workout-w2').description, '1 exercise');
  assert.equal(activity.find((item) => item.id === 'workout-w1').description, '2 exercises');
});

test('limits the number of returned items', () => {
  assert.equal(buildRecentActivity(workouts, habits, 2).length, 2);
});

test('returns an empty feed for a new user', () => {
  assert.deepEqual(buildRecentActivity([], []), []);
});
