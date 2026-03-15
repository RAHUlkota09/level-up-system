// =============================================
// INDIAN FOOD DATABASE
// =============================================
// Nutritional values per 100g for common Indian foods
// Source: ICMR nutritional tables + standard food databases

const indianFoodDatabase = [
  // ---- PROTEIN SOURCES ----
  {
    name: 'Chicken Breast (Boneless)',
    category: 'protein',
    per100g: { protein: 31, carbs: 0, fats: 3.6, calories: 165 },
    commonServings: [{ name: '1 medium piece', grams: 120 }]
  },
  {
    name: 'Eggs (Whole)',
    category: 'protein',
    per100g: { protein: 13, carbs: 1.1, fats: 11, calories: 155 },
    commonServings: [{ name: '1 egg', grams: 50 }]
  },
  {
    name: 'Egg White',
    category: 'protein',
    per100g: { protein: 11, carbs: 0.7, fats: 0.2, calories: 52 },
    commonServings: [{ name: '1 egg white', grams: 33 }]
  },
  {
    name: 'Paneer (Cottage Cheese)',
    category: 'protein',
    per100g: { protein: 18, carbs: 3.4, fats: 20, calories: 265 },
    commonServings: [{ name: '1 cup cubed', grams: 150 }]
  },
  {
    name: 'Dal (Toor/Arhar)',
    category: 'protein',
    per100g: { protein: 22, carbs: 57, fats: 1.7, calories: 335 },
    commonServings: [{ name: '1 cup cooked', grams: 200 }]
  },
  {
    name: 'Dal (Moong)',
    category: 'protein',
    per100g: { protein: 24, carbs: 63, fats: 1.2, calories: 347 },
    commonServings: [{ name: '1 cup cooked', grams: 200 }]
  },
  {
    name: 'Chana Dal',
    category: 'protein',
    per100g: { protein: 20, carbs: 57, fats: 5, calories: 360 },
    commonServings: [{ name: '1 cup cooked', grams: 200 }]
  },
  {
    name: 'Soya Chunks (TVP)',
    category: 'protein',
    per100g: { protein: 52, carbs: 33, fats: 0.5, calories: 345 },
    commonServings: [{ name: '1 cup dry', grams: 50 }]
  },
  {
    name: 'Peanuts (Roasted)',
    category: 'protein',
    per100g: { protein: 26, carbs: 16, fats: 49, calories: 585 },
    commonServings: [{ name: '1 handful', grams: 30 }]
  },
  {
    name: 'Peanut Butter',
    category: 'protein',
    per100g: { protein: 25, carbs: 20, fats: 50, calories: 588 },
    commonServings: [{ name: '2 tbsp', grams: 32 }]
  },
  {
    name: 'Milk (Full Fat)',
    category: 'dairy',
    per100g: { protein: 3.4, carbs: 4.8, fats: 3.7, calories: 61 },
    commonServings: [{ name: '1 glass (250ml)', grams: 250 }]
  },
  {
    name: 'Curd/Yogurt (Plain)',
    category: 'dairy',
    per100g: { protein: 11, carbs: 3.4, fats: 0.4, calories: 59 },
    commonServings: [{ name: '1 cup', grams: 200 }]
  },
  {
    name: 'Whey Protein (Scoop)',
    category: 'supplement',
    per100g: { protein: 75, carbs: 5, fats: 4, calories: 360 },
    commonServings: [{ name: '1 scoop (30g)', grams: 30 }]
  },

  // ---- CARBOHYDRATE SOURCES ----
  {
    name: 'White Rice (Cooked)',
    category: 'carbs',
    per100g: { protein: 2.7, carbs: 28, fats: 0.3, calories: 130 },
    commonServings: [{ name: '1 cup cooked', grams: 185 }]
  },
  {
    name: 'Brown Rice (Cooked)',
    category: 'carbs',
    per100g: { protein: 2.6, carbs: 23, fats: 0.9, calories: 111 },
    commonServings: [{ name: '1 cup cooked', grams: 195 }]
  },
  {
    name: 'Chapati/Roti (Wheat)',
    category: 'carbs',
    per100g: { protein: 9, carbs: 50, fats: 3.7, calories: 270 },
    commonServings: [{ name: '1 medium chapati', grams: 40 }]
  },
  {
    name: 'Oats (Rolled)',
    category: 'carbs',
    per100g: { protein: 17, carbs: 66, fats: 7, calories: 389 },
    commonServings: [{ name: '1/2 cup dry', grams: 40 }]
  },
  {
    name: 'Sweet Potato (Boiled)',
    category: 'carbs',
    per100g: { protein: 1.6, carbs: 20, fats: 0.1, calories: 86 },
    commonServings: [{ name: '1 medium', grams: 150 }]
  },
  {
    name: 'Banana',
    category: 'fruits',
    per100g: { protein: 1.1, carbs: 23, fats: 0.3, calories: 89 },
    commonServings: [{ name: '1 medium banana', grams: 120 }]
  },
  {
    name: 'Poha (Flattened Rice)',
    category: 'carbs',
    per100g: { protein: 7, carbs: 77, fats: 1.3, calories: 350 },
    commonServings: [{ name: '1 plate cooked', grams: 100 }]
  },
  {
    name: 'Idli (Steamed)',
    category: 'carbs',
    per100g: { protein: 2.7, carbs: 21, fats: 0.5, calories: 58 },
    commonServings: [{ name: '1 idli', grams: 50 }]
  },

  // ---- VEGETABLES ----
  {
    name: 'Spinach (Palak)',
    category: 'vegetables',
    per100g: { protein: 2.9, carbs: 3.6, fats: 0.4, calories: 23 },
    commonServings: [{ name: '1 cup cooked', grams: 180 }]
  },
  {
    name: 'Broccoli',
    category: 'vegetables',
    per100g: { protein: 2.8, carbs: 7, fats: 0.4, calories: 34 },
    commonServings: [{ name: '1 cup', grams: 90 }]
  },

  // ---- FATS ----
  {
    name: 'Almonds',
    category: 'fats',
    per100g: { protein: 21, carbs: 22, fats: 50, calories: 579 },
    commonServings: [{ name: '10 almonds', grams: 15 }]
  },
  {
    name: 'Coconut Oil',
    category: 'fats',
    per100g: { protein: 0, carbs: 0, fats: 100, calories: 862 },
    commonServings: [{ name: '1 tsp', grams: 5 }]
  }
];

module.exports = indianFoodDatabase;
