import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateProgressMetrics } from './progress.js';

const workouts = [{
  date: '2026-08-15',
  exercises: [
    { exerciseName: 'Bench Press', setDetails: [{ reps: 10, weight: 100 }, { reps: 5, weight: 120 }] },
    { exerciseName: 'Row', sets: 2, reps: 8, weight: 80 }
  ]
}];

test('calculates volume, sets, and exercise totals', () => {
  const result = calculateProgressMetrics(workouts);
  assert.equal(result.totalVolume, 2880);
  assert.equal(result.totalSets, 4);
  assert.equal(result.exercisesTracked, 2);
});

test('calculates personal records from individual sets', () => {
  const bench = calculateProgressMetrics(workouts).personalRecords.find((item) => item.exerciseName === 'Bench Press');
  assert.equal(bench.maxWeight, 120);
  assert.equal(bench.bestEstimated1RM, 140);
  assert.equal(bench.bestSetVolume, 1000);
});

test('returns an empty result without workouts', () => {
  assert.deepEqual(calculateProgressMetrics([]), { totalVolume: 0, totalSets: 0, exercisesTracked: 0, personalRecords: [], volumeByWeek: [] });
});
