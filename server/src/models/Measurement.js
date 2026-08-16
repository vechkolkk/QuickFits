import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    waist: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    arm: { type: Number, min: 0 },
    notes: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

measurementSchema.index({ userId: 1, date: -1 });

export const Measurement = mongoose.model('Measurement', measurementSchema);
