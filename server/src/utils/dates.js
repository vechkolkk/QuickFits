export function toDateKey(value = new Date(), timeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function startOfWeek(value = new Date(), timeZone = 'UTC') {
  const localDate = new Date(`${toDateKey(value, timeZone)}T00:00:00.000Z`);
  localDate.setUTCDate(localDate.getUTCDate() - localDate.getUTCDay());
  return localDate;
}

export function daysBetween(a, b) {
  const first = new Date(`${toDateKey(a)}T00:00:00.000Z`);
  const second = new Date(`${toDateKey(b)}T00:00:00.000Z`);
  return Math.round((second - first) / 86400000);
}
