import assert from 'node:assert/strict';
import test from 'node:test';
import { displayWeightToPounds, getDateKeyInTimeZone, getWeightUnit, poundsToDisplayWeight } from './preferences.js';

test('creates date keys in the selected timezone', () => {
  const instant = '2026-08-16T02:00:00.000Z';
  assert.equal(getDateKeyInTimeZone(instant, 'America/Toronto'), '2026-08-15');
  assert.equal(getDateKeyInTimeZone(instant, 'UTC'), '2026-08-16');
});

test('converts stored pounds for metric display and back', () => {
  assert.equal(poundsToDisplayWeight(220.5, 'metric'), 100);
  assert.equal(displayWeightToPounds(100, 'metric'), 220.5);
});

test('leaves imperial weights unchanged', () => {
  assert.equal(poundsToDisplayWeight(135, 'imperial'), 135);
  assert.equal(displayWeightToPounds(135, 'imperial'), 135);
  assert.equal(getWeightUnit('imperial'), 'lb');
  assert.equal(getWeightUnit('metric'), 'kg');
});
