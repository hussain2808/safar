import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'default',
}: ConfirmSheetProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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

            <p className="text-heading-2 text-hisaabText-primary mb-2">{title}</p>
            {description && (
              <p className="text-body text-hisaabText-secondary mb-6 leading-snug">{description}</p>
            )}

            <div className="flex flex-col gap-2.5 mt-6">
              <button
                onClick={handleConfirm}
                className={
                  variant === 'danger'
                    ? 'w-full py-4 rounded-button text-body font-medium bg-hisaabAccent-negative text-white active:scale-[0.98] transition-transform duration-100'
                    : 'w-full py-4 rounded-button text-body font-medium bg-hisaabAccent-button text-hisaabAccent-buttonText active:scale-[0.98] transition-transform duration-100'
                }
              >
                {confirmLabel}
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
