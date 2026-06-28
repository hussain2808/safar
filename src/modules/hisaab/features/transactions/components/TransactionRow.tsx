import { memo, useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Paperclip } from 'lucide-react';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';
import type { Transaction } from '@/modules/hisaab/types';

interface TransactionRowProps {
  transaction: Transaction;
  categoryLabel?: string;
  currency?: string;
  onOpen: (tx: Transaction) => void;
  forceReveal?: boolean;
}

export const TransactionRow = memo(function TransactionRow({ transaction, categoryLabel, currency, onOpen, forceReveal = false }: TransactionRowProps) {
  const isIn = transaction.type === 'in';
  const maskAmounts = useUIStore((s) => s.maskAmounts);
  const [revealed, setRevealed] = useState(false);
  const masked = maskAmounts && !revealed && !forceReveal;

  return (
    <button
      onClick={() => onOpen(transaction)}
      className="w-full flex items-center gap-3 py-3 px-4 bg-bg-card active:bg-bg-hover transition-colors duration-100 text-left"
    >
      <div className="w-11 h-11 rounded-icon bg-bg-icon flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-caption-md leading-none text-hisaabText-primary">{format(transaction.date, 'd')}</span>
        <span className="text-[10px] leading-none uppercase mt-0.5 text-hisaabText-secondary">{format(transaction.date, 'EEE')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-body font-semibold text-hisaabText-primary truncate">{transaction.remark || 'Untitled'}</span>
          {transaction.photoId && <Paperclip size={13} className="text-hisaabText-secondary flex-shrink-0" />}
          {transaction.pendingSync && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" aria-label="Not yet synced" />
          )}
        </div>
        <p className="text-caption text-hisaabText-secondary mt-0.5 truncate">
          {categoryLabel ?? 'Uncategorized'}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          onClick={maskAmounts ? (e) => e.stopPropagation() : undefined}
          onDoubleClick={maskAmounts ? (e) => { e.stopPropagation(); setRevealed((r) => !r); } : undefined}
          className={cn('font-sans tabular-nums text-amount-sm whitespace-nowrap', isIn ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}
        >
          {masked ? '••••••' : <>{isIn ? '+' : '-'} {formatAmount(transaction.amount, currency)}</>}
        </span>
        <MoreVertical size={16} className="text-hisaabText-secondary" />
      </div>
    </button>
  );
});
