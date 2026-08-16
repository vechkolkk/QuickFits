export function calculateNutritionTotals(entries) {
  return entries.reduce((totals, entry) => ({
    calories: totals.calories + Number(entry.calories || 0),
    protein: totals.protein + Number(entry.protein || 0),
    carbs: totals.carbs + Number(entry.carbs || 0),
    fat: totals.fat + Number(entry.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function nutritionProgress(value, goal) {
  return goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
}

export function scaleFoodNutrition(food, grams) {
  const factor = Math.max(0, Number(grams) || 0) / 100;
  return ['calories', 'protein', 'carbs', 'fat'].reduce((values, key) => ({
    ...values,
    [key]: Math.round(Number(food[key] || 0) * factor * 10) / 10
  }), {});
}
