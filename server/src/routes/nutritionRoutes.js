import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { NutritionEntry } from '../models/NutritionEntry.js';

const router = express.Router();
const schema = z.object({
  date: z.coerce.date(),
  name: z.string().trim().min(1, 'Food or meal name is required'),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fat: z.coerce.number().min(0).default(0),
  barcode: z.string().regex(/^\d{8,14}$/).or(z.literal('')).optional(),
  source: z.enum(['manual', 'open-food-facts']).optional(),
  servingGrams: z.coerce.number().min(0).optional()
});

router.use(requireAuth);
router.get('/', async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.date) query.date = new Date(`${req.query.date}T00:00:00.000Z`);
    const entries = await NutritionEntry.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ entries });
  } catch (error) { next(error); }
});
router.post('/', async (req, res, next) => {
  try { const entry = await NutritionEntry.create({ ...schema.parse(req.body), userId: req.user._id }); res.status(201).json({ entry }); }
  catch (error) { next(error); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const entry = await NutritionEntry.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, schema.parse(req.body), { new: true });
    if (!entry) return res.status(404).json({ message: 'Nutrition entry not found' });
    res.json({ entry });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const entry = await NutritionEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Nutrition entry not found' });
    res.json({ message: 'Nutrition entry deleted' });
  } catch (error) { next(error); }
});
export default router;
