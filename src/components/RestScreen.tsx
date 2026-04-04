import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WorkoutStep } from '../types';

interface RestScreenProps {
  step: WorkoutStep;
  timeLeft: number;
  nextStep: WorkoutStep | null;
  isPaused: boolean;
}

function SmallGif({ src, fallback, alt }: { src?: string; fallback?: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback || '/exercises/placeholder.gif');

  useEffect(() => {
    setCurrentSrc(src || fallback || '/exercises/placeholder.gif');
  }, [src, fallback]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(fallback || '/exercises/placeholder.gif')}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export default function RestScreen({ step, timeLeft, nextStep, isPaused }: RestScreenProps) {
  const isWarning = timeLeft <= 3 && timeLeft > 0;

  return (
    <div className="flex flex-col h-full items-center justify-center bg-gray-950 px-6 py-8">
      {/* Rest icon */}
      <motion.div
        className="mb-6 w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-9 5.25-9-5.25v-2.25"
          />
        </svg>
      </motion.div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-white mb-2">
        {step.name === 'Tur arası dinlenme' ? 'Tur Arası Dinlenme' : 'Dinlen'}
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        {step.name === 'Tur arası dinlenme' ? 'Sonraki tur başlıyor...' : 'Nefes al, hazırlan'}
      </p>

      {/* Paused badge */}
      {isPaused && (
        <div className="mb-4 px-4 py-2 rounded-full bg-gray-800 text-gray-400 text-sm font-medium">
          Duraklatıldı
        </div>
      )}

      {/* Countdown */}
      <motion.div
        className={`text-8xl font-black tabular-nums leading-none mb-8 ${
          isWarning ? 'text-red-400' : 'text-blue-400'
        }`}
        animate={isWarning ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={isWarning ? { duration: 0.5, repeat: Infinity } : {}}
      >
        {timeLeft}
        <span className="text-3xl font-normal text-gray-600 ml-1">sn</span>
      </motion.div>

      {/* Next exercise preview */}
      {nextStep && nextStep.type === 'exercise' && (
        <div className="w-full max-w-xs bg-gray-900 rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sıradaki egzersiz</p>
          </div>
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
              <SmallGif
                src={nextStep.gif}
                fallback={nextStep.fallbackGif}
                alt={nextStep.name}
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">{nextStep.name}</p>
              <p className="text-sm text-gray-500">{nextStep.duration} saniye</p>
            </div>
          </div>
        </div>
      )}

      {/* If next is also rest or end */}
      {nextStep && nextStep.type === 'rest' && (
        <p className="text-gray-500 text-sm">Sıradaki: {nextStep.name}</p>
      )}
    </div>
  );
}
