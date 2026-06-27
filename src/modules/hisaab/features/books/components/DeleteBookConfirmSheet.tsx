import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteBookConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookName: string;
  busy?: boolean;
}

export function DeleteBookConfirmSheet({ open, onClose, onConfirm, bookName, busy }: DeleteBookConfirmSheetProps) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!open) setInput('');
  }, [open]);

  const matches = input === bookName;

  function handleConfirm() {
    if (!matches || busy) return;
    onConfirm();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[61] bg-bg-card rounded-t-card px-5 pt-6 pb-4"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex justify-center mb-5">
              <div className="w-10 h-1 rounded-full bg-hisaabBorder-light" />
            </div>

            <p className="text-section-heading text-hisaabText-primary mb-2">Delete "{bookName}"?</p>
            <p className="text-body text-hisaabText-secondary mb-5 leading-snug">
              All entries in this book will be permanently deleted. This cannot be undone.
            </p>

            <p className="text-caption text-hisaabText-secondary mb-2">
              Type <span className="text-hisaabText-primary font-medium">{bookName}</span> to confirm.
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={bookName}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-bg-primary rounded-button px-4 py-3 text-body text-hisaabText-primary placeholder:text-hisaabText-placeholder outline-none border border-hisaabBorder-light focus:border-hisaabText-secondary transition-colors"
            />

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={handleConfirm}
                disabled={!matches || busy}
                className="w-full py-4 rounded-button text-body font-medium bg-hisaabAccent-negative text-white disabled:opacity-40 active:scale-[0.98] transition-transform duration-100"
              >
                Delete Book
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-button text-body font-medium text-hisaabText-secondary bg-bg-primary active:scale-[0.98] transition-transform duration-100"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
