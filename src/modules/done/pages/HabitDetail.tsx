import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, RotateCcw, FileText, ChevronRight } from 'lucide-react';
import { useHabit } from '@/modules/done/features/habits/hooks/useHabit';
import { toggleCompletion } from '@/modules/done/db/completions';
import { setArchived, deleteHabit } from '@/modules/done/db/habits';
import { habitIcon } from '@/modules/done/features/habit-form/icons';
import { frequencyLabel, dateKey } from '@/modules/done/lib/recurrence';
import { StatsRow, STAT_ICONS } from '@/modules/done/features/progress/components/StatsRow';
import { ContributionCalendar } from '@/modules/done/features/progress/components/ContributionCalendar';
import { dayStatus } from '@/modules/done/lib/dayStatus';
import { BottomSheet } from '@/modules/done/shared/components/BottomSheet';

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habit, completions, stats, isLoading } = useHabit(id);
  const [month, setMonth] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-cream" />;
  if (!habit) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-body text-text-secondary">Habit not found.</p>
      </div>
    );
  }

  const Icon = habitIcon(habit.icon);
  const today = new Date();

  async function handleToggle() {
    if (!habit) return;
    await toggleCompletion(habit.id, dateKey(new Date()));
  }

  async function handleArchive() {
    if (!habit) return;
    await setArchived(habit.id, !habit.archived);
    setMenuOpen(false);
    navigate('/done/habits');
  }

  async function handleDelete() {
    if (!habit) return;
    if (!confirm(`Delete "${habit.name}"? This can't be undone.`)) return;
    await deleteHabit(habit.id);
    navigate('/done/habits');
  }

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-9 h-9 -ml-1.5 flex items-center justify-center text-text-primary">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-body font-semibold text-accent-doneGreen-fg truncate max-w-[55%]">{habit.name}</h1>
        <button onClick={() => setMenuOpen(true)} aria-label="More options" className="w-9 h-9 flex items-center justify-center text-text-primary">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="px-5 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-icon flex items-center justify-center flex-shrink-0 bg-icon-bg"
            style={habit.color ? { backgroundColor: `${habit.color}22` } : undefined}
          >
            <Icon
              size={28}
              className={!habit.color ? 'text-accent-doneGreen-fg' : ''}
              style={habit.color ? { color: habit.color } : undefined}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-section-heading text-text-primary">{habit.name}</h2>
            <p className="text-caption text-text-secondary mt-0.5">{frequencyLabel(habit.schedule)}</p>
          </div>
        </div>

        <div className="bg-card-bg rounded-card shadow-card px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-caption text-text-secondary mb-1">
              Today, {today.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
            </p>
            <p className={`text-body font-semibold ${stats?.isDoneToday ? 'text-accent-doneGreen-fg' : 'text-text-primary'}`}>
              {stats?.isDoneToday ? 'Done' : 'Pending'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 bg-accent-doneGreen-bg text-accent-doneGreen-fg rounded-button px-3.5 py-2.5 text-caption-md font-semibold flex-shrink-0"
          >
            <RotateCcw size={14} />
            {stats?.isDoneToday ? 'Mark as Pending' : 'Mark Done'}
          </button>
        </div>

        <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
          <StatsRow
            items={[
              { icon: STAT_ICONS.Flame, value: stats?.streak ?? 0, label: 'Current Streak' },
              { icon: STAT_ICONS.Trophy, value: stats?.best ?? 0, label: 'Best Streak' },
              { icon: STAT_ICONS.TrendingUp, value: `${stats?.monthPercent ?? 0}%`, label: 'Completion' },
              { icon: STAT_ICONS.Target, value: stats?.total ?? 0, label: 'Total Done' },
            ]}
          />
        </div>

        <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
          <ContributionCalendar
            month={month}
            onMonthChange={setMonth}
            getStatus={(date) => dayStatus([habit], completions, date)}
          />
        </div>

        <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-body text-text-primary">Monthly Progress</p>
            <button onClick={() => navigate('/done/progress?tab=insights')} className="flex items-center gap-0.5 text-caption-md text-accent-doneGreen-fg">
              View Insights <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-amount-md text-accent-doneGreen-fg">{stats?.monthPercent ?? 0}%</p>
          <div className="h-2 rounded-full bg-icon-bg overflow-hidden mt-2">
            <div className="h-full bg-accent-doneGreen-fg rounded-full" style={{ width: `${stats?.monthPercent ?? 0}%` }} />
          </div>
        </div>

        {habit.notes && (
          <button
            onClick={() => navigate(`/done/habit/${habit.id}/edit`)}
            className="w-full bg-card-bg rounded-card shadow-card px-4 py-4 flex items-start gap-3 text-left"
          >
            <FileText size={18} className="text-text-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-caption-md text-text-primary mb-1">Notes</p>
              <p className="text-caption text-text-secondary">{habit.notes}</p>
            </div>
            <ChevronRight size={16} className="text-text-muted flex-shrink-0 mt-0.5" />
          </button>
        )}
      </div>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={habit.name}>
        <div className="px-5 py-3 space-y-1">
          <button
            onClick={() => { setMenuOpen(false); navigate(`/done/habit/${habit.id}/edit`); }}
            className="w-full text-left py-3 text-body text-text-primary"
          >
            Edit
          </button>
          <button onClick={handleArchive} className="w-full text-left py-3 text-body text-text-primary">
            {habit.archived ? 'Restore' : 'Archive'}
          </button>
          <button onClick={handleDelete} className="w-full text-left py-3 text-body text-red-600">
            Delete
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
