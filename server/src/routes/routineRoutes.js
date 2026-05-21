import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Routine } from '../models/Routine.js';

const router = express.Router();

const routineSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  workoutType: z.string().min(1, 'Workout type is required'),
  exercises: z
    .array(
      z.object({
        exerciseName: z.string().min(1),
        sets: z.coerce.number().min(0).default(3),
        reps: z.coerce.number().min(0).default(10)
      })
    )
    .default([])
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const routines = await Routine.find({ userId: req.user._id }).sort({ day: 1 });
    res.json({ routines });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = routineSchema.parse(req.body);
    const routine = await Routine.create({ ...payload, userId: req.user._id });
    res.status(201).json({ routine });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = routineSchema.parse(req.body);
    const routine = await Routine.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, payload, {
      new: true
    });

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ routine });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ message: 'Routine deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
