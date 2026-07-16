import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, MoreHorizontal, CalendarDays, Sparkles } from 'lucide-react';
import { useTodayHabits } from '@/modules/done/features/habits/hooks/useTodayHabits';
import { TodayHabitRow } from '@/modules/done/features/habits/components/TodayHabitRow';
import { CircularProgress } from '@/modules/done/features/progress/components/CircularProgress';
import { EmptyState } from '@/modules/done/shared/components/EmptyState';
import { BottomBar } from '@/modules/done/shared/components/BottomBar';
import { toggleCompletion } from '@/modules/done/db/completions';
import { dateKey } from '@/modules/done/lib/recurrence';
import { pickMotivation } from '@/modules/done/lib/motivation';

export default function Home() {
  const navigate = useNavigate();
  const { todayHabits, isLoading } = useTodayHabits();
  const motivation = useMemo(() => pickMotivation(), []);

  const total = todayHabits.length;
  const done = todayHabits.filter((h) => h.isDone).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const today = new Date();
  const todayLabel = `${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'long' })}, ${today.toLocaleDateString('en-US', { weekday: 'long' })}`;

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to Safar"
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-text-primary"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/done/progress')}
              aria-label="Progress"
              className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => navigate('/done/archive')}
              aria-label="More"
              className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        <div>
          <h1 className="font-serif text-page-title text-accent-doneGreen-fg flex items-center gap-2">
            Done <span aria-hidden="true">🌱</span>
          </h1>
          <p className="text-caption text-text-secondary mt-1">Small actions. Big progress.</p>
        </div>
      </header>

      <div className="px-5">
        <div className="bg-accent-doneGreen-bg rounded-card px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-caption-md text-text-secondary mb-1">Today&apos;s Progress</p>
            <p className="text-display-title text-accent-doneGreen-fg leading-none">{done} / {total}</p>
            <p className="text-caption text-text-secondary mt-2">{percent}% Completed</p>
            <div className="h-1.5 w-40 rounded-full bg-card-bg overflow-hidden mt-2">
              <div className="h-full bg-accent-doneGreen-fg rounded-full" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <CircularProgress percent={percent} size={72} strokeWidth={7}>
            <span className="text-xl" aria-hidden="true">🌱</span>
          </CircularProgress>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-section-heading text-text-primary">Today</h2>
          <div className="flex items-center gap-1.5 text-caption text-text-secondary">
            <CalendarDays size={14} />
            {todayLabel}
          </div>
        </div>

        {!isLoading && todayHabits.length === 0 && (
          <EmptyState title="Everything for today is done." description="Take a moment to appreciate your consistency." />
        )}

        {todayHabits.length > 0 && (
          <div className="space-y-2.5">
            {todayHabits.map((h) => (
              <TodayHabitRow key={h.id} habit={h} onToggle={() => toggleCompletion(h.id, dateKey(new Date()))} />
            ))}
          </div>
        )}
      </div>

      {todayHabits.length > 0 && (
        <div className="px-5 mt-5">
          <button
            onClick={() => navigate('/done/progress')}
            className="w-full flex items-center gap-3 bg-accent-orange-bg rounded-card px-4 py-3.5 text-left"
          >
            <Sparkles size={16} className="text-accent-orange-fg flex-shrink-0" />
            <div>
              <p className="text-caption-md font-semibold text-text-primary">Keep it up!</p>
              <p className="text-caption text-text-secondary">{motivation}</p>
            </div>
          </button>
        </div>
      )}

      <BottomBar />
    </div>
  );
}
