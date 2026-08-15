export function createWorkoutDraftFromRoutine(routine, date) {
  return {
    workoutName: routine.workoutType,
    date,
    notes: '',
    exercises: routine.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      weight: 0,
      duration: 0
    }))
  };
}
