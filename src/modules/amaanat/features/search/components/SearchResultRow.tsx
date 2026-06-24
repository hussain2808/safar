import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { categoryLabel } from '@/modules/amaanat/lib/categories';
import { HighlightedText } from './HighlightedText';
import type { SearchMatch } from '../hooks/useSearchResults';

interface SearchResultRowProps {
  result: SearchMatch;
}

export const SearchResultRow = memo(function SearchResultRow({ result }: SearchResultRowProps) {
  const navigate = useNavigate();
  const { item, matches } = result;

  return (
    <button
      onClick={() => navigate(`/amaanat/item/${item.id}`)}
      className="w-full flex items-center gap-3 py-3.5 px-4 text-left active:bg-icon-bg transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-primary truncate">
          <HighlightedText text={item.name} matchKey="name" matches={matches} />
        </p>
        <p className="text-caption text-text-secondary mt-0.5">
          {categoryLabel(item.category)}
          {item.purchaseDate ? ` · ${format(item.purchaseDate, 'd MMM yyyy')}` : ''}
        </p>
      </div>
    </button>
  );
});
