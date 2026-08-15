import { displayWeightToPounds, poundsToDisplayWeight } from './preferences.js';

export function createSet(reps = 10, weight = 0) {
  return { reps: Number(reps), weight: Number(weight) };
}

export function expandExerciseSets(exercise, unitSystem) {
  const storedSets = exercise.setDetails?.length
    ? exercise.setDetails
    : Array.from({ length: Math.max(1, Number(exercise.sets) || 1) }, () => createSet(exercise.reps, exercise.weight));

  return {
    exerciseName: exercise.exerciseName,
    duration: Number(exercise.duration) || 0,
    setDetails: storedSets.map((set) => createSet(set.reps, poundsToDisplayWeight(set.weight, unitSystem)))
  };
}

export function serializeExerciseSets(exercise, unitSystem) {
  const setDetails = exercise.setDetails.map((set) => ({
    reps: Number(set.reps),
    weight: displayWeightToPounds(set.weight, unitSystem)
  }));

  return {
    exerciseName: exercise.exerciseName.trim(),
    sets: setDetails.length,
    reps: Math.max(...setDetails.map((set) => set.reps)),
    weight: Math.max(...setDetails.map((set) => set.weight)),
    duration: Number(exercise.duration),
    setDetails
  };
}

export function getExerciseHistory(workouts, exerciseName, unitSystem, limit = 3) {
  const query = exerciseName.trim().toLowerCase();
  if (!query) return [];

  return workouts.flatMap((workout) => workout.exercises
    .filter((exercise) => exercise.exerciseName.trim().toLowerCase() === query)
    .map((exercise) => ({
      workoutId: workout._id,
      date: workout.date,
      sets: expandExerciseSets(exercise, unitSystem).setDetails
    })))
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, limit);
}
