import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeFoodProduct, normalizeFoodProducts } from './foodProducts.js';

test('normalizes Open Food Facts nutrients per 100 grams', () => {
  const food = normalizeFoodProduct({ code: 123, product_name: 'Yogurt', brands: 'Example', serving_quantity: 175, nutriments: { 'energy-kcal_100g': 62.24, proteins_100g: 4.5, carbohydrates_100g: 7, fat_100g: 1.2 } });
  assert.deepEqual(food, { barcode: '123', name: 'Yogurt', brand: 'Example', imageUrl: '', calories: 62.2, protein: 4.5, carbs: 7, fat: 1.2, servingGrams: 175, basis: 'per 100 g' });
});

test('removes products without a barcode or name', () => {
  assert.equal(normalizeFoodProducts([{ code: '1' }, { product_name: 'Missing code' }]).length, 0);
});

test('joins brand arrays returned by food search', () => {
  assert.equal(normalizeFoodProduct({ code: '1', product_name: 'Food', brands: ['One', 'Two'] }).brand, 'One, Two');
});
