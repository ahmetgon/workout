import { WorkoutPlan } from '../types';
import { builtInPlans, defaultPlanId, getBuiltInPlan } from '../data/plans';

const STORAGE_KEY = 'workout_plans_v3'; // v3: birden fazla plan
const LEGACY_PLAN_KEY = 'workout_plan_v2'; // v2: tek plan + local GIF yolları

export interface StoredState {
  plans: WorkoutPlan[];
  activePlanId: string;
}

function freshPlans(): WorkoutPlan[] {
  return builtInPlans.map((p) => structuredClone(p));
}

/**
 * Kayıtlı planları built-in listesiyle birleştirir: kullanıcının düzenlediği
 * planlar korunur, sonradan eklenen yeni built-in planlar listeye eklenir.
 */
function mergeWithBuiltIns(stored: WorkoutPlan[]): WorkoutPlan[] {
  const merged = [...stored];
  builtInPlans.forEach((builtIn) => {
    if (!merged.some((p) => p.id === builtIn.id)) {
      merged.push(structuredClone(builtIn));
    }
  });
  return merged;
}

/** Planları localStorage'dan yükler; yoksa built-in planlara döner. */
export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const plans = mergeWithBuiltIns(
        Array.isArray(parsed.plans) && parsed.plans.length > 0
          ? parsed.plans
          : freshPlans()
      );
      const activePlanId = plans.some((p) => p.id === parsed.activePlanId)
        ? (parsed.activePlanId as string)
        : plans[0].id;
      return { plans, activePlanId };
    }

    // v2'den geçiş: eski tek plan, düzenlenmiş default plan olarak devam eder.
    const legacyRaw = localStorage.getItem(LEGACY_PLAN_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as WorkoutPlan;
      const plans = mergeWithBuiltIns([legacy]);
      return { plans, activePlanId: legacy.id ?? defaultPlanId };
    }
  } catch {
    // bozuk kayıt — varsayılana dön
  }

  const plans = freshPlans();
  return { plans, activePlanId: plans[0].id };
}

/** Tüm durumu localStorage'a yazar. */
export function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Tek bir planı built-in haline döndürür. Built-in olmayan (kullanıcı eklemesi)
 * planlarda değişiklik yapılmaz.
 */
export function resetPlan(planId: string): WorkoutPlan | undefined {
  const builtIn = getBuiltInPlan(planId);
  return builtIn ? structuredClone(builtIn) : undefined;
}
