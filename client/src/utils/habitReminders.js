export const WEEKDAYS = [
  { value: 0, short: 'Sun', label: 'Sunday' }, { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' }, { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' }, { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' }
];

export function getScheduleLabel(scheduleDays = []) {
  const days = [...scheduleDays].sort();
  if (days.length === 7) return 'Every day';
  if (days.join(',') === '1,2,3,4,5') return 'Weekdays';
  if (days.join(',') === '0,6') return 'Weekends';
  return WEEKDAYS.filter((day) => days.includes(day.value)).map((day) => day.short).join(', ');
}

export function getDueReminders(habits, now = new Date(), sentKeys = new Set(), timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const day = WEEKDAYS.find((item) => item.short === values.weekday)?.value;
  const time = `${values.hour}:${values.minute}`;
  const date = `${values.year}-${values.month}-${values.day}`;
  return habits.flatMap((habit) => {
    if (!habit.notificationsEnabled || !habit.scheduleDays?.includes(day) || habit.completedDates?.includes(date)) return [];
    return (habit.reminderTimes || []).filter((reminderTime) => reminderTime === time)
      .map((reminderTime) => ({ habit, key: `${habit._id}:${date}:${reminderTime}` }))
      .filter(({ key }) => !sentKeys.has(key));
  });
}
