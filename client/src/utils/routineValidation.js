export function validateRoutine(form) {
  if (!form.workoutType.trim()) return 'Workout type is required.';
  if (form.exercises.length === 0) return 'Add at least one exercise.';
  if (form.exercises.some((exercise) => !exercise.exerciseName.trim())) return 'Every exercise needs a name.';
  if (form.exercises.some((exercise) => Number(exercise.sets) < 0 || Number(exercise.reps) < 0)) {
    return 'Sets and reps cannot be negative.';
  }
  return '';
}
