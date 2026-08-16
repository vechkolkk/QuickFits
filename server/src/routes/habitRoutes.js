import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Habit } from '../models/Habit.js';
import { toDateKey } from '../utils/dates.js';
import { calculateHabitStreaks, getHabitWeekSummary } from '../utils/streaks.js';

const router = express.Router();

const habitSchema = z.object({
  habitName: z.string().min(1, 'Habit name is required'),
  target: z.string().optional(),
  reminderTime: z.string().optional(),
  reminderTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Reminder time must use HH:MM')).max(5).optional(),
  scheduleDays: z.array(z.number().int().min(0).max(6)).min(1, 'Choose at least one scheduled day').optional(),
  notificationsEnabled: z.boolean().optional()
});

function serializeHabit(habit) {
  const habitObject = typeof habit.toObject === 'function' ? habit.toObject() : habit;
  const scheduleDays = habitObject.scheduleDays?.length ? habitObject.scheduleDays : [0, 1, 2, 3, 4, 5, 6];
  const streaks = calculateHabitStreaks(habitObject.completedDates, new Date(), scheduleDays);

  return {
    ...habitObject,
    scheduleDays: [...new Set(scheduleDays)].sort(),
    reminderTimes: habitObject.reminderTimes?.length ? habitObject.reminderTimes : habitObject.reminderTime ? [habitObject.reminderTime] : [],
    completedDates: streaks.completedDates,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    weekSummary: getHabitWeekSummary(streaks.completedDates, new Date(), scheduleDays)
  };
}

async function refreshStreaksIfNeeded(habit) {
  const streaks = calculateHabitStreaks(habit.completedDates, new Date(), habit.scheduleDays);
  const needsUpdate =
    habit.currentStreak !== streaks.currentStreak ||
    habit.longestStreak !== streaks.longestStreak ||
    habit.completedDates.length !== streaks.completedDates.length ||
    habit.completedDates.some((date, index) => date !== streaks.completedDates[index]);

  if (needsUpdate) {
    habit.completedDates = streaks.completedDates;
    habit.currentStreak = streaks.currentStreak;
    habit.longestStreak = streaks.longestStreak;
    await habit.save();
  }

  return habit;
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const refreshedHabits = await Promise.all(habits.map((habit) => refreshStreaksIfNeeded(habit)));
    res.json({ habits: refreshedHabits.map((habit) => serializeHabit(habit)) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = habitSchema.parse(req.body);
    const habit = await Habit.create({ ...payload, userId: req.user._id });
    res.status(201).json({ habit });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = habitSchema.parse(req.body);
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, payload, {
      new: true
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ habit });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checkin', async (req, res, next) => {
  try {
    const dateKey = toDateKey(req.body.date || new Date());
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const exists = habit.completedDates.includes(dateKey);
    habit.completedDates = exists
      ? habit.completedDates.filter((date) => date !== dateKey)
      : [...habit.completedDates, dateKey];

    const streaks = calculateHabitStreaks(habit.completedDates, new Date(), habit.scheduleDays);
    habit.completedDates = streaks.completedDates;
    habit.currentStreak = streaks.currentStreak;
    habit.longestStreak = streaks.longestStreak;
    await habit.save();

    res.json({ habit: serializeHabit(habit) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
