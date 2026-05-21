import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    exerciseName: { type: String, required: true, trim: true },
    sets: { type: Number, min: 0, default: 0 },
    reps: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
    duration: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workoutName: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    exercises: { type: [exerciseSchema], validate: (value) => value.length > 0 },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Workout = mongoose.model('Workout', workoutSchema);
