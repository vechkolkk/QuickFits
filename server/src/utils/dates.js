export function toDateKey(value = new Date()) {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(value = new Date()) {
  const date = new Date(value);
  const day = date.getUTCDay();
  const diff = date.getUTCDate() - day;
  date.setUTCDate(diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function daysBetween(a, b) {
  const first = new Date(`${toDateKey(a)}T00:00:00.000Z`);
  const second = new Date(`${toDateKey(b)}T00:00:00.000Z`);
  return Math.round((second - first) / 86400000);
}
