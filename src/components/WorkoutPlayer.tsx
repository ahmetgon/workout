import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WorkoutPlan } from '../types';
import ExerciseScreen from './ExerciseScreen';
import RestScreen from './RestScreen';
import FinishScreen from './FinishScreen';

interface WorkoutPlayerProps {
  plan: WorkoutPlan;
  onQuit: () => void;
}

// Web Audio API: short 440Hz beep
function playBeep(audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.2);
}

const PHASE_LABELS: Record<string, string> = {
  warmup: 'Isınma',
  main: 'Ana',
  cooldown: 'Soğuma',
  rest: 'Dinlenme',
};

export default function WorkoutPlayer({ plan, onQuit }: WorkoutPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(plan.steps[0]?.duration ?? 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beepedRef = useRef<Set<string>>(new Set());

  const currentStep = plan.steps[stepIndex];
  const nextStep = plan.steps[stepIndex + 1] ?? null;
  const totalSteps = plan.steps.length;

  // Progress: completed steps + fraction of current step
  const completedTime = plan.steps
    .slice(0, stepIndex)
    .reduce((acc, s) => acc + s.duration, 0);
  const totalTime = plan.steps.reduce((acc, s) => acc + s.duration, 0);
  const currentStepProgress =
    currentStep ? (currentStep.duration - timeLeft) / currentStep.duration : 1;
  const progressFraction = totalTime > 0
    ? (completedTime + currentStep.duration * currentStepProgress) / totalTime
    : 0;

  // Advance to next step
  const goNext = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= plan.steps.length) {
      setIsFinished(true);
    } else {
      setStepIndex(next);
      setTimeLeft(plan.steps[next].duration);
      beepedRef.current.clear();
    }
  }, [stepIndex, plan.steps]);

  // Go to previous step
  const goPrev = useCallback(() => {
    if (stepIndex === 0) {
      setTimeLeft(plan.steps[0].duration);
      beepedRef.current.clear();
      return;
    }
    const prev = stepIndex - 1;
    setStepIndex(prev);
    setTimeLeft(plan.steps[prev].duration);
    beepedRef.current.clear();
  }, [stepIndex, plan.steps]);

  // Countdown timer
  useEffect(() => {
    if (isPaused || isFinished) return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          // Advance on next tick to avoid state batching issues
          setTimeout(goNext, 0);
          return 0;
        }

        // Beep on last 3 seconds
        if (soundOn && t <= 3) {
          const key = `${stepIndex}-${t}`;
          if (!beepedRef.current.has(key)) {
            beepedRef.current.add(key);
            if (!audioCtxRef.current) {
              audioCtxRef.current = new AudioContext();
            }
            playBeep(audioCtxRef.current);
          }
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPaused, isFinished, goNext, soundOn, stepIndex]);

  // Restart from beginning
  const restart = () => {
    setStepIndex(0);
    setTimeLeft(plan.steps[0]?.duration ?? 0);
    setIsPaused(false);
    setIsFinished(false);
    beepedRef.current.clear();
  };

  if (isFinished) {
    return <FinishScreen onRestart={restart} onHome={onQuit} />;
  }

  if (!currentStep) return null;

  const phase = currentStep.phase;
  const phaseLabel = PHASE_LABELS[phase] ?? phase;

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 bg-gray-950 z-10">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${progressFraction * 100}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </div>

        {/* Row: quit | counter + phase | sound */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-2 -ml-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Çık"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 font-medium">{phaseLabel}</span>
            <span className="text-sm font-bold text-gray-300">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <button
            onClick={() => setSoundOn((s) => !s)}
            className={`p-2 -mr-1 transition-colors ${soundOn ? 'text-emerald-400' : 'text-gray-600'}`}
            aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'}
          >
            {soundOn ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {currentStep.type === 'exercise' ? (
          <ExerciseScreen
            step={currentStep}
            timeLeft={timeLeft}
            nextStep={nextStep}
            isPaused={isPaused}
          />
        ) : (
          <RestScreen
            step={currentStep}
            timeLeft={timeLeft}
            nextStep={nextStep}
            isPaused={isPaused}
          />
        )}
      </div>

      {/* ── Controls ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-5 px-6 py-4 bg-gray-950 border-t border-gray-900">
        {/* Prev */}
        <button
          onClick={goPrev}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 active:scale-90 transition-all text-gray-300"
          aria-label="Önceki"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.689v8.122zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 8.71a1.125 1.125 0 011.683.977v8.123z" />
          </svg>
        </button>

        {/* Pause / Resume */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 transition-all text-gray-950 shadow-lg shadow-emerald-500/30"
          aria-label={isPaused ? 'Devam et' : 'Duraklat'}
        >
          {isPaused ? (
            <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={goNext}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 active:scale-90 transition-all text-gray-300"
          aria-label="Sonraki"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.69z" />
          </svg>
        </button>
      </div>

      {/* ── Quit confirm modal ───────────────────────────────────────────────── */}
      {showQuitConfirm && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-gray-950/80 backdrop-blur-sm pb-8 px-6">
          <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">Antrenmanı bırak?</h3>
            <p className="text-gray-400 text-sm mb-6">İlerlemeniz kaydedilmeyecek.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onQuit}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold transition-colors"
              >
                Evet, çık
              </button>
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
              >
                Devam et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
