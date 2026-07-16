import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey } from '@/modules/done/lib/recurrence';
import type { DayStatus } from '@/modules/done/lib/dayStatus';

interface ContributionCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  getStatus: (date: Date) => DayStatus;
  onSelectDay?: (date: Date) => void;
  selectedDate?: Date;
}

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function buildWeeks(month: Date): (Date | null)[][] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const firstWeekday = (first.getDay() + 6) % 7; // Monday-first offset

  const cells: (Date | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const STATUS_CLASSES: Record<DayStatus, string> = {
  done: 'bg-accent-doneGreen-fg',
  partial: 'bg-accent-doneGreen-bg',
  missed: 'bg-icon-bg',
  future: 'bg-transparent',
  none: 'bg-transparent',
};

export function ContributionCalendar({ month, onMonthChange, getStatus, onSelectDay, selectedDate }: ContributionCalendarProps) {
  const weeks = buildWeeks(month);
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayKey = dateKey(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-book-title text-text-primary">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="w-8 h-8 rounded-full bg-icon-bg flex items-center justify-center text-text-secondary"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="w-8 h-8 rounded-full bg-icon-bg flex items-center justify-center text-text-secondary"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-medium text-text-muted">{label}</div>
        ))}
      </div>

      <div className="space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day, di) => {
              if (!day) return <div key={di} />;
              const key = dateKey(day);
              const status = getStatus(day);
              const isSelected = selectedDate ? dateKey(selectedDate) === key : false;
              const isToday = key === todayKey;
              return (
                <button
                  key={di}
                  onClick={() => onSelectDay?.(day)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[11px] ${STATUS_CLASSES[status]} ${
                    status === 'done' ? 'text-cream' : 'text-text-secondary'
                  } ${isSelected || isToday ? 'ring-2 ring-accent-doneGreen-fg' : ''}`}
                >
                  {isSelected || isToday ? day.getDate() : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <LegendDot color="bg-accent-doneGreen-fg" label="Done" />
        <LegendDot color="bg-accent-doneGreen-bg" label="Partial" />
        <LegendDot color="bg-icon-bg" label="Missed" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded ${color}`} />
      <span className="text-caption text-text-secondary">{label}</span>
    </div>
  );
}
