import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Measurement } from '../models/Measurement.js';

const router = express.Router();
const optionalNumber = z.coerce.number().min(0).optional();
const measurementSchema = z.object({
  date: z.coerce.date(),
  weight: optionalNumber,
  bodyFat: z.coerce.number().min(0).max(100).optional(),
  waist: optionalNumber,
  chest: optionalNumber,
  hips: optionalNumber,
  arm: optionalNumber,
  notes: z.string().max(500).optional()
}).refine((value) => ['weight', 'bodyFat', 'waist', 'chest', 'hips', 'arm'].some((field) => value[field] !== undefined), {
  message: 'Add at least one measurement'
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const measurements = await Measurement.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ measurements });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = measurementSchema.parse(req.body);
    const measurement = await Measurement.create({ ...payload, userId: req.user._id });
    res.status(201).json({ measurement });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = measurementSchema.parse(req.body);
    const measurement = await Measurement.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, payload, { new: true });
    if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
    res.json({ measurement });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const measurement = await Measurement.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
    res.json({ message: 'Measurement deleted' });
  } catch (error) { next(error); }
});

export default router;
