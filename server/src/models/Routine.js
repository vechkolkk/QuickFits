import mongoose from 'mongoose';

const routineExerciseSchema = new mongoose.Schema(
  {
    exerciseName: { type: String, required: true, trim: true },
    sets: { type: Number, min: 0, default: 3 },
    reps: { type: Number, min: 0, default: 10 }
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    day: { type: String, required: true },
    workoutType: { type: String, required: true, trim: true },
    exercises: { type: [routineExerciseSchema], default: [] }
  },
  { timestamps: true }
);

export const Routine = mongoose.model('Routine', routineSchema);
