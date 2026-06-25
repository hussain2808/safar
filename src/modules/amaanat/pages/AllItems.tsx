import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft, Search as SearchIcon, AlertTriangle, Clock, LayoutGrid } from 'lucide-react';
import { ItemCard } from '@/modules/amaanat/features/items/components/ItemCard';
import { CategoryFilterChips } from '@/modules/amaanat/features/items/components/CategoryFilterChips';
import { ItemCardSkeleton } from '@/modules/amaanat/shared/components/Skeleton';
import { EmptyState } from '@/modules/amaanat/shared/components/EmptyState';
import { useItems } from '@/modules/amaanat/features/items/hooks/useItems';
import { cn } from '@/modules/amaanat/lib/utils';
import type { ItemCategory } from '@/modules/amaanat/types';

export default function AllItems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, attentionItems, isLoading } = useItems();
  const [category, setCategory] = useState<ItemCategory | 'all'>(
    (searchParams.get('category') as ItemCategory | null) ?? 'all',
  );
  const [sortMode, setSortMode] = useState<'category' | 'timeline'>('category');
  const attentionOnly = searchParams.get('filter') === 'attention';

  const filtered = useMemo(() => {
    const base = attentionOnly ? attentionItems : items;
    return category === 'all' ? base : base.filter((i) => i.category === category);
  }, [items, attentionItems, attentionOnly, category]);

  const timelineBuckets = useMemo(() => {
    const buckets = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = item.purchaseDate ? format(item.purchaseDate, 'MMMM yyyy') : 'Undated';
      const list = buckets.get(key) ?? [];
      list.push(item);
      buckets.set(key, list);
    }
    const sortedKeys = [...buckets.keys()].sort((a, b) => {
      if (a === 'Undated') return 1;
      if (b === 'Undated') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    return sortedKeys.map((key) => ({ key, items: buckets.get(key)! }));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button onClick={() => navigate('/amaanat')} className="w-9 h-9 -ml-1.5 mt-0.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Amaanat">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-[30px] font-bold text-text-primary leading-tight">
              {attentionOnly ? 'Needs Attention' : 'All Items'}
            </h1>
            <p className="text-caption text-text-secondary mt-1">
              {attentionOnly ? 'Items with expiring or expired warranties' : 'Everything entrusted to your care'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => setSortMode(sortMode === 'category' ? 'timeline' : 'category')} className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors" aria-label="Toggle timeline view">
            {sortMode === 'category' ? <Clock size={16} /> : <LayoutGrid size={16} />}
          </button>
          <button onClick={() => navigate('/amaanat/search')} className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors" aria-label="Search">
            <SearchIcon size={17} />
          </button>
        </div>
      </header>

      {!attentionOnly && !!attentionItems.length && (
        <div className="px-4 mb-3">
          <div className="bg-accent-orange-bg rounded-card px-4 py-3 flex items-center gap-3">
            <AlertTriangle size={16} className="text-accent-orange-fg flex-shrink-0" />
            <p className="text-caption-md text-accent-orange-fg">
              {attentionItems.length} item{attentionItems.length === 1 ? '' : 's'} need{attentionItems.length === 1 ? 's' : ''} attention
            </p>
          </div>
        </div>
      )}

      <div className="mb-3">
        <CategoryFilterChips value={category} onChange={setCategory} />
      </div>

      <main className="flex-1 px-4 pb-32 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <ItemCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState title="No items yet" description="Add your first item to start your vault." />
        ) : sortMode === 'category' ? (
          filtered.map((item) => <ItemCard key={item.id} item={item} />)
        ) : (
          timelineBuckets.map((bucket) => (
            <div key={bucket.key}>
              <p className={cn('text-caption text-text-secondary uppercase tracking-wide px-1 pb-2', bucket.key !== timelineBuckets[0].key && 'pt-2')}>
                {bucket.key}
              </p>
              <div className="space-y-3">
                {bucket.items.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          ))
        )}
      </main>

      <div className="fixed bottom-8 inset-x-4">
        <button onClick={() => navigate('/amaanat/item/new')} className="w-full bg-brown text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100">
          + New Item
        </button>
      </div>
    </div>
  );
}
