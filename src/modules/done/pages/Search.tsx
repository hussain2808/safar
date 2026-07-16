import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon } from 'lucide-react';
import { useHabits } from '@/modules/done/features/habits/hooks/useHabits';
import { HabitListItem } from '@/modules/done/features/habits/components/HabitListItem';
import { EmptyState } from '@/modules/done/shared/components/EmptyState';

export default function Search() {
  const navigate = useNavigate();
  const { habits } = useHabits();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return habits.filter((h) => h.name.toLowerCase().includes(q));
  }, [habits, query]);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-9 h-9 -ml-1.5 flex items-center justify-center text-text-primary flex-shrink-0">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-card-bg border border-card-border rounded-button px-4 py-2.5">
          <SearchIcon size={16} className="text-text-secondary flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits..."
            className="flex-1 bg-transparent text-body text-text-primary outline-none min-w-0"
          />
        </div>
      </header>

      <div className="px-5">
        {query.trim() && results.length === 0 && (
          <EmptyState title="No habits found" description={`Nothing matches "${query}"`} />
        )}
        {results.length > 0 && (
          <div className="bg-card-bg rounded-card shadow-card overflow-hidden">
            {results.map((h) => <HabitListItem key={h.id} habit={h} />)}
          </div>
        )}
      </div>
    </div>
  );
}
