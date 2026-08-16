import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateHabitStreaks, getHabitWeekSummary } from './streaks.js';

test('counts only scheduled days in a habit week summary', () => {
  const summary = getHabitWeekSummary(['2026-08-10', '2026-08-12'], new Date('2026-08-16T12:00:00Z'), [1, 3, 5]);
  assert.equal(summary.total, 3);
  assert.equal(summary.completed, 2);
  assert.equal(summary.days.filter((day) => day.scheduled).length, 3);
});

test('keeps streaks across consecutive scheduled days', () => {
  const result = calculateHabitStreaks(['2026-08-10', '2026-08-12', '2026-08-14'], new Date('2026-08-15T12:00:00Z'), [1, 3, 5]);
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 3);
});
