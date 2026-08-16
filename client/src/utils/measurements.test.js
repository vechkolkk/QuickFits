import assert from 'node:assert/strict';
import test from 'node:test';
import { measurementFormToPayload, measurementToForm } from './measurements.js';

test('converts metric measurement forms to canonical storage units', () => {
  const payload = measurementFormToPayload({ date: '2026-08-15', weight: '100', bodyFat: '20', waist: '81.3', chest: '', hips: '', arm: '', notes: ' check ' }, 'metric');
  assert.equal(payload.weight, 220.5);
  assert.equal(payload.waist, 32);
  assert.equal(payload.notes, 'check');
  assert.equal('chest' in payload, false);
});

test('converts stored measurements back to display units', () => {
  const form = measurementToForm({ date: '2026-08-15T00:00:00.000Z', weight: 220.5, waist: 32, notes: '' }, 'metric');
  assert.equal(form.weight, 100);
  assert.equal(form.waist, 81.3);
});
