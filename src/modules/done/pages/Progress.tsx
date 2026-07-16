import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CalendarDays, MoreHorizontal } from 'lucide-react';
import { useHabits } from '@/modules/done/features/habits/hooks/useHabits';
import { CircularProgress } from '@/modules/done/features/progress/components/CircularProgress';
import { ContributionCalendar } from '@/modules/done/features/progress/components/ContributionCalendar';
import { STAT_ICONS } from '@/modules/done/features/progress/components/StatsRow';
import { HabitPerformanceList } from '@/modules/done/features/progress/components/HabitPerformanceList';
import { dayStatus } from '@/modules/done/lib/dayStatus';
import { aggregateCurrentStreak, aggregateBestStreak } from '@/modules/done/lib/streak';
import { aggregateCompletionPercent, monthRange } from '@/modules/done/lib/stats';
import { cn } from '@/modules/done/lib/utils';

const TABS = ['overview', 'calendar', 'insights'] as const;
type Tab = typeof TABS[number];

export default function Progress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab: Tab = (TABS as readonly string[]).includes(requestedTab ?? '') ? (requestedTab as Tab) : 'overview';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [month, setMonth] = useState(new Date());
  const { habits, completions } = useHabits();

  const { from, to } = monthRange(month);
  const monthPercent = useMemo(
    () => aggregateCompletionPercent(habits, completions, from, to),
    [habits, completions, from, to],
  );
  const currentStreak = useMemo(() => aggregateCurrentStreak(habits, completions), [habits, completions]);
  const bestStreak = useMemo(() => aggregateBestStreak(habits, completions), [habits, completions]);
  const totalCompleted = completions.length;

  const best = habits.length ? habits.reduce((a, b) => (b.monthPercent > a.monthPercent ? b : a)) : null;
  const worst = habits.length ? habits.reduce((a, b) => (b.monthPercent < a.monthPercent ? b : a)) : null;

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Back" className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors flex-shrink-0">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-serif text-page-title text-accent-doneGreen-fg">Progress</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setTab('calendar')}
            aria-label="Calendar view"
            className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary"
          >
            <CalendarDays size={16} />
          </button>
          <button aria-label="More" className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-6 px-5 border-b border-card-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'pb-3 text-body capitalize border-b-2 -mb-px',
              tab === t ? 'text-accent-doneGreen-fg border-accent-doneGreen-fg font-medium' : 'text-text-secondary border-transparent',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="px-5 py-5 space-y-5">
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <ContributionCalendar month={month} onMonthChange={setMonth} getStatus={(date) => dayStatus(habits, completions, date)} />
          </div>

          <div className="bg-card-bg rounded-card shadow-card px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body font-semibold text-text-primary">Overall Progress</h3>
              <span className="text-caption text-text-secondary">This Month</span>
            </div>
            <div className="flex items-center gap-5">
              <CircularProgress percent={monthPercent} size={96} strokeWidth={9}>
                <div className="text-center">
                  <p className="text-amount-lg text-accent-doneGreen-fg leading-none">{monthPercent}%</p>
                  <p className="text-caption text-text-secondary mt-1">Completed</p>
                </div>
              </CircularProgress>
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <STAT_ICONS.Flame size={16} className="text-accent-orange-fg mx-auto mb-1" />
                  <p className="text-amount-sm text-text-primary">{currentStreak}</p>
                  <p className="text-caption text-text-secondary">Current Streak</p>
                </div>
                <div>
                  <STAT_ICONS.Trophy size={16} className="text-accent-doneGreen-fg mx-auto mb-1" />
                  <p className="text-amount-sm text-text-primary">{bestStreak}</p>
                  <p className="text-caption text-text-secondary">Best Streak</p>
                </div>
                <div>
                  <STAT_ICONS.TrendingUp size={16} className="text-accent-doneGreen-fg mx-auto mb-1" />
                  <p className="text-amount-sm text-text-primary">{totalCompleted}</p>
                  <p className="text-caption text-text-secondary">Total Completed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-bg rounded-card shadow-card px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body font-semibold text-text-primary">Habit Performance</h3>
              <span className="text-caption text-text-secondary">This Month</span>
            </div>
            <HabitPerformanceList habits={habits} />
          </div>
        </div>
      )}

      {tab === 'calendar' && (
        <div className="px-5 py-5">
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <ContributionCalendar month={month} onMonthChange={setMonth} getStatus={(date) => dayStatus(habits, completions, date)} />
          </div>
        </div>
      )}

      {tab === 'insights' && (
        <div className="px-5 py-5 space-y-5">
          {best && worst && best.id !== worst.id && (
            <div className="bg-card-bg rounded-card shadow-card px-4 py-5 space-y-4">
              <h3 className="text-body font-semibold text-text-primary">Highlights</h3>
              <div className="flex items-center justify-between gap-3">
                <p className="text-caption text-text-secondary">Best performing</p>
                <p className="text-caption-md font-semibold text-accent-doneGreen-fg truncate">{best.name} · {best.monthPercent}%</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-caption text-text-secondary">Needs attention</p>
                <p className="text-caption-md font-semibold text-text-primary truncate">{worst.name} · {worst.monthPercent}%</p>
              </div>
            </div>
          )}

          <div className="bg-card-bg rounded-card shadow-card px-4 py-5">
            <h3 className="text-body font-semibold text-text-primary mb-4">By Frequency</h3>
            <div className="space-y-3">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => {
                const group = habits.filter((h) => h.schedule.frequency === freq);
                if (group.length === 0) return null;
                const avg = Math.round(group.reduce((sum, h) => sum + h.monthPercent, 0) / group.length);
                return (
                  <div key={freq} className="flex items-center justify-between">
                    <p className="text-caption-md text-text-primary capitalize">{freq}</p>
                    <p className="text-caption-md font-semibold text-accent-doneGreen-fg">{avg}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
