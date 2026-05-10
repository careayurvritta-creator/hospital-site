import { LucideIcon } from 'lucide-react';

export interface MedaResult {
  bmi: string;
  bmiCat: string;
  whr: string;
  medaStatus: string;
  recommendation: string;
  color: string;
  bg: string;
  gradient: string;
  borderColor: string;
  symptomScore: number;
}

export interface PrakritiScores {
  Vata: number;
  Pitta: number;
  Kapha: number;
}

export interface PrakritiResult {
  scores: PrakritiScores;
  dominant: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface DietMeal {
  time: string;
  category: string;
  food: string;
  benefit: string;
}

export interface FoodTableRow {
  category: string;
  good: string;
  bad: string;
}

export interface DietPlan {
  seasonal: string;
  diet: DietMeal[];
  pathya: string;
  apathya: string;
  lifestyle: string;
  yoga: string;
  foodTable: FoodTableRow[];
  rituName?: string;
}

export interface Insight {
  icon: LucideIcon;
  text: string;
  color: string;
}

export type ActiveTab = 'diet' | 'lifestyle' | 'seasonal';