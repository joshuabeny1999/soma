export interface Measurement {
  id: number;
  date: string; // ISO string YYYY-MM-DD
  weight: number;
  chest: number; // Swapped order
  waist: number;
  arm: number;
  leg: number;
}

export type MetricKey = 'weight' | 'chest' | 'waist' | 'arm' | 'leg';

export const METRIC_LABELS: Record<MetricKey, string> = {
  weight: 'Gewicht (kg)',
  chest: 'Brustumfang (cm)', // Swapped order
  waist: 'Bauchumfang (cm)',
  arm: 'Arme (cm)',
  leg: 'Beine (cm)',
};

export const METRIC_COLORS: Record<MetricKey, string> = {
  weight: '#3b82f6', // blue
  chest: '#ec4899', // pink
  waist: '#8b5cf6', // violet
  arm: '#10b981', // emerald
  leg: '#f59e0b', // amber
};

// Define which metrics are "better if higher" (Muscle gain) vs "better if lower" (Fat loss)
export const IS_HIGHER_BETTER: Record<MetricKey, boolean> = {
  weight: false,
  waist: false,
  chest: true, // Muscle
  arm: true,   // Muscle
  leg: true,   // Muscle
};