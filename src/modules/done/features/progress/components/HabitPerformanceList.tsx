import { habitIcon } from '@/modules/done/features/habit-form/icons';
import type { HabitWithStats } from '@/modules/done/features/habits/hooks/useHabits';

export function HabitPerformanceList({ habits }: { habits: HabitWithStats[] }) {
  return (
    <div className="space-y-4">
      {habits.map((h) => {
        const Icon = habitIcon(h.icon);
        return (
          <div key={h.id} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-icon flex items-center justify-center flex-shrink-0 bg-icon-bg"
              style={h.color ? { backgroundColor: `${h.color}22` } : undefined}
            >
              <Icon
                size={16}
                className={!h.color ? 'text-accent-doneGreen-fg' : ''}
                style={h.color ? { color: h.color } : undefined}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption-md text-text-primary truncate mb-1.5">{h.name}</p>
              <div className="h-1.5 rounded-full bg-icon-bg overflow-hidden">
                <div className="h-full bg-accent-doneGreen-fg rounded-full" style={{ width: `${h.monthPercent}%` }} />
              </div>
            </div>
            <span className="text-caption-md font-semibold text-accent-doneGreen-fg flex-shrink-0">{h.monthPercent}%</span>
          </div>
        );
      })}
    </div>
  );
}
