import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    habitName: { type: String, required: true, trim: true },
    target: { type: String, default: 'Daily' },
    completedDates: { type: [String], default: [] },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    reminderTime: { type: String, default: '' },
    reminderTimes: { type: [String], default: [] },
    scheduleDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    notificationsEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Habit = mongoose.model('Habit', habitSchema);
