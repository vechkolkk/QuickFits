import { daysBetween, toDateKey } from './dates.js';

export function normalizeCompletedDates(completedDates = []) {
  return [...new Set(completedDates.map((date) => toDateKey(date)))].sort();
}

function isScheduled(dateKey, scheduleDays) {
  return scheduleDays.includes(new Date(`${dateKey}T00:00:00.000Z`).getUTCDay());
}

function hasScheduledDayBetween(first, second, scheduleDays) {
  for (let offset = 1; offset < daysBetween(first, second); offset += 1) {
    const date = new Date(`${first}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    if (scheduleDays.includes(date.getUTCDay())) return true;
  }
  return false;
}

export function calculateHabitStreaks(completedDates, referenceDate = new Date(), scheduleDays = [0, 1, 2, 3, 4, 5, 6]) {
  if (!scheduleDays.length) scheduleDays = [0, 1, 2, 3, 4, 5, 6];
  const dates = normalizeCompletedDates(completedDates);
  const scheduledDates = dates.filter((date) => isScheduled(date, scheduleDays));

  if (scheduledDates.length === 0) {
    return { completedDates: dates, currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let streak = 1;

  for (let i = 1; i < scheduledDates.length; i += 1) {
    if (!hasScheduledDayBetween(scheduledDates[i - 1], scheduledDates[i], scheduleDays)) {
      streak += 1;
    } else {
      streak = 1;
    }

    longestStreak = Math.max(longestStreak, streak);
  }

  const today = toDateKey(referenceDate);
  let latestDue = today;
  if (!isScheduled(today, scheduleDays) || scheduledDates.at(-1) !== today) {
    const cursor = new Date(`${today}T00:00:00.000Z`);
    do { cursor.setUTCDate(cursor.getUTCDate() - 1); latestDue = toDateKey(cursor); }
    while (!isScheduled(latestDue, scheduleDays));
  }
  const currentStreak = scheduledDates.at(-1) === latestDue ? streak : 0;

  return { completedDates: dates, currentStreak, longestStreak };
}

export function getHabitWeekSummary(completedDates, referenceDate = new Date(), scheduleDays = [0, 1, 2, 3, 4, 5, 6]) {
  const dates = new Set(normalizeCompletedDates(completedDates));
  const today = new Date(referenceDate);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (6 - index));
    const dateKey = toDateKey(date);

    return {
      date: dateKey,
      completed: dates.has(dateKey),
      scheduled: scheduleDays.includes(date.getUTCDay())
    };
  });

  return {
    completed: days.filter((day) => day.scheduled && day.completed).length,
    total: days.filter((day) => day.scheduled).length,
    days
  };
}
