import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { DuaCard } from '@/modules/dua/features/duas/components/DuaCard';
import { CategoryFilterChips } from '@/modules/dua/features/duas/components/CategoryFilterChips';
import { DuaRowSkeleton } from '@/modules/dua/shared/components/Skeleton';
import { EmptyState } from '@/modules/dua/shared/components/EmptyState';
import { useDuas } from '@/modules/dua/features/duas/hooks/useDuas';
import type { DuaCategory } from '@/modules/dua/types';

export default function MyDuas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { duas, archived, favorites, isLoading } = useDuas();
  const [category, setCategory] = useState<DuaCategory | 'all'>(
    (searchParams.get('category') as DuaCategory | null) ?? 'all',
  );
  const favoritesOnly = searchParams.get('filter') === 'favorites';
  const archivedOnly = searchParams.get('filter') === 'archived';
  const sortRecent = searchParams.get('sort') === 'recent';

  const filtered = useMemo(() => {
    const base = archivedOnly ? archived : favoritesOnly ? favorites : duas;
    const byCategory = base.filter((d) => category === 'all' || d.category === category);
    if (!sortRecent) return byCategory;
    return [...byCategory].sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0));
  }, [duas, archived, favorites, favoritesOnly, archivedOnly, sortRecent, category]);

  const title = archivedOnly ? 'Archived' : favoritesOnly ? 'Favorites' : sortRecent ? 'Recently Opened' : 'My Duas';

  return (
    <div className="min-h-screen bg-cream pb-32 flex flex-col">
      <header className="px-5 pt-6 pb-4 flex items-center gap-2">
        <button onClick={() => navigate('/dua')} className="w-9 h-9 -ml-1.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Dua">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary leading-tight">{title}</h1>
      </header>

      <div className="mb-3">
        <CategoryFilterChips value={category} onChange={setCategory} />
      </div>

      <main className="flex-1 px-4 space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DuaRowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing here yet" description="Try a different collection, or add a new dua." />
        ) : (
          <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border/60 overflow-hidden">
            {filtered.map((dua) => <DuaCard key={dua.id} dua={dua} />)}
          </div>
        )}
      </main>
    </div>
  );
}
