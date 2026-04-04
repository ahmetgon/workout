import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutStep } from '../types';

interface ExerciseScreenProps {
  step: WorkoutStep;
  timeLeft: number;
  nextStep: WorkoutStep | null;
  isPaused: boolean;
}

const PHASE_LABELS: Record<WorkoutStep['phase'], string> = {
  warmup: 'Isınma',
  main: 'Ana',
  cooldown: 'Soğuma',
  rest: 'Dinlenme',
};

const PHASE_COLORS: Record<WorkoutStep['phase'], string> = {
  warmup: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  main: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cooldown: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  rest: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function GifImage({ src, fallback, alt }: { src?: string; fallback?: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback || '/exercises/placeholder.gif');
  const [triedFallback, setTriedFallback] = useState(false);

  // Reset when src changes (new step)
  useEffect(() => {
    setCurrentSrc(src || fallback || '/exercises/placeholder.gif');
    setTriedFallback(false);
  }, [src, fallback]);

  const handleError = () => {
    if (!triedFallback && fallback && currentSrc !== fallback) {
      setTriedFallback(true);
      setCurrentSrc(fallback);
    } else if (currentSrc !== '/exercises/placeholder.gif') {
      setCurrentSrc('/exercises/placeholder.gif');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export default function ExerciseScreen({ step, timeLeft, nextStep, isPaused }: ExerciseScreenProps) {
  const isWarning = timeLeft <= 3 && timeLeft > 0;

  return (
    <div className="flex flex-col h-full">
      {/* GIF area */}
      <div className="relative flex-1 min-h-0 bg-gray-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GifImage
              src={step.gif}
              fallback={step.fallbackGif}
              alt={step.name}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Paused overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white text-xl font-bold">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" />
              </svg>
              Duraklatıldı
            </div>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="bg-gray-950 px-5 pt-4 pb-2 flex flex-col gap-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PHASE_COLORS[step.phase]}`}
          >
            {PHASE_LABELS[step.phase]}
          </span>
          {step.round !== undefined && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-violet-500/20 text-violet-400 border-violet-500/30">
              Tur {step.round}
            </span>
          )}
        </div>

        {/* Exercise name */}
        <h2 className="text-2xl font-black text-white leading-tight">{step.name}</h2>

        {/* Countdown */}
        <motion.div
          className={`text-7xl font-black tabular-nums leading-none ${
            isWarning ? 'text-red-400' : 'text-emerald-400'
          }`}
          animate={isWarning ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={isWarning ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {timeLeft}
          <span className="text-2xl font-normal text-gray-500 ml-1">sn</span>
        </motion.div>

        {/* Next step preview */}
        {nextStep && (
          <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-3 py-2.5 mt-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
              <GifImage
                src={nextStep.gif}
                fallback={nextStep.fallbackGif}
                alt={nextStep.name}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sıradaki</p>
              <p className="text-sm text-gray-200 font-semibold truncate">{nextStep.name}</p>
            </div>
            <span className="ml-auto text-sm text-gray-500 flex-shrink-0">{nextStep.duration}sn</span>
          </div>
        )}
      </div>
    </div>
  );
}
