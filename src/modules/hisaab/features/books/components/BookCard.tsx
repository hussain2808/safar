import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import { BookIcon, getBookColor } from '@/modules/hisaab/lib/bookIcons';
import { useUIStore } from '@/modules/hisaab/store/ui';
import type { BookWithStats } from '@/modules/hisaab/types';

interface BookCardProps {
  book: BookWithStats;
  index: number;
}

export const BookCard = memo(function BookCard({ book, index }: BookCardProps) {
  const navigate = useNavigate();
  const maskAmounts = useUIStore((s) => s.maskAmounts);
  const [revealed, setRevealed] = useState(false);
  const isNegative = book.balance < 0;
  const color = getBookColor(index);
  const masked = maskAmounts && !revealed;

  return (
    <button
      onClick={() => navigate(`/hisaab/book/${book.id}`)}
      className="w-full text-left bg-bg-card rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
    >
      <div className={cn('relative w-11 h-11 rounded-icon flex items-center justify-center flex-shrink-0', color.bg, color.fg)}>
        <BookIcon iconId={book.emoji} />
        {book.hasPendingSync && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-bg-card" aria-label="Not yet synced" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-hisaabText-primary truncate">{book.name}</p>
        <p className="text-caption text-hisaabText-secondary mt-0.5 truncate">
          {book.transactionCount} {book.transactionCount === 1 ? 'entry' : 'entries'}
        </p>
        <p className="text-caption text-hisaabText-secondary truncate">
          Last entry on {format(book.lastEntryAt, 'd MMM yyyy')}
        </p>
      </div>
      <p
        onClick={(e) => { if (maskAmounts) { e.stopPropagation(); } }}
        onDoubleClick={(e) => {
          if (!maskAmounts) return;
          e.stopPropagation();
          setRevealed((r) => !r);
        }}
        className={cn('font-sans tabular-nums text-amount-sm whitespace-nowrap flex-shrink-0 self-start', book.balance === 0 ? 'text-hisaabText-primary' : isNegative ? 'text-hisaabAccent-negative' : 'text-hisaabAccent-positive')}
      >
        {masked ? '••••••' : `${isNegative ? '-' : ''}${formatAmount(Math.abs(book.balance), book.currency)}`}
      </p>
    </button>
  );
});
