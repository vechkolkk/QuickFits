function toHabitTimestamp(dateKey) {
  return `${dateKey}T12:00:00.000Z`;
}

export function buildRecentActivity(workouts, habits, limit = 8) {
  const workoutActivity = workouts.map((workout) => ({
    id: `workout-${workout._id}`,
    type: 'workout',
    title: workout.workoutName,
    description: `${workout.exercises.length} ${workout.exercises.length === 1 ? 'exercise' : 'exercises'}`,
    occurredAt: new Date(workout.date).toISOString(),
    href: '/workouts'
  }));

  const habitActivity = habits.flatMap((habit) =>
    habit.completedDates.map((date) => ({
      id: `habit-${habit._id}-${date}`,
      type: 'habit',
      title: habit.habitName,
      description: 'Habit checked in',
      occurredAt: toHabitTimestamp(date),
      href: '/habits'
    }))
  );

  return [...workoutActivity, ...habitActivity]
    .sort((first, second) => new Date(second.occurredAt) - new Date(first.occurredAt))
    .slice(0, limit);
}
