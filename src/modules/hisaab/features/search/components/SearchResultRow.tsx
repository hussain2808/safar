import { memo } from 'react';
import { format } from 'date-fns';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import { HighlightedText } from './HighlightedText';
import type { SearchMatch } from '../hooks/useSearchResults';

interface SearchResultRowProps {
  result: SearchMatch;
  bookId: string;
  onOpen: (bookId: string) => void;
}

export const SearchResultRow = memo(function SearchResultRow({ result, bookId, onOpen }: SearchResultRowProps) {
  const { transaction, categoryLabel, matches } = result;
  const isIn = transaction.type === 'in';

  return (
    <button
      onClick={() => onOpen(bookId)}
      className="w-full flex items-center gap-3 py-3.5 px-4 text-left active:bg-bg-hover transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-body text-hisaabText-primary truncate">
          <HighlightedText text={transaction.remark || 'Untitled'} matchKey="remark" matches={matches} />
        </p>
        <p className="text-caption text-hisaabText-secondary mt-0.5">
          {categoryLabel ? `${categoryLabel} · ` : ''}{format(transaction.date, 'd MMM yyyy')}
        </p>
      </div>
      <span className={cn('font-sans tabular-nums text-amount-sm whitespace-nowrap', isIn ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
        {isIn ? '+' : '-'} {formatAmount(transaction.amount)}
      </span>
    </button>
  );
});
