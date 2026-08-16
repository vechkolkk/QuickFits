import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateNutritionTotals, nutritionProgress, scaleFoodNutrition } from './nutrition.js';

test('totals calories and macros', () => {
  assert.deepEqual(calculateNutritionTotals([
    { calories: 500, protein: 30, carbs: 50, fat: 15 },
    { calories: 250, protein: 20, carbs: 25, fat: 8 }
  ]), { calories: 750, protein: 50, carbs: 75, fat: 23 });
});

test('caps progress at one hundred percent', () => {
  assert.equal(nutritionProgress(120, 100), 100);
  assert.equal(nutritionProgress(50, 100), 50);
  assert.equal(nutritionProgress(50, 0), 0);
});

test('scales food nutrients to a selected portion', () => {
  assert.deepEqual(scaleFoodNutrition({ calories: 250, protein: 10, carbs: 30, fat: 8 }, 150), { calories: 375, protein: 15, carbs: 45, fat: 12 });
});
