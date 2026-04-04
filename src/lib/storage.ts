import { WorkoutPlan } from '../types';
import { defaultWorkoutPlan } from '../data/defaultWorkoutPlan';

const STORAGE_KEY = 'workout_plan_v1';

/** Load plan from localStorage, fall back to default */
export function loadPlan(): WorkoutPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultWorkoutPlan);
    return JSON.parse(raw) as WorkoutPlan;
  } catch {
    return structuredClone(defaultWorkoutPlan);
  }
}

/** Save plan to localStorage */
export function savePlan(plan: WorkoutPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

/** Reset to default plan and persist */
export function resetPlan(): WorkoutPlan {
  const fresh = structuredClone(defaultWorkoutPlan);
  savePlan(fresh);
  return fresh;
}
