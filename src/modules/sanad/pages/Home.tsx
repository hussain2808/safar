import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon, FileCheck2, Bell, MoreHorizontal, Plus } from 'lucide-react';
import { Skeleton } from '@/modules/sanad/shared/components/Skeleton';
import { EmptyState } from '@/modules/sanad/shared/components/EmptyState';
import { useDocuments } from '@/modules/sanad/features/documents/hooks/useDocuments';
import { StatsGrid } from '@/modules/sanad/features/dashboard/components/StatsGrid';
import { CategoryOverview } from '@/modules/sanad/features/dashboard/components/CategoryOverview';
import { UpcomingReminders } from '@/modules/sanad/features/dashboard/components/UpcomingReminders';
import { RecentlyUpdated } from '@/modules/sanad/features/dashboard/components/RecentlyUpdated';

export default function Home() {
  const navigate = useNavigate();
  const { documents, attentionDocuments, stats, upcomingReminders, isLoading } = useDocuments();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="w-9 h-9 -ml-1.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Safar">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-light text-indigo flex items-center justify-center flex-shrink-0">
              <FileCheck2 size={17} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif text-page-title text-text-primary leading-tight">Sanad</h1>
              <p className="text-caption text-text-secondary">The records that support your life.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/sanad/documents?filter=attention')} className="relative w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors" aria-label="Documents needing attention">
            <Bell size={16} />
            {!!attentionDocuments.length && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-pink-fg text-white text-[10px] font-semibold flex items-center justify-center">
                {attentionDocuments.length}
              </span>
            )}
          </button>
          <button className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary" aria-label="More options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="px-4 mb-5 flex items-center gap-2">
        <button onClick={() => navigate('/sanad/search')} className="flex-1 bg-card-bg rounded-button shadow-card px-4 py-3 flex items-center gap-2.5 text-text-secondary active:bg-card-border transition-colors">
          <SearchIcon size={16} />
          <span className="text-caption-md">Search documents…</span>
        </button>
        <button onClick={() => navigate('/sanad/document/new')} className="bg-indigo text-cream rounded-button px-4 py-3 flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-100 flex-shrink-0">
          <Plus size={16} />
          <span className="text-caption-md font-semibold">Add Document</span>
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
      ) : documents.length === 0 ? (
        <EmptyState title="No documents yet" description="Add your first document to start your vault." />
      ) : (
        <main className="flex-1 pb-32 space-y-6">
          <StatsGrid stats={stats} />
          <CategoryOverview documents={documents} />
          <UpcomingReminders reminders={upcomingReminders} />
          <RecentlyUpdated documents={documents} />
        </main>
      )}
    </div>
  );
}
