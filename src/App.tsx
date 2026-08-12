import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WorkoutPlan, AppView } from './types';
import { loadState, saveState } from './lib/storage';
import WorkoutPlayer from './components/WorkoutPlayer';
import PlanEditor from './components/PlanEditor';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const pageTransition = { duration: 0.25, ease: 'easeInOut' };

function planMinutes(plan: WorkoutPlan): number {
  return Math.round(plan.steps.reduce((acc, s) => acc + s.duration, 0) / 60);
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [state, setState] = useState(() => loadState());

  // Persist whenever plans or selection change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const activePlan =
    state.plans.find((p) => p.id === state.activePlanId) ?? state.plans[0];

  const updateActivePlan = (updated: WorkoutPlan) => {
    setState((s) => ({
      ...s,
      plans: s.plans.map((p) => (p.id === updated.id ? updated : p)),
      activePlanId: updated.id,
    }));
  };

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
              plans={state.plans}
              activePlan={activePlan}
              onSelectPlan={(id) =>
                setState((s) => ({ ...s, activePlanId: id }))
              }
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
              plan={activePlan}
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
              plan={activePlan}
              onSave={(updated) => {
                updateActivePlan(updated);
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
  plans: WorkoutPlan[];
  activePlan: WorkoutPlan;
  onSelectPlan: (id: string) => void;
  onStart: () => void;
  onEdit: () => void;
}

function HomeScreen({
  plans,
  activePlan,
  onSelectPlan,
  onStart,
  onEdit,
}: HomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10">
      {/* Logo / icon */}
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <svg
          className="w-8 h-8 text-emerald-400"
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

      <h1 className="text-3xl font-black tracking-tight text-white mb-1 text-center">
        Antrenman
      </h1>
      <p className="text-gray-500 text-sm mb-8">Bir plan seç ve başla</p>

      {/* Plan cards */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={plan.id === activePlan.id}
            onSelect={() => onSelectPlan(plan.id)}
          />
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full max-w-sm bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-gray-950 font-bold text-lg py-4 rounded-2xl mb-3 shadow-lg shadow-emerald-500/20"
      >
        Başla
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="w-full max-w-sm border border-gray-700 hover:border-gray-500 active:scale-95 transition-all text-gray-300 hover:text-white font-medium text-base py-3 rounded-2xl"
      >
        Planı Düzenle
      </button>
    </div>
  );
}

function PlanCard({
  plan,
  isActive,
  onSelect,
}: {
  plan: WorkoutPlan;
  isActive: boolean;
  onSelect: () => void;
}) {
  const exerciseCount = plan.steps.filter((s) => s.type === 'exercise').length;

  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all active:scale-[0.98] ${
        isActive
          ? 'bg-emerald-500/10 border-emerald-500/60'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            isActive ? 'border-emerald-400' : 'border-gray-600'
          }`}
        >
          {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </span>
        <span className="flex-1 min-w-0 font-bold text-white text-base truncate">
          {plan.name}
        </span>
        <span className="flex-shrink-0 text-sm font-bold text-emerald-400">
          ~{planMinutes(plan)}dk
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 leading-snug pl-7">
        {plan.description}
      </p>
      <p className="text-[11px] text-gray-600 mt-1.5 pl-7 uppercase tracking-wide">
        {exerciseCount} egzersiz · {plan.steps.length} adım
      </p>
    </button>
  );
}
