import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutPlan, WorkoutStep } from '../types';
import { resetPlan } from '../lib/storage';

interface PlanEditorProps {
  plan: WorkoutPlan;
  onSave: (plan: WorkoutPlan) => void;
  onBack: () => void;
}

// Generate unique IDs for new steps
function genId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const PHASE_OPTIONS: WorkoutStep['phase'][] = ['warmup', 'main', 'cooldown', 'rest'];
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
const TYPE_COLORS: Record<WorkoutStep['type'], string> = {
  exercise: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  rest: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function newExerciseStep(): WorkoutStep {
  return {
    id: genId(),
    type: 'exercise',
    name: 'Yeni Egzersiz',
    duration: 30,
    phase: 'main',
    gif: '/exercises/placeholder.gif',
    fallbackGif: '/exercises/placeholder.gif',
  };
}

function newRestStep(): WorkoutStep {
  return {
    id: genId(),
    type: 'rest',
    name: 'Dinlen',
    duration: 20,
    phase: 'rest',
    gif: '/exercises/placeholder.gif',
    fallbackGif: '/exercises/placeholder.gif',
  };
}

// ── Step Row ───────────────────────────────────────────────────────────────────

interface StepRowProps {
  step: WorkoutStep;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (updated: WorkoutStep) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function StepRow({
  step,
  index,
  total,
  isExpanded,
  onToggle,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: StepRowProps) {
  const field = <K extends keyof WorkoutStep>(key: K, value: WorkoutStep[K]) =>
    onChange({ ...step, [key]: value });

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
      {/* Row header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        {/* Index */}
        <span className="text-xs text-gray-600 w-5 text-right flex-shrink-0">{index + 1}</span>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PHASE_COLORS[step.phase]}`}>
            {PHASE_LABELS[step.phase]}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[step.type]}`}>
            {step.type === 'exercise' ? 'Egzersiz' : 'Dinlenme'}
          </span>
          {step.round !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-violet-500/20 text-violet-400 border-violet-500/30">
              T{step.round}
            </span>
          )}
        </div>

        {/* Name */}
        <span className="flex-1 min-w-0 text-sm font-medium text-gray-200 truncate">
          {step.name}
        </span>

        {/* Duration */}
        <span className="text-xs text-gray-500 flex-shrink-0">{step.duration}sn</span>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Expanded edit area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-800 flex flex-col gap-3">
              {/* Name */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ad</span>
                <input
                  type="text"
                  value={step.name}
                  onChange={(e) => field('name', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>

              {/* Duration + Round */}
              <div className="flex gap-3">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Süre (sn)</span>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={step.duration}
                    onChange={(e) => field('duration', Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tur #</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="—"
                    value={step.round ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field('round', v === '' ? undefined : parseInt(v));
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </div>

              {/* Type + Phase */}
              <div className="flex gap-3">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tür</span>
                  <select
                    value={step.type}
                    onChange={(e) => field('type', e.target.value as WorkoutStep['type'])}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="exercise">Egzersiz</option>
                    <option value="rest">Dinlenme</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Faz</span>
                  <select
                    value={step.phase}
                    onChange={(e) => field('phase', e.target.value as WorkoutStep['phase'])}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {PHASE_OPTIONS.map((p) => (
                      <option key={p} value={p}>{PHASE_LABELS[p]}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* GIF URL */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">GIF URL</span>
                <input
                  type="text"
                  value={step.gif ?? ''}
                  onChange={(e) => field('gif', e.target.value || undefined)}
                  placeholder="/exercises/placeholder.gif"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>

              {/* Fallback GIF URL */}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fallback GIF</span>
                <input
                  type="text"
                  value={step.fallbackGif ?? ''}
                  onChange={(e) => field('fallbackGif', e.target.value || undefined)}
                  placeholder="/exercises/placeholder.gif"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                {/* Move up */}
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  disabled={index === 0}
                  className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  Yukarı
                </button>

                {/* Move down */}
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  disabled={index === total - 1}
                  className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                  Aşağı
                </button>

                {/* Duplicate */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                  className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  Kopyala
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Sil
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Plan Editor (main component) ───────────────────────────────────────────────

export default function PlanEditor({ plan, onSave, onBack }: PlanEditorProps) {
  const [draft, setDraft] = useState<WorkoutPlan>(() => ({
    ...plan,
    steps: plan.steps.map((s) => ({ ...s })),
  }));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateStep = (index: number, updated: WorkoutStep) => {
    setDraft((d) => {
      const steps = [...d.steps];
      steps[index] = updated;
      return { ...d, steps };
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= draft.steps.length) return;
    setDraft((d) => {
      const steps = [...d.steps];
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...d, steps };
    });
    setExpandedId(draft.steps[target]?.id ?? null);
  };

  const duplicateStep = (index: number) => {
    setDraft((d) => {
      const steps = [...d.steps];
      const copy = { ...steps[index], id: genId() };
      steps.splice(index + 1, 0, copy);
      return { ...d, steps };
    });
    setExpandedId(draft.steps[index] ? genId() : null);
  };

  const deleteStep = (index: number) => {
    setDraft((d) => {
      const steps = d.steps.filter((_, i) => i !== index);
      return { ...d, steps };
    });
    setExpandedId(null);
  };

  const addStep = (type: 'exercise' | 'rest') => {
    const step = type === 'exercise' ? newExerciseStep() : newRestStep();
    setDraft((d) => ({ ...d, steps: [...d.steps, step] }));
    setExpandedId(step.id);
    // Scroll to bottom
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    const fresh = resetPlan();
    setDraft({ ...fresh, steps: fresh.steps.map((s) => ({ ...s })) });
    setShowResetConfirm(false);
    setExpandedId(null);
  };

  const totalTime = draft.steps.reduce((acc, s) => acc + s.duration, 0);
  const exerciseCount = draft.steps.filter((s) => s.type === 'exercise').length;

  return (
    <div className="min-h-screen bg-gray-950 pb-32">
      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-900 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Geri"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">Planı Düzenle</h1>
            <p className="text-xs text-gray-500">
              {exerciseCount} egzersiz · {draft.steps.length} adım · ~{Math.round(totalTime / 60)}dk
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950'
            }`}
          >
            {saved ? 'Kaydedildi ✓' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* ── Plan meta ───────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Plan Adı</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Açıklama</span>
          <input
            type="text"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </label>
      </div>

      {/* ── Steps list ──────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-2 flex flex-col gap-2">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider px-1 mb-1">
          Adımlar ({draft.steps.length})
        </p>
        {draft.steps.map((step, i) => (
          <StepRow
            key={step.id}
            step={step}
            index={i}
            total={draft.steps.length}
            isExpanded={expandedId === step.id}
            onToggle={() => setExpandedId(expandedId === step.id ? null : step.id)}
            onChange={(updated) => updateStep(i, updated)}
            onMoveUp={() => moveStep(i, 'up')}
            onMoveDown={() => moveStep(i, 'down')}
            onDuplicate={() => duplicateStep(i)}
            onDelete={() => deleteStep(i)}
          />
        ))}

        {draft.steps.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            Henüz adım yok. Aşağıdan ekle.
          </div>
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-gray-950/95 backdrop-blur border-t border-gray-900 px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => addStep('exercise')}
              className="flex-1 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Egzersiz Ekle
            </button>
            <button
              onClick={() => addStep('rest')}
              className="flex-1 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Dinlenme Ekle
            </button>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-500 hover:text-gray-400 font-medium text-xs transition-colors"
          >
            Default plana dön
          </button>
        </div>
      </div>

      {/* ── Reset confirm modal ─────────────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/80 backdrop-blur-sm pb-8 px-6">
          <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">Default plana dön?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Tüm değişiklikleriniz silinecek ve plan varsayılan haline döndürülecek.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold transition-colors"
              >
                Evet, sıfırla
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
