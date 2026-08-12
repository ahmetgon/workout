// Maps exercise names to local GIF/webp files under /exercises/
// All assets live in public/exercises/ — served as static files by Vite

export interface ExerciseMedia {
  gif: string;
  fallbackGif: string;
}

const PLACEHOLDER = '/exercises/placeholder.gif';

export const exerciseMediaMap: Record<string, ExerciseMedia> = {
  // --- Warmup ---
  'Yerinde hafif yürüyüş / diz çekme': {
    gif: '/exercises/high-knees-march.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Kol çevirme': {
    gif: '/exercises/arm-circles.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Cat-Cow': {
    gif: '/exercises/Cat-Cow-Stretch.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Squat to Reach': {
    gif: '/exercises/squat-to-reach.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Glute Bridge': {
    gif: '/exercises/glute-bridge.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Half Jumping Jack': {
    gif: '/exercises/half-jumping-jack.gif',
    fallbackGif: PLACEHOLDER,
  },

  // --- Main ---
  'Jumping Jack': {
    gif: '/exercises/jumping-jacks.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Push-up': {
    gif: '/exercises/pushups.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Bodyweight Squat': {
    gif: '/exercises/bodyweight-squat.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Mountain Climber': {
    gif: '/exercises/Mountain-Climbers.webp',
    fallbackGif: PLACEHOLDER,
  },
  'Forearm Plank': {
    gif: '/exercises/forearm-plank.gif',
    fallbackGif: PLACEHOLDER,
  },

  // --- Cooldown ---
  "Child's Pose": {
    gif: '/exercises/chlids-pose.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Cobra Stretch': {
    gif: '/exercises/cobra-stretch.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Hamstring Stretch': {
    gif: '/exercises/Standing-Hamstring-Stretch.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Deep Breathing': {
    gif: '/exercises/deep-breath.gif',
    fallbackGif: PLACEHOLDER,
  },

  // --- Tenis planı (Türkçe adlar) ---
  'Yerinde diz çekme': {
    gif: '/exercises/high-knees-march.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Ayakta gövde twisti': {
    gif: '/exercises/standing-torso-twist.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Kalça + bilek çevirme': {
    gif: '/exercises/hip-circles.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Yana hamle': {
    gif: '/exercises/side-lunge.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Sıçramalı squat': {
    gif: '/exercises/jump-squat.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Rus twisti': {
    gif: '/exercises/russian-twist.gif',
    fallbackGif: PLACEHOLDER,
  },
  Şınav: {
    gif: '/exercises/pushups.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Patinajcı sıçrayışı': {
    gif: '/exercises/skater-jump.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Geri hamle': {
    gif: '/exercises/reverse-lunge.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Plank omuz dokunuşu': {
    gif: '/exercises/plank-shoulder-tap.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Bisiklet mekiği': {
    gif: '/exercises/bicycle-crunch.gif',
    fallbackGif: PLACEHOLDER,
  },
  Tırmanıcı: {
    gif: '/exercises/Mountain-Climbers.webp',
    fallbackGif: PLACEHOLDER,
  },
  'Kobra esnemesi': {
    gif: '/exercises/cobra-stretch.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Oturarak gövde rotasyon esnemesi': {
    gif: '/exercises/seated-spinal-twist.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Bilek & önkol esnemesi': {
    gif: '/exercises/wrist-forearm-stretch.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Çocuk pozu': {
    gif: '/exercises/chlids-pose.gif',
    fallbackGif: PLACEHOLDER,
  },
};

export function getMedia(name: string): ExerciseMedia {
  return exerciseMediaMap[name] ?? { gif: PLACEHOLDER, fallbackGif: PLACEHOLDER };
}
