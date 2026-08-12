import { WorkoutPlan, WorkoutStep } from '../types';
import { exercise, rest } from './stepFactory';

// "Tenise Özel 15 Dakika Kalistenik" posterinden.
// Isınma 2,5 dk + ana bölüm 10 dk + soğuma 2,5 dk = 15 dk.

const warmupSteps: WorkoutStep[] = [
  exercise('Yerinde diz çekme', 40, 'warmup'),
  exercise('Kol çevirme', 40, 'warmup'),
  exercise('Ayakta gövde twisti', 40, 'warmup'),
  exercise('Kalça + bilek çevirme', 30, 'warmup'),
];

// Ana bölüm: her hareket 40 sn çalış / 20 sn dinlen = 1 dk. 10 hareket = 10 dk.
const mainExercises = [
  'Jumping Jack',
  'Yana hamle',
  'Sıçramalı squat',
  'Rus twisti',
  'Şınav',
  'Patinajcı sıçrayışı',
  'Geri hamle',
  'Plank omuz dokunuşu',
  'Bisiklet mekiği',
  'Tırmanıcı',
];

const mainSteps: WorkoutStep[] = mainExercises.flatMap((name) => [
  exercise(name, 40, 'main', 1),
  rest('Dinlen', 20, 'rest', 1),
]);

const cooldownSteps: WorkoutStep[] = [
  exercise('Kobra esnemesi', 30, 'cooldown'),
  exercise('Oturarak gövde rotasyon esnemesi', 40, 'cooldown'),
  exercise('Bilek & önkol esnemesi', 40, 'cooldown'),
  exercise('Çocuk pozu', 40, 'cooldown'),
];

export const tennisWorkoutPlan: WorkoutPlan = {
  id: 'tennis-15-v1',
  name: 'Tenise Özel 15 Dakika',
  description:
    'Aletsiz kalistenik: yanal hareket, patlayıcı güç ve gövde rotasyonu. Isınma + 10 hareket + soğuma.',
  steps: [...warmupSteps, ...mainSteps, ...cooldownSteps],
};
