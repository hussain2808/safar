import { ChevronRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { habitIcon } from '@/modules/done/features/habit-form/icons';
import { frequencyLabel } from '@/modules/done/lib/recurrence';
import type { HabitWithStats } from '@/modules/done/features/habits/hooks/useHabits';

function formatSince(startDate: number) {
  return new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STREAK_UNIT: Record<string, string> = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };

export function HabitListItem({ habit }: { habit: HabitWithStats }) {
  const navigate = useNavigate();
  const Icon = habitIcon(habit.icon);

  return (
    <button
      onClick={() => navigate(`/done/habit/${habit.id}`)}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-card-border last:border-0 text-left"
    >
      <div
        className="w-11 h-11 rounded-icon flex items-center justify-center flex-shrink-0 bg-icon-bg"
        style={habit.color ? { backgroundColor: `${habit.color}22` } : undefined}
      >
        <Icon
          size={19}
          className={!habit.color ? 'text-accent-doneGreen-fg' : ''}
          style={habit.color ? { color: habit.color } : undefined}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body text-text-primary truncate">{habit.name}</p>
        <p className="text-caption text-text-secondary truncate">{frequencyLabel(habit.schedule)} • Since {formatSince(habit.startDate)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="inline-block text-caption-md font-semibold text-accent-doneGreen-fg bg-accent-doneGreen-bg rounded-full px-2.5 py-1">
          {habit.monthPercent}%
        </span>
        <p className="text-caption text-text-secondary mt-1">This Month</p>
      </div>
      <div className="text-center flex-shrink-0 w-16 hidden sm:block">
        <p className="flex items-center justify-center gap-1 text-caption-md font-semibold text-accent-orange-fg">
          <Flame size={14} /> {habit.streak}
        </p>
        <p className="text-caption text-text-secondary">{STREAK_UNIT[habit.schedule.frequency]} streak</p>
      </div>
      <ChevronRight size={18} className="text-text-muted flex-shrink-0" />
    </button>
  );
}
