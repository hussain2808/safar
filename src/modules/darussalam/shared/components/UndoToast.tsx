import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useUndoToast } from '@/modules/darussalam/shared/store/useUndoToast';

const AUTO_DISMISS_MS = 5000;

export function UndoToast() {
  const pending = useUndoToast((s) => s.pending);
  const dismiss = useUndoToast((s) => s.dismiss);

  useEffect(() => {
    if (!pending) return;
    const timeout = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [pending, dismiss]);

  async function handleUndo() {
    if (!pending) return;
    await pending.onUndo();
    dismiss();
  }

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          key={pending.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-24 inset-x-5 z-40 flex justify-center"
        >
          <div className="bg-darussalam-green text-white rounded-full shadow-button px-4 py-2.5 flex items-center gap-3 max-w-full">
            <span className="text-sm truncate">{pending.message}</span>
            <button onClick={handleUndo} className="flex items-center gap-1 text-sm font-medium flex-shrink-0 underline underline-offset-2">
              <RotateCcw size={13} /> Undo
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
