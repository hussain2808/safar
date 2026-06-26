import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { ChevronLeft, Pencil, ArrowDownLeft, ArrowUpRight, MessageSquare, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoThumb } from '@/modules/hisaab/shared/components/PhotoThumb';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { CategoryIcon } from '@/modules/hisaab/lib/categoryIcons';
import { db } from '@/modules/hisaab/db';
import { getCurrency, DEFAULT_CURRENCY } from '@/modules/hisaab/lib/currencies';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';

function DetailRow({
  icon, label, children, last = false,
}: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3.5', !last && 'border-b border-hisaabBorder-light')}>
      <span className="w-8 h-8 rounded-full bg-bg-icon flex items-center justify-center text-hisaabText-secondary shrink-0">
        {icon}
      </span>
      <span className="flex-1 text-caption-md text-hisaabText-secondary">{label}</span>
      <span className="text-body text-hisaabText-primary text-right max-w-[55%] truncate">{children}</span>
    </div>
  );
}

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

  if (!viewingTransaction) return null;
  const isIn = viewingTransaction.type === 'in';

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
          <header className="flex items-center gap-2 px-2 pt-12 pb-1 flex-shrink-0">
            <button
              onClick={closeTransactionDetail}
              className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex-1 text-center">
              {book && <p className="text-caption text-hisaabText-secondary truncate">{book.emoji} {book.name}</p>}
            </div>
            <button
              onClick={handleEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
              aria-label="Edit entry"
            >
              <Pencil size={18} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto pb-10">
            <div className="flex flex-col items-center gap-3 pt-6 pb-8">
              <span
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isIn ? 'bg-hisaabAccent-positiveSoft text-hisaabAccent-positive' : 'bg-hisaabAccent-negativeSoft text-hisaabAccent-negative',
                )}
              >
                {isIn ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={cn('font-sans text-amount-lg', isIn ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
                  {currencySymbol}
                </span>
                <span className={cn('font-sans font-bold tabular-nums text-[48px] leading-none', isIn ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
                  {(viewingTransaction.amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-body text-hisaabText-primary text-center px-8 truncate max-w-full">
                {viewingTransaction.remark || 'Untitled'}
              </p>
            </div>

            <div className="px-5 space-y-4">
              <div className="bg-bg-card rounded-card border border-hisaabBorder-light shadow-card overflow-hidden">
                <DetailRow icon={<MessageSquare size={15} strokeWidth={1.5} />} label="Remark">
                  {viewingTransaction.remark || 'Untitled'}
                </DetailRow>
                <DetailRow icon={category ? <CategoryIcon iconId={category.icon} size={15} /> : <CategoryIcon size={15} />} label="Category">
                  {category?.label ?? 'None'}
                </DetailRow>
                <DetailRow icon={<CalendarDays size={15} strokeWidth={1.5} />} label="Date" last={!viewingTransaction.photoId}>
                  {format(viewingTransaction.date, 'd MMM yyyy')}
                </DetailRow>
              </div>

              {viewingTransaction.photoId && (
                <div>
                  <p className="flex items-center gap-1.5 text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">
                    <ImageIcon size={13} strokeWidth={1.5} />
                    Receipt
                  </p>
                  <PhotoThumb photoId={viewingTransaction.photoId} className="h-56" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
