import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { DuaCard } from '@/modules/dua/features/duas/components/DuaCard';
import { EmptyState } from '@/modules/dua/shared/components/EmptyState';
import { DuaRowSkeleton } from '@/modules/dua/shared/components/Skeleton';
import { useDuas } from '@/modules/dua/features/duas/hooks/useDuas';
import { categoryLabel } from '@/modules/dua/lib/categories';

export default function Search() {
  const navigate = useNavigate();
  const { duas, isLoading } = useDuas();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return duas.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      categoryLabel(d.category).toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q) ||
      d.contentBlocks.some((b) => b.text?.toLowerCase().includes(q)),
    );
  }, [duas, query]);

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
            placeholder="Search your duas…"
            className="flex-1 min-w-0 bg-transparent outline-none text-body text-text-primary placeholder:text-text-muted"
          />
          {hasQuery && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-text-secondary flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-32 space-y-2.5">
        {!hasQuery ? (
          <EmptyState title="Search your library" description="Find duas by title, category, or words within them." />
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DuaRowSkeleton key={i} />)
        ) : !hasResults ? (
          <EmptyState title="No results" description={`Nothing matches "${query.trim()}".`} />
        ) : (
          results.map((dua) => <DuaCard key={dua.id} dua={dua} />)
        )}
      </div>
    </div>
  );
}
