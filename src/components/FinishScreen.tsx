import { motion } from 'framer-motion';

interface FinishScreenProps {
  onRestart: () => void;
  onHome: () => void;
}

export default function FinishScreen({ onRestart, onHome }: FinishScreenProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-950"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Trophy icon */}
      <motion.div
        className="mb-8 flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
      >
        <svg
          className="w-12 h-12 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      </motion.div>

      <motion.h1
        className="text-4xl font-black text-white mb-3 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Harika iş!
      </motion.h1>

      <motion.p
        className="text-gray-400 text-lg text-center mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Antrenman tamamlandı. 💪
      </motion.p>

      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onRestart}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-gray-950 font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/20"
        >
          Tekrar Başla
        </button>
        <button
          onClick={onHome}
          className="w-full border border-gray-700 hover:border-gray-500 active:scale-95 transition-all text-gray-300 hover:text-white font-medium text-base py-3 rounded-2xl"
        >
          Ana Ekrana Dön
        </button>
      </motion.div>
    </motion.div>
  );
}
