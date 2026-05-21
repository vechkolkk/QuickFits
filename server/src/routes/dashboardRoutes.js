import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Habit } from '../models/Habit.js';
import { Workout } from '../models/Workout.js';
import { startOfWeek, toDateKey } from '../utils/dates.js';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', async (req, res, next) => {
  try {
    const [workouts, habits] = await Promise.all([
      Workout.find({ userId: req.user._id }).sort({ date: -1 }).lean(),
      Habit.find({ userId: req.user._id }).lean()
    ]);

    const weekStart = startOfWeek();
    const weeklyWorkouts = workouts.filter((workout) => new Date(workout.date) >= weekStart);
    const today = toDateKey();
    const completedToday = habits.filter((habit) => habit.completedDates.includes(today)).length;
    const currentStreak = Math.max(0, ...habits.map((habit) => habit.currentStreak));
    const longestStreak = Math.max(0, ...habits.map((habit) => habit.longestStreak));

    const byWeek = workouts.reduce((acc, workout) => {
      const key = toDateKey(startOfWeek(workout.date));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const mostActiveWeek = Object.entries(byWeek).sort((a, b) => b[1] - a[1])[0];

    res.json({
      summary: {
        totalWorkouts: workouts.length,
        weeklyWorkouts: weeklyWorkouts.length,
        currentStreak,
        longestStreak,
        completedToday,
        totalHabits: habits.length,
        mostActiveWeek: mostActiveWeek ? { week: mostActiveWeek[0], count: mostActiveWeek[1] } : null,
        recentActivity: workouts.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [workouts, habits] = await Promise.all([
      Workout.find({ userId: req.user._id }).sort({ date: 1 }).lean(),
      Habit.find({ userId: req.user._id }).lean()
    ]);

    const workoutFrequency = workouts.reduce((acc, workout) => {
      const key = toDateKey(workout.date);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const habitCompletions = habits.reduce((acc, habit) => {
      habit.completedDates.forEach((date) => {
        acc[date] = (acc[date] || 0) + 1;
      });
      return acc;
    }, {});

    res.json({
      stats: {
        workoutFrequency: Object.entries(workoutFrequency).map(([date, count]) => ({ date, count })),
        habitCompletions: Object.entries(habitCompletions).map(([date, count]) => ({ date, count }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
