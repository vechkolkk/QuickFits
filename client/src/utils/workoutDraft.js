export function createWorkoutDraftFromRoutine(routine, date) {
  return {
    workoutName: routine.workoutType,
    date,
    notes: '',
    exercises: routine.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      duration: 0,
      setDetails: Array.from({ length: Math.max(1, Number(exercise.sets)) }, () => ({
        reps: Number(exercise.reps),
        weight: 0
      }))
    }))
  };
}
