import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { ChevronLeft, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoThumb } from '@/modules/hisaab/shared/components/PhotoThumb';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { CategoryIcon } from '@/modules/hisaab/lib/categoryIcons';
import { db } from '@/modules/hisaab/db';
import { getCurrency, DEFAULT_CURRENCY } from '@/modules/hisaab/lib/currencies';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';

export function TransactionDetailSheet() {
  const { transactionDetailOpen, viewingTransaction, closeTransactionDetail, openEditTransaction } = useUIStore();

  const book = useLiveQuery(
    () => viewingTransaction ? db.books.get(viewingTransaction.bookId) : undefined,
    [viewingTransaction?.bookId],
  );
  const { categories } = useCategories(viewingTransaction?.bookId);
  const currencySymbol = getCurrency(book?.currency ?? DEFAULT_CURRENCY).symbol;
  const category = categories.find((c) => c.id === viewingTransaction?.category);

  useEffect(() => {
    document.body.style.overflow = transactionDetailOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [transactionDetailOpen]);

  function handleEdit() {
    if (!viewingTransaction) return;
    const tx = viewingTransaction;
    closeTransactionDetail();
    openEditTransaction(tx);
  }

  return (
    <AnimatePresence>
      {transactionDetailOpen && viewingTransaction && (
        <motion.div
          className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <header className="flex items-center gap-2 px-2 pt-12 pb-3 flex-shrink-0">
            <button
              onClick={closeTransactionDetail}
              className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="flex-1 text-heading-2 text-hisaabText-primary">Entry</h1>
            <button
              onClick={handleEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
              aria-label="Edit entry"
            >
              <Pencil size={18} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto pb-10">
            <div className="flex items-baseline justify-center gap-2 py-8">
              <span className={cn('font-sans text-heading-2', viewingTransaction.type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
                {currencySymbol}
              </span>
              <span className={cn('font-sans tabular-nums text-[52px] leading-none', viewingTransaction.type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
                {(viewingTransaction.amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="px-5 space-y-4">
              <div className="bg-bg-card rounded-button px-4 py-3.5 border border-hisaabBorder-light shadow-card">
                <p className="text-caption text-hisaabText-secondary">Remark</p>
                <p className="text-body text-hisaabText-primary mt-0.5">{viewingTransaction.remark || 'Untitled'}</p>
              </div>

              <div className="flex items-center gap-3 bg-bg-card rounded-button px-4 py-3.5 border border-hisaabBorder-light shadow-card">
                <span className="flex-1 text-body text-hisaabText-primary">Category</span>
                {category ? (
                  <span className="flex items-center gap-1.5 text-caption-md text-hisaabText-secondary">
                    <CategoryIcon iconId={category.icon} size={14} />
                    {category.label}
                  </span>
                ) : (
                  <span className="text-caption-md text-hisaabText-secondary">None</span>
                )}
              </div>

              <div className="flex items-center gap-3 bg-bg-card rounded-button px-4 py-3.5 border border-hisaabBorder-light shadow-card">
                <span className="flex-1 text-body text-hisaabText-primary">Date</span>
                <span className="text-caption-md text-hisaabText-secondary">{format(viewingTransaction.date, 'd MMM yyyy')}</span>
              </div>

              {viewingTransaction.photoId && (
                <div>
                  <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Receipt</p>
                  <PhotoThumb photoId={viewingTransaction.photoId} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
