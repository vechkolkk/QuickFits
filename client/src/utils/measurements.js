import { displayLengthToInches, displayWeightToPounds, inchesToDisplayLength, poundsToDisplayWeight } from './preferences.js';

const lengthFields = ['waist', 'chest', 'hips', 'arm'];

export function measurementToForm(measurement, unitSystem) {
  const form = { date: measurement.date.slice(0, 10), weight: '', bodyFat: '', waist: '', chest: '', hips: '', arm: '', notes: measurement.notes || '' };
  if (measurement.weight != null) form.weight = poundsToDisplayWeight(measurement.weight, unitSystem);
  if (measurement.bodyFat != null) form.bodyFat = measurement.bodyFat;
  lengthFields.forEach((field) => {
    if (measurement[field] != null) form[field] = inchesToDisplayLength(measurement[field], unitSystem);
  });
  return form;
}

export function measurementFormToPayload(form, unitSystem) {
  const payload = { date: form.date, notes: form.notes.trim() };
  if (form.weight !== '') payload.weight = displayWeightToPounds(form.weight, unitSystem);
  if (form.bodyFat !== '') payload.bodyFat = Number(form.bodyFat);
  lengthFields.forEach((field) => {
    if (form[field] !== '') payload[field] = displayLengthToInches(form[field], unitSystem);
  });
  return payload;
}
