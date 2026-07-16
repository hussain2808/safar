import { ChevronRight } from 'lucide-react';
import { HabitListItem } from './HabitListItem';
import type { HabitWithStats } from '@/modules/done/features/habits/hooks/useHabits';
import type { Frequency } from '@/modules/done/types';

const LABELS: Record<Frequency, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

interface FrequencyGroupSectionProps {
  frequency: Frequency;
  habits: HabitWithStats[];
  limit?: number;
  onSeeAll?: () => void;
}

export function FrequencyGroupSection({ frequency, habits, limit = 4, onSeeAll }: FrequencyGroupSectionProps) {
  if (habits.length === 0) return null;
  const shown = onSeeAll ? habits.slice(0, limit) : habits;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-doneGreen-fg" />
          <h3 className="text-home-section-heading text-text-primary">{LABELS[frequency]}</h3>
          <span className="w-5 h-5 rounded-full bg-badge-bg text-caption text-text-secondary flex items-center justify-center">
            {habits.length}
          </span>
        </div>
        {onSeeAll && habits.length > limit && (
          <button onClick={onSeeAll} className="flex items-center gap-0.5 text-caption-md text-accent-doneGreen-fg">
            See all <ChevronRight size={14} />
          </button>
        )}
      </div>
      <div className="bg-card-bg rounded-card shadow-card overflow-hidden">
        {shown.map((h) => <HabitListItem key={h.id} habit={h} />)}
      </div>
    </section>
  );
}
