import { WorkoutPlan, WorkoutStep } from '../types';
import { exercise, rest } from './stepFactory';

// Warmup exercises (30s each)
const warmupSteps: WorkoutStep[] = [
  exercise('Yerinde hafif yürüyüş / diz çekme', 30, 'warmup'),
  exercise('Kol çevirme', 30, 'warmup'),
  exercise('Cat-Cow', 30, 'warmup'),
  exercise('Squat to Reach', 30, 'warmup'),
  exercise('Glute Bridge', 30, 'warmup'),
  exercise('Half Jumping Jack', 30, 'warmup'),
];

// Main exercises: name, 40s duration, 20s rest after
const mainExercises = [
  'Jumping Jack',
  'Push-up',
  'Bodyweight Squat',
  'Mountain Climber',
  'Glute Bridge',
  'Forearm Plank',
];

function buildRound(roundNumber: number): WorkoutStep[] {
  const steps: WorkoutStep[] = [];
  mainExercises.forEach((name, i) => {
    steps.push(exercise(name, 40, 'main', roundNumber));
    // 20s rest after each exercise except the last one in round
    // (after last exercise we add a longer inter-round rest below)
    if (i < mainExercises.length - 1) {
      steps.push(rest('Dinlen', 20, 'rest', roundNumber));
    }
  });
  return steps;
}

const round1 = buildRound(1);
const interRoundRest = rest('Tur arası dinlenme', 60, 'rest');
const round2 = buildRound(2);

// Cooldown exercises (30s each)
const cooldownSteps: WorkoutStep[] = [
  exercise("Child's Pose", 30, 'cooldown'),
  exercise('Cobra Stretch', 30, 'cooldown'),
  exercise('Hamstring Stretch', 30, 'cooldown'),
  exercise('Deep Breathing', 30, 'cooldown'),
];

export const defaultWorkoutPlan: WorkoutPlan = {
  id: 'default-plan-v1',
  name: 'Full Body HIIT',
  description: 'Isınma + 2 tur ana egzersiz + soğuma. Toplam ~25 dakika.',
  steps: [
    ...warmupSteps,
    ...round1,
    interRoundRest,
    ...round2,
    ...cooldownSteps,
  ],
};
