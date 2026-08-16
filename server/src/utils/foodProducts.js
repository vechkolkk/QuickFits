function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export function normalizeFoodProduct(product = {}) {
  const nutrients = product.nutriments || {};
  const name = product.product_name || product.generic_name || '';
  if (!product.code || !name) return null;
  return {
    barcode: String(product.code),
    name,
    brand: Array.isArray(product.brands) ? product.brands.join(', ') : product.brands || '',
    imageUrl: product.image_front_small_url || product.image_front_url || '',
    calories: number(nutrients['energy-kcal_100g']),
    protein: number(nutrients.proteins_100g),
    carbs: number(nutrients.carbohydrates_100g),
    fat: number(nutrients.fat_100g),
    servingGrams: number(product.serving_quantity) || 100,
    basis: 'per 100 g'
  };
}

export function normalizeFoodProducts(products = []) {
  return products.map(normalizeFoodProduct).filter(Boolean);
}
