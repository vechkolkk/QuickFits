import assert from 'node:assert/strict';
import test from 'node:test';
import { startOfWeek, toDateKey } from './dates.js';

test('returns the calendar date in a supplied timezone', () => {
  const instant = '2026-08-16T02:00:00.000Z';
  assert.equal(toDateKey(instant, 'America/Toronto'), '2026-08-15');
  assert.equal(toDateKey(instant, 'UTC'), '2026-08-16');
});

test('finds Sunday at the start of the local week', () => {
  const instant = '2026-08-18T02:00:00.000Z';
  assert.equal(toDateKey(startOfWeek(instant, 'America/Toronto')), '2026-08-16');
});
