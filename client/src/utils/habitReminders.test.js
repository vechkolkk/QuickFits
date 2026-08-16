import assert from 'node:assert/strict';
import test from 'node:test';
import { getDueReminders, getScheduleLabel } from './habitReminders.js';

test('describes common habit schedules', () => {
  assert.equal(getScheduleLabel([0, 1, 2, 3, 4, 5, 6]), 'Every day');
  assert.equal(getScheduleLabel([1, 2, 3, 4, 5]), 'Weekdays');
  assert.equal(getScheduleLabel([1, 3, 5]), 'Mon, Wed, Fri');
});

test('returns only due incomplete unsent reminders', () => {
  const habit = { _id: 'h1', notificationsEnabled: true, scheduleDays: [1], reminderTimes: ['09:30'], completedDates: [] };
  const now = new Date(2026, 7, 17, 9, 30);
  assert.equal(getDueReminders([habit], now).length, 1);
  assert.equal(getDueReminders([habit], now, new Set(['h1:2026-08-17:09:30'])).length, 0);
});
