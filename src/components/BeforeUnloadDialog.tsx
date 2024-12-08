import { motion, AnimatePresence } from 'framer-motion';

interface BeforeUnloadDialogProps {
  isVisible: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function BeforeUnloadDialog({ isVisible, onStay, onLeave }: BeforeUnloadDialogProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Leave Game?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You have an unfinished game. Are you sure you want to leave? Your progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onStay}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={onLeave}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}