import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MoreHorizontal, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useHabits } from '@/modules/done/features/habits/hooks/useHabits';
import { FrequencyGroupSection } from '@/modules/done/features/habits/components/FrequencyGroupSection';
import { HabitListItem } from '@/modules/done/features/habits/components/HabitListItem';
import { EmptyState } from '@/modules/done/shared/components/EmptyState';
import { BottomBar } from '@/modules/done/shared/components/BottomBar';
import { cn } from '@/modules/done/lib/utils';
import type { Frequency } from '@/modules/done/types';

const FILTERS: { key: Frequency | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function AllHabits() {
  const navigate = useNavigate();
  const { habits, completions, isLoading } = useHabits();
  const [filter, setFilter] = useState<Frequency | 'all'>('all');

  const grouped = useMemo(() => {
    const groups: Record<Frequency, typeof habits> = { daily: [], weekly: [], monthly: [], yearly: [] };
    habits.forEach((h) => groups[h.schedule.frequency].push(h));
    return groups;
  }, [habits]);

  const totalCompleted = completions.length;

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div>
          <h1 className="font-serif text-page-title text-accent-doneGreen-fg">All Habits</h1>
          <p className="text-caption text-text-secondary mt-1">All your habits in one place.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/done/search')}
            aria-label="Search habits"
            className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary"
          >
            <SearchIcon size={16} />
          </button>
          <button
            onClick={() => navigate('/done/archive')}
            aria-label="More"
            className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="px-5 flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-full text-caption-md font-medium whitespace-nowrap flex-shrink-0',
              filter === f.key ? 'bg-badge-bg text-text-primary' : 'text-text-secondary',
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          aria-label="Sort options"
          className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary flex-shrink-0 ml-auto"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      <div className="px-5 mt-5">
        {!isLoading && habits.length === 0 && (
          <EmptyState title="No habits yet" description="Create your first habit to get started." />
        )}

        {filter === 'all' ? (
          <>
            <FrequencyGroupSection frequency="daily" habits={grouped.daily} onSeeAll={() => setFilter('daily')} />
            <FrequencyGroupSection frequency="weekly" habits={grouped.weekly} onSeeAll={() => setFilter('weekly')} />
            <FrequencyGroupSection frequency="monthly" habits={grouped.monthly} onSeeAll={() => setFilter('monthly')} />
            <FrequencyGroupSection frequency="yearly" habits={grouped.yearly} onSeeAll={() => setFilter('yearly')} />
          </>
        ) : (
          grouped[filter].length > 0 && (
            <div className="bg-card-bg rounded-card shadow-card overflow-hidden mb-6">
              {grouped[filter].map((h) => <HabitListItem key={h.id} habit={h} />)}
            </div>
          )
        )}

        {habits.length > 0 && (
          <button
            onClick={() => navigate('/done/progress')}
            className="w-full flex items-center gap-3 bg-icon-bg rounded-card px-4 py-3.5 text-left mb-6"
          >
            <Sparkles size={16} className="text-accent-doneGreen-fg flex-shrink-0" />
            <div>
              <p className="text-caption-md font-semibold text-text-primary">Consistency grows over time.</p>
              <p className="text-caption text-text-secondary">You&apos;ve completed {totalCompleted} habits so far.</p>
            </div>
          </button>
        )}
      </div>

      <BottomBar />
    </div>
  );
}
