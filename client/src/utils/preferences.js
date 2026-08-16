const POUNDS_PER_KILOGRAM = 2.2046226218;
const CENTIMETERS_PER_INCH = 2.54;

export function getDateKeyInTimeZone(value = new Date(), timeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function poundsToDisplayWeight(pounds, unitSystem) {
  if (unitSystem !== 'metric') return Number(pounds);
  return Math.round((Number(pounds) / POUNDS_PER_KILOGRAM) * 10) / 10;
}

export function displayWeightToPounds(weight, unitSystem) {
  if (unitSystem !== 'metric') return Number(weight);
  return Math.round(Number(weight) * POUNDS_PER_KILOGRAM * 10) / 10;
}

export function getWeightUnit(unitSystem) {
  return unitSystem === 'metric' ? 'kg' : 'lb';
}

export function inchesToDisplayLength(inches, unitSystem) {
  if (unitSystem !== 'metric') return Number(inches);
  return Math.round(Number(inches) * CENTIMETERS_PER_INCH * 10) / 10;
}

export function displayLengthToInches(length, unitSystem) {
  if (unitSystem !== 'metric') return Number(length);
  return Math.round((Number(length) / CENTIMETERS_PER_INCH) * 10) / 10;
}

export function getLengthUnit(unitSystem) {
  return unitSystem === 'metric' ? 'cm' : 'in';
}
