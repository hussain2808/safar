import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { useSearchStore } from '@/modules/amaanat/store/search';
import { useSearchResults } from '@/modules/amaanat/features/search/hooks/useSearchResults';
import { SearchResultRow } from '@/modules/amaanat/features/search/components/SearchResultRow';
import { EmptyState } from '@/modules/amaanat/shared/components/EmptyState';
import { ItemRowSkeleton } from '@/modules/amaanat/shared/components/Skeleton';

export default function Search() {
  const navigate = useNavigate();
  const { query, setQuery, clear } = useSearchStore();
  const { results, isLoading } = useSearchResults(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => clear();
  }, [clear]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="h-screen bg-cream flex flex-col">
      <header className="px-2 pt-12 pb-2 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 flex items-center bg-card-bg rounded-button px-4 py-2.5 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, categories, serial numbers…"
            className="flex-1 min-w-0 bg-transparent outline-none text-body text-text-primary placeholder:text-text-muted"
          />
          {hasQuery && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-text-secondary flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        {!hasQuery ? (
          <EmptyState title="Search your vault" description="Find items by name, category, merchant, or serial number." />
        ) : isLoading ? (
          <div className="px-4 pt-3">
            <div className="bg-card-bg rounded-card shadow-card overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <ItemRowSkeleton key={i} />)}
            </div>
          </div>
        ) : !hasResults ? (
          <EmptyState title="No results" description={`Nothing matches "${query.trim()}".`} />
        ) : (
          <div className="px-4 pt-3">
            <div className="bg-card-bg rounded-card shadow-card overflow-hidden divide-y divide-card-border">
              {results.map((result) => (
                <SearchResultRow key={result.item.id} result={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
