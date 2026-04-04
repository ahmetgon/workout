export interface WorkoutStep {
  id: string;
  type: 'exercise' | 'rest';
  name: string;
  duration: number; // seconds
  gif?: string;
  fallbackGif?: string;
  phase: 'warmup' | 'main' | 'cooldown' | 'rest';
  round?: number;
  source?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  steps: WorkoutStep[];
}

export type AppView = 'home' | 'player' | 'editor';
