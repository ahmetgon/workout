// Maps exercise names to GIF URLs
// Sources: Giphy, ExerciseDB, wger — uncertain ones noted with comments

export interface ExerciseMedia {
  gif: string;
  fallbackGif: string;
}

const PLACEHOLDER = '/exercises/placeholder.gif';

export const exerciseMediaMap: Record<string, ExerciseMedia> = {
  // --- Main exercises (confirmed Giphy URLs) ---
  'Jumping Jack': {
    gif: 'https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Push-up': {
    gif: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Bodyweight Squat': {
    gif: 'https://media.giphy.com/media/2x6ZLj05SFvHy/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Mountain Climber': {
    // Reusing jumping jack gif — uncertain dedicated URL
    gif: 'https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Glute Bridge': {
    gif: 'https://media.giphy.com/media/4WnGUvFuL4Pq0/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },
  'Forearm Plank': {
    gif: 'https://media.giphy.com/media/GXoiIGSZHarC0/giphy.gif',
    fallbackGif: PLACEHOLDER,
  },

  // --- Warmup & cooldown — placeholder (uncertain external URLs) ---
  'Yerinde hafif yürüyüş / diz çekme': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Kol çevirme': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Cat-Cow': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Squat to Reach': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Half Jumping Jack': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  "Child's Pose": {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Cobra Stretch': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Hamstring Stretch': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
  'Deep Breathing': {
    gif: PLACEHOLDER,
    fallbackGif: PLACEHOLDER,
  },
};

export function getMedia(name: string): ExerciseMedia {
  return exerciseMediaMap[name] ?? { gif: PLACEHOLDER, fallbackGif: PLACEHOLDER };
}
