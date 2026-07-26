import { daysBetween, toDateKey } from './dates.js';

export function normalizeCompletedDates(completedDates = []) {
  return [...new Set(completedDates.map((date) => toDateKey(date)))].sort();
}

export function calculateHabitStreaks(completedDates, referenceDate = new Date()) {
  const dates = normalizeCompletedDates(completedDates);

  if (dates.length === 0) {
    return { completedDates: dates, currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) {
      streak += 1;
    } else {
      streak = 1;
    }

    longestStreak = Math.max(longestStreak, streak);
  }

  const today = toDateKey(referenceDate);
  const yesterday = toDateKey(new Date(referenceDate).getTime() - 86400000);
  const latest = dates[dates.length - 1];
  const currentStreak = latest === today || latest === yesterday ? streak : 0;

  return { completedDates: dates, currentStreak, longestStreak };
}

export function getHabitWeekSummary(completedDates, referenceDate = new Date()) {
  const dates = new Set(normalizeCompletedDates(completedDates));
  const today = new Date(referenceDate);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (6 - index));
    const dateKey = toDateKey(date);

    return {
      date: dateKey,
      completed: dates.has(dateKey)
    };
  });

  return {
    completed: days.filter((day) => day.completed).length,
    total: days.length,
    days
  };
}
