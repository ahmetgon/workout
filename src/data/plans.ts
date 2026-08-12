import { WorkoutPlan } from '../types';
import { defaultWorkoutPlan } from './defaultWorkoutPlan';
import { tennisWorkoutPlan } from './tennisWorkoutPlan';

/** Uygulamayla birlikte gelen planlar. Kullanıcı bunları düzenleyebilir. */
export const builtInPlans: WorkoutPlan[] = [defaultWorkoutPlan, tennisWorkoutPlan];

export const defaultPlanId = defaultWorkoutPlan.id;

export function getBuiltInPlan(id: string): WorkoutPlan | undefined {
  return builtInPlans.find((p) => p.id === id);
}
