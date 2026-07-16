import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, X, User, Calendar, Tag } from 'lucide-react';
import { useWishes } from '@/modules/wishbook/features/wishes/hooks/useWishes';
import { usePeople } from '@/family/hooks/usePeople';
import { getCategoryById } from '@/modules/wishbook/lib/categories';
import { SELF_PERSON_ID } from '@/family/db';
import { formatCurrency, formatDate, getTimeLeft, PRIORITY_STYLE } from '@/modules/wishbook/lib/format';
import type { Wish } from '@/modules/wishbook/types';
import type { Person } from '@/family/types';

function WishRow({ wish, people, onClick }: { wish: Wish; people: Person[]; onClick: () => void }) {
  const category = getCategoryById(wish.categoryId);
  const CategoryIcon = category.icon;
  const person = people.find((p) => p.id === wish.assignedToId);
  const personName = person?.id === SELF_PERSON_ID ? 'Myself' : (person?.name ?? 'Myself');
  const priority = PRIORITY_STYLE[wish.priority];
  const timeLeft = wish.targetDate ? getTimeLeft(wish.targetDate) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card-bg rounded-2xl shadow-card p-3.5 flex gap-3 active:scale-[0.98] transition-transform duration-100"
    >
      <div className={`w-11 h-11 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
        <CategoryIcon size={20} className={category.fg} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-1">{wish.title}</h3>
          {timeLeft && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${timeLeft.className}`}>
              {timeLeft.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-xs">
          <span className={`font-medium ${category.fg}`}>{category.label}</span>
          <span className="text-text-muted">·</span>
          <span className="flex items-center gap-0.5 text-text-secondary">
            <User size={10} /> {personName}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            {wish.targetDate && (
              <span className="flex items-center gap-0.5">
                <Calendar size={10} /> {formatDate(wish.targetDate)}
              </span>
            )}
            {wish.items?.length ? (
              <span className="flex items-center gap-0.5">
                <Tag size={10} /> {wish.items.filter((i) => i.checked).length}/{wish.items.length} items
              </span>
            ) : wish.estimatedCost ? (
              <span className="flex items-center gap-0.5">
                <Tag size={10} /> {formatCurrency(wish.estimatedCost, wish.currency)} (Est.)
              </span>
            ) : null}
          </div>
          <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
        </div>
      </div>
    </button>
  );
}

export default function WishSearch() {
  const navigate = useNavigate();
  const { wishes } = useWishes();
  const { people } = usePeople();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return wishes.filter((w) => {
      if (w.archived) return false;
      if (w.title.toLowerCase().includes(q)) return true;
      if (w.notes?.toLowerCase().includes(q)) return true;
      if (w.whyIWantThis?.toLowerCase().includes(q)) return true;
      const category = getCategoryById(w.categoryId);
      if (category.label.toLowerCase().includes(q)) return true;
      const person = people.find((p) => p.id === w.assignedToId);
      const personName = person?.id === SELF_PERSON_ID ? 'myself' : (person?.name?.toLowerCase() ?? '');
      if (personName.includes(q)) return true;
      return false;
    });
  }, [query, wishes, people]);

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="px-4 pt-10 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate('/wishbook')}
            aria-label="Back to Wishbook"
            className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors flex-shrink-0"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 bg-card-bg rounded-2xl shadow-card flex items-center gap-2 px-4 py-2.5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              autoFocus
              placeholder="Search wishes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-text-muted flex-shrink-0">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 space-y-3">
        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={32} className="text-text-muted mb-3" strokeWidth={1.5} />
            <p className="text-sm text-text-secondary">Search by title, category, person or notes</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-base font-semibold text-text-primary mb-1">No results</p>
            <p className="text-sm text-text-secondary">Try a different keyword</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary px-1">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
            {results.map((w) => (
              <WishRow
                key={w.id}
                wish={w}
                people={people}
                onClick={() => navigate(`/wishbook/wish/${w.id}`)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
