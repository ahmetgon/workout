import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WorkoutPlan, AppView } from './types';
import { loadPlan, savePlan } from './lib/storage';
import WorkoutPlayer from './components/WorkoutPlayer';
import PlanEditor from './components/PlanEditor';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const pageTransition = { duration: 0.25, ease: 'easeInOut' };

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [plan, setPlan] = useState<WorkoutPlan>(() => loadPlan());

  // Persist whenever plan changes
  useEffect(() => {
    savePlan(plan);
  }, [plan]);

  const totalMinutes = Math.round(
    plan.steps.reduce((acc, s) => acc + s.duration, 0) / 60
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HomeScreen
              plan={plan}
              totalMinutes={totalMinutes}
              onStart={() => setView('player')}
              onEdit={() => setView('editor')}
            />
          </motion.div>
        )}

        {view === 'player' && (
          <motion.div
            key="player"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="h-screen"
          >
            <WorkoutPlayer
              plan={plan}
              onQuit={() => setView('home')}
            />
          </motion.div>
        )}

        {view === 'editor' && (
          <motion.div
            key="editor"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <PlanEditor
              plan={plan}
              onSave={(updated) => {
                setPlan(updated);
                setView('home');
              }}
              onBack={() => setView('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Home Screen ────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  plan: WorkoutPlan;
  totalMinutes: number;
  onStart: () => void;
  onEdit: () => void;
}

function HomeScreen({ plan, totalMinutes, onStart, onEdit }: HomeScreenProps) {
  const exerciseCount = plan.steps.filter((s) => s.type === 'exercise').length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Logo / icon */}
      <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <svg
          className="w-10 h-10 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      </div>

      {/* Plan name */}
      <h1 className="text-4xl font-black tracking-tight text-white mb-2 text-center">
        {plan.name}
      </h1>

      {/* Description */}
      <p className="text-gray-400 text-center mb-8 max-w-sm">
        {plan.description}
      </p>

      {/* Stats */}
      <div className="flex gap-6 mb-10">
        <Stat label="Egzersiz" value={exerciseCount.toString()} />
        <div className="w-px bg-gray-800" />
        <Stat label="Adım" value={plan.steps.length.toString()} />
        <div className="w-px bg-gray-800" />
        <Stat label="Süre" value={`~${totalMinutes}dk`} />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-gray-950 font-bold text-lg py-4 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20"
      >
        Başla
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="w-full max-w-xs border border-gray-700 hover:border-gray-500 active:scale-95 transition-all text-gray-300 hover:text-white font-medium text-base py-3 rounded-2xl"
      >
        Planı Düzenle
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-emerald-400">{value}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}
