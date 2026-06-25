import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon, ShieldCheck, Bell, MoreHorizontal, Plus } from 'lucide-react';
import { Skeleton } from '@/modules/amaanat/shared/components/Skeleton';
import { EmptyState } from '@/modules/amaanat/shared/components/EmptyState';
import { useItems } from '@/modules/amaanat/features/items/hooks/useItems';
import { StatsGrid } from '@/modules/amaanat/features/dashboard/components/StatsGrid';
import { CategoryOverview } from '@/modules/amaanat/features/dashboard/components/CategoryOverview';
import { UpcomingReminders } from '@/modules/amaanat/features/dashboard/components/UpcomingReminders';
import { RecentlyAdded } from '@/modules/amaanat/features/dashboard/components/RecentlyAdded';

export default function Home() {
  const navigate = useNavigate();
  const { items, attentionItems, stats, upcomingReminders, isLoading } = useItems();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button onClick={() => navigate('/')} className="w-9 h-9 -ml-1.5 mt-0.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Safar">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 mt-0.5 rounded-xl bg-brown text-cream flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={17} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif text-[26px] font-bold text-text-primary leading-tight">Amaanat</h1>
              <p className="text-caption-md text-brown -mt-0.5">Your ownership vault</p>
              <p className="text-caption text-text-secondary mt-0.5">Everything entrusted to your care.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => navigate('/amaanat/items?filter=attention')} className="relative w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors" aria-label="Items needing attention">
            <Bell size={16} />
            {!!attentionItems.length && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-pink-fg text-white text-[10px] font-semibold flex items-center justify-center">
                {attentionItems.length}
              </span>
            )}
          </button>
          <button className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary" aria-label="More options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="px-4 mb-5 flex items-center gap-2">
        <button onClick={() => navigate('/amaanat/search')} className="flex-1 bg-card-bg rounded-button shadow-card px-4 py-3 flex items-center gap-2.5 text-text-secondary active:bg-card-border transition-colors">
          <SearchIcon size={16} />
          <span className="text-caption-md">Search items…</span>
        </button>
        <button onClick={() => navigate('/amaanat/item/new')} className="bg-brown text-cream rounded-button px-4 py-3 flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-100 flex-shrink-0">
          <Plus size={16} />
          <span className="text-caption-md font-semibold">Add Item</span>
        </button>
      </div>

      {isLoading ? (
        <div className="px-4 space-y-3 pb-32">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-card" />)}
          </div>
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" description="Add your first item to start your vault." />
      ) : (
        <main className="flex-1 pb-32 space-y-6">
          <StatsGrid stats={stats} />
          <CategoryOverview items={items} />
          <UpcomingReminders reminders={upcomingReminders} />
          <RecentlyAdded items={items} />
        </main>
      )}
    </div>
  );
}
