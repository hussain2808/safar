import { memo } from 'react';
import { format } from 'date-fns';
import { Paperclip } from 'lucide-react';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import type { Transaction } from '@/modules/hisaab/types';

interface TransactionRowProps {
  transaction: Transaction;
  categoryLabel?: string;
  currency?: string;
  onOpen: (tx: Transaction) => void;
}

export const TransactionRow = memo(function TransactionRow({ transaction, categoryLabel, currency, onOpen }: TransactionRowProps) {
  const isIn = transaction.type === 'in';

  return (
    <button
      onClick={() => onOpen(transaction)}
      className="w-full flex items-center gap-3 py-4 px-4 bg-bg-card border-b border-hisaabBorder-light active:bg-bg-hover transition-colors duration-100 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-body text-hisaabText-primary truncate">{transaction.remark || 'Untitled'}</span>
          {transaction.photoId && <Paperclip size={13} className="text-hisaabText-secondary flex-shrink-0" />}
        </div>
        <p className="text-caption text-hisaabText-secondary mt-0.5">
          {categoryLabel ? `${categoryLabel} · ` : ''}{format(transaction.date, 'd MMM')}
        </p>
      </div>
      <span className={cn('font-sans tabular-nums text-body whitespace-nowrap', isIn ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
        {isIn ? '+' : '-'} {formatAmount(transaction.amount, currency)}
      </span>
    </button>
  );
});
