import { WorkoutStep } from '../types';
import { getMedia } from './exerciseMediaMap';

// Simple ID generator — no nanoid dependency needed
export function makeId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function exercise(
  name: string,
  duration: number,
  phase: WorkoutStep['phase'],
  round?: number
): WorkoutStep {
  const media = getMedia(name);
  return {
    id: makeId(),
    type: 'exercise',
    name,
    duration,
    phase,
    round,
    gif: media.gif,
    fallbackGif: media.fallbackGif,
    source: 'default',
  };
}

export function rest(
  name: string,
  duration: number,
  phase: WorkoutStep['phase'],
  round?: number
): WorkoutStep {
  return {
    id: makeId(),
    type: 'rest',
    name,
    duration,
    phase,
    round,
    gif: '/exercises/placeholder.gif',
    fallbackGif: '/exercises/placeholder.gif',
    source: 'default',
  };
}
