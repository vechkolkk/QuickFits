import bcrypt from 'bcryptjs';
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { createToken } from '../utils/tokens.js';

const router = express.Router();

const timezoneSchema = z.string().refine((timezone) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}, 'Timezone must be valid');
const nutritionGoalsSchema = z.object({
  calories: z.coerce.number().min(0), protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0), fat: z.coerce.number().min(0)
});

const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Email must be valid'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  goal: z.string().optional(),
  experienceLevel: z.enum(['Beginner', 'Casual', 'Intermediate']).optional(),
  timezone: timezoneSchema.optional(),
  unitSystem: z.enum(['imperial', 'metric']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Email must be valid'),
  password: z.string().min(1, 'Password is required')
});

const profileSchema = z.object({
  username: z.string().min(2).optional(),
  goal: z.string().optional(),
  experienceLevel: z.enum(['Beginner', 'Casual', 'Intermediate']).optional(),
  timezone: timezoneSchema.optional(),
  unitSystem: z.enum(['imperial', 'metric']).optional(),
  nutritionGoals: nutritionGoalsSchema.optional()
});

function serializeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    goal: user.goal,
    experienceLevel: user.experienceLevel,
    timezone: user.timezone,
    unitSystem: user.unitSystem,
    nutritionGoals: user.nutritionGoals
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await User.create({ ...payload, passwordHash });
    const token = createToken(user);

    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, payload, { new: true }).select('-passwordHash');

    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
