import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Habit } from '../models/Habit.js';
import { daysBetween, toDateKey } from '../utils/dates.js';

const router = express.Router();

const habitSchema = z.object({
  habitName: z.string().min(1, 'Habit name is required'),
  target: z.string().optional(),
  reminderTime: z.string().optional(),
  notificationsEnabled: z.boolean().optional()
});

function calculateStreak(completedDates) {
  const dates = [...new Set(completedDates)].sort();
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  const today = toDateKey();
  const yesterday = toDateKey(Date.now() - 86400000);
  const latest = dates[dates.length - 1];
  const currentStreak = latest === today || latest === yesterday ? streak : 0;

  return { currentStreak, longestStreak };
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ habits });
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

    const streaks = calculateStreak(habit.completedDates);
    habit.currentStreak = streaks.currentStreak;
    habit.longestStreak = streaks.longestStreak;
    await habit.save();

    res.json({ habit });
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
