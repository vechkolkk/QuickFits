import mongoose from 'mongoose';

const nutritionEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  name: { type: String, required: true, trim: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Snack' },
  calories: { type: Number, min: 0, required: true },
  protein: { type: Number, min: 0, default: 0 },
  carbs: { type: Number, min: 0, default: 0 },
  fat: { type: Number, min: 0, default: 0 },
  barcode: { type: String, default: '' },
  source: { type: String, enum: ['', 'manual', 'open-food-facts'], default: 'manual' },
  servingGrams: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

nutritionEntrySchema.index({ userId: 1, date: -1 });
export const NutritionEntry = mongoose.model('NutritionEntry', nutritionEntrySchema);
