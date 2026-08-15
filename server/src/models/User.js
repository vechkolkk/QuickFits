import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    goal: { type: String, default: 'Build consistency' },
    experienceLevel: { type: String, enum: ['Beginner', 'Casual', 'Intermediate'], default: 'Beginner' },
    timezone: { type: String, default: 'UTC' },
    unitSystem: { type: String, enum: ['imperial', 'metric'], default: 'imperial' }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
