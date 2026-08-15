import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Workout } from '../models/Workout.js';

const router = express.Router();

const exerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.coerce.number().min(0).default(0),
  reps: z.coerce.number().min(0).default(0),
  weight: z.coerce.number().min(0).default(0),
  duration: z.coerce.number().min(0).default(0),
  setDetails: z.array(z.object({
    reps: z.coerce.number().min(0),
    weight: z.coerce.number().min(0)
  })).min(1).optional()
});

const workoutSchema = z.object({
  workoutName: z.string().min(1, 'Workout name is required'),
  date: z.coerce.date().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Add at least one exercise'),
  notes: z.string().optional()
});

function addExerciseAggregates(payload) {
  return {
    ...payload,
    exercises: payload.exercises.map((exercise) => {
      if (!exercise.setDetails?.length) return exercise;
      return {
        ...exercise,
        sets: exercise.setDetails.length,
        reps: Math.max(...exercise.setDetails.map((set) => set.reps)),
        weight: Math.max(...exercise.setDetails.map((set) => set.weight))
      };
    })
  };
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ workouts });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = addExerciseAggregates(workoutSchema.parse(req.body));
    const workout = await Workout.create({ ...payload, userId: req.user._id });
    res.status(201).json({ workout });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = addExerciseAggregates(workoutSchema.parse(req.body));
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      payload,
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
