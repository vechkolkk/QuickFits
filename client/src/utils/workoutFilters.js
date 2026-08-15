export function filterAndSortWorkouts(workouts, filters) {
  const query = filters.query.trim().toLowerCase();

  return workouts
    .filter((workout) => {
      const workoutDate = new Date(workout.date).toISOString().slice(0, 10);
      const matchesQuery = !query ||
        workout.workoutName.toLowerCase().includes(query) ||
        workout.exercises.some((exercise) => exercise.exerciseName.toLowerCase().includes(query));
      const matchesStartDate = !filters.startDate || workoutDate >= filters.startDate;
      const matchesEndDate = !filters.endDate || workoutDate <= filters.endDate;

      return matchesQuery && matchesStartDate && matchesEndDate;
    })
    .sort((first, second) => {
      const difference = new Date(first.date).getTime() - new Date(second.date).getTime();
      return filters.sort === 'oldest' ? difference : -difference;
    });
}
