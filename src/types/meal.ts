export interface MealMacros {
  protein: string | number;
  carbs: string | number;
  fat: string | number;
}

export interface Meal {
  id: string;
  userId: string;
  imageUrl: string;
  description: string;
  totalCalories: number;
  macros: MealMacros;
  foodItems?: string[];
  labels?: string[];
  createdAt: string;
}

export interface MealData {
  userId: string;
  description: string;
  totalCalories: number;
  macros: MealMacros;
  foodItems?: string[];
  labels?: string[];
}

export interface WeeklyDataPoint {
  date: string;
  calories: number;
}

export interface MonthlyDataPoint {
  date: string;
  calories: number;
}

