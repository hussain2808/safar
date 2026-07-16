import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useHabits } from '@/modules/done/features/habits/hooks/useHabits';
import { setArchived } from '@/modules/done/db/habits';
import { habitIcon } from '@/modules/done/features/habit-form/icons';
import { frequencyLabel } from '@/modules/done/lib/recurrence';
import { EmptyState } from '@/modules/done/shared/components/EmptyState';

export default function Archive() {
  const navigate = useNavigate();
  const { habits, isLoading } = useHabits({ includeArchived: true });
  const archived = habits.filter((h) => h.archived);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-9 h-9 -ml-1.5 flex items-center justify-center text-text-primary">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary">Archive</h1>
      </header>

      <div className="px-5">
        {!isLoading && archived.length === 0 && (
          <EmptyState title="No archived habits" description="Habits you archive will show up here." />
        )}
        {archived.length > 0 && (
          <div className="bg-card-bg rounded-card shadow-card overflow-hidden">
            {archived.map((h) => {
              const Icon = habitIcon(h.icon);
              return (
                <div key={h.id} className="flex items-center gap-3 px-4 py-4 border-b border-card-border last:border-0">
                  <div className="w-10 h-10 rounded-icon flex items-center justify-center flex-shrink-0 bg-icon-bg">
                    <Icon size={18} className="text-text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body text-text-primary truncate">{h.name}</p>
                    <p className="text-caption text-text-secondary">{frequencyLabel(h.schedule)}</p>
                  </div>
                  <button
                    onClick={() => setArchived(h.id, false)}
                    className="text-caption-md font-semibold text-accent-doneGreen-fg flex-shrink-0"
                  >
                    Restore
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
