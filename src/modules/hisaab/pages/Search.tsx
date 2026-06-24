import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { useSearchStore } from '@/modules/hisaab/store/search';
import { useSearchResults } from '@/modules/hisaab/features/search/hooks/useSearchResults';
import { SearchResultRow } from '@/modules/hisaab/features/search/components/SearchResultRow';
import { EmptyState } from '@/modules/hisaab/shared/components/EmptyState';
import { TransactionRowSkeleton } from '@/modules/hisaab/shared/components/Skeleton';

export default function Search() {
  const navigate = useNavigate();
  const { query, setQuery, clear } = useSearchStore();
  const { groups, isLoading } = useSearchResults(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => clear();
  }, [clear]);

  const hasQuery = query.trim().length > 0;
  const hasResults = groups.length > 0;

  const handleOpenResult = useCallback((bookId: string) => navigate(`/hisaab/book/${bookId}`), [navigate]);

  return (
    <div className="h-screen bg-bg-primary flex flex-col">
      <header className="px-2 pt-12 pb-2 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 flex items-center bg-bg-card rounded-button px-4 py-2.5 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search remarks, categories, amounts…"
            className="flex-1 min-w-0 bg-transparent outline-none text-body text-hisaabText-primary placeholder:text-hisaabText-placeholder"
          />
          {hasQuery && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-hisaabText-secondary flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        {!hasQuery ? (
          <EmptyState title="Search your books" description="Find entries by remark, category, amount, or book name." />
        ) : isLoading ? (
          <div className="px-4 pt-3">
            <div className="bg-bg-card rounded-card shadow-card overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <TransactionRowSkeleton key={i} />)}
            </div>
          </div>
        ) : !hasResults ? (
          <EmptyState title="No results" description={`Nothing matches “${query.trim()}”.`} />
        ) : (
          <div className="px-4 pt-3 space-y-5">
            {groups.map((group) => (
              <div key={group.book.id}>
                <div className="flex items-center gap-2 px-2 pb-2">
                  <span className="text-base flex-shrink-0">{group.book.emoji}</span>
                  <span className="text-caption text-hisaabText-secondary uppercase tracking-wide truncate">{group.book.name}</span>
                </div>
                <div className="bg-bg-card rounded-card shadow-card overflow-hidden divide-y divide-hisaabBorder-light">
                  {group.results.map((result) => (
                    <SearchResultRow
                      key={result.transaction.id}
                      result={result}
                      bookId={group.book.id}
                      onOpen={handleOpenResult}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
