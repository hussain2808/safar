import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import { BookIcon } from '@/modules/hisaab/lib/bookIcons';
import type { BookWithStats } from '@/modules/hisaab/types';

interface BookCardProps {
  book: BookWithStats;
}

export const BookCard = memo(function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const isNegative = book.balance < 0;

  return (
    <button
      onClick={() => navigate(`/hisaab/book/${book.id}`)}
      className="w-full text-left bg-bg-card rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
    >
      <div className="relative w-10 h-10 rounded-full bg-bg-icon flex items-center justify-center flex-shrink-0 text-hisaabText-secondary">
        <BookIcon iconId={book.emoji} />
        {book.hasPendingSync && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-bg-card" aria-label="Not yet synced" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-body text-hisaabText-primary truncate">{book.name}</p>
          <p className={cn('font-sans tabular-nums text-body whitespace-nowrap flex-shrink-0', book.balance === 0 ? 'text-hisaabText-primary' : isNegative ? 'text-hisaabAccent-negative' : 'text-hisaabAccent-positive')}>
            {isNegative ? '-' : ''}{formatAmount(Math.abs(book.balance), book.currency)}
          </p>
        </div>
        <p className="text-caption text-hisaabText-secondary mt-0.5">
          {book.transactionCount} {book.transactionCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>
      <svg className="w-3.5 h-3.5 text-hisaabText-placeholder flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
});
