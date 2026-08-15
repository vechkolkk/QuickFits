import { startOfWeek, toDateKey } from './dates.js';

function exerciseSets(exercise) {
  if (exercise.setDetails?.length) return exercise.setDetails;
  return Array.from({ length: Number(exercise.sets) || 0 }, () => ({ reps: exercise.reps || 0, weight: exercise.weight || 0 }));
}

export function calculateProgressMetrics(workouts) {
  const records = new Map();
  const weeklyVolume = new Map();
  let totalVolume = 0;
  let totalSets = 0;

  workouts.forEach((workout) => {
    const week = toDateKey(startOfWeek(workout.date));
    workout.exercises.forEach((exercise) => {
      const sets = exerciseSets(exercise);
      const name = exercise.exerciseName.trim();
      const key = name.toLowerCase();
      const current = records.get(key) || { exerciseName: name, maxWeight: 0, bestEstimated1RM: 0, bestSetVolume: 0, date: workout.date };

      sets.forEach((set) => {
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight) || 0;
        const volume = reps * weight;
        const estimated1RM = reps > 0 ? weight * (1 + reps / 30) : weight;
        totalSets += 1;
        totalVolume += volume;
        weeklyVolume.set(week, (weeklyVolume.get(week) || 0) + volume);

        if (weight > current.maxWeight || estimated1RM > current.bestEstimated1RM || volume > current.bestSetVolume) {
          current.date = workout.date;
        }
        current.maxWeight = Math.max(current.maxWeight, weight);
        current.bestEstimated1RM = Math.max(current.bestEstimated1RM, estimated1RM);
        current.bestSetVolume = Math.max(current.bestSetVolume, volume);
      });
      records.set(key, current);
    });
  });

  return {
    totalVolume: Math.round(totalVolume),
    totalSets,
    exercisesTracked: records.size,
    personalRecords: [...records.values()]
      .map((record) => ({ ...record, bestEstimated1RM: Math.round(record.bestEstimated1RM * 10) / 10 }))
      .sort((first, second) => second.bestEstimated1RM - first.bestEstimated1RM)
      .slice(0, 6),
    volumeByWeek: [...weeklyVolume.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .slice(-8)
      .map(([week, volume]) => ({ week, volume: Math.round(volume) }))
  };
}
