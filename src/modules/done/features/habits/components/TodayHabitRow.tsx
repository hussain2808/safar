import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { habitIcon } from '@/modules/done/features/habit-form/icons';
import { frequencyLabel } from '@/modules/done/lib/recurrence';
import type { HabitWithStats } from '@/modules/done/features/habits/hooks/useHabits';

interface TodayHabitRowProps {
  habit: HabitWithStats & { isDone: boolean };
  onToggle: () => void;
}

export function TodayHabitRow({ habit, onToggle }: TodayHabitRowProps) {
  const navigate = useNavigate();
  const Icon = habitIcon(habit.icon);

  return (
    <div className={`flex items-center gap-3 bg-card-bg rounded-card shadow-card px-4 py-3.5 transition-opacity ${habit.isDone ? 'opacity-60' : ''}`}>
      <button onClick={() => navigate(`/done/habit/${habit.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div
          className="w-10 h-10 rounded-icon flex items-center justify-center flex-shrink-0 bg-icon-bg"
          style={habit.color ? { backgroundColor: `${habit.color}22` } : undefined}
        >
          <Icon
            size={18}
            className={!habit.color ? 'text-accent-doneGreen-fg' : ''}
            style={habit.color ? { color: habit.color } : undefined}
          />
        </div>
        <div className="min-w-0">
          <p className="text-body text-text-primary truncate">{habit.name}</p>
          <p className="text-caption text-text-secondary">{frequencyLabel(habit.schedule).split(' • ')[0]}</p>
        </div>
      </button>
      <button
        onClick={onToggle}
        aria-label={habit.isDone ? 'Mark as pending' : 'Mark as done'}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
          habit.isDone ? 'bg-accent-doneGreen-fg border-accent-doneGreen-fg text-cream' : 'border-card-border'
        }`}
      >
        {habit.isDone && <Check size={16} />}
      </button>
    </div>
  );
}
