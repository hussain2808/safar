import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, User, Calendar, Tag, Archive } from 'lucide-react';
import { useWishes } from '@/modules/wishbook/features/wishes/hooks/useWishes';
import { usePeople } from '@/family/hooks/usePeople';
import { getCategoryById } from '@/modules/wishbook/lib/categories';
import { SELF_PERSON_ID } from '@/family/db';
import { formatCurrency, formatDate, getTimeLeft, PRIORITY_STYLE, STATUS_STYLE } from '@/modules/wishbook/lib/format';
import type { Wish, WishStatus } from '@/modules/wishbook/types';
import type { Person } from '@/family/types';

const STATUS_FILTERS: { value: WishStatus | 'archived' | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'dreaming',  label: 'Dreaming' },
  { value: 'planning',  label: 'Planning' },
  { value: 'saving',    label: 'Saving' },
  { value: 'ready',     label: 'Ready' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived',  label: 'Archived' },
];

function WishRow({ wish, people, onClick }: { wish: Wish; people: Person[]; onClick: () => void }) {
  const category = getCategoryById(wish.categoryId);
  const CategoryIcon = category.icon;
  const person = people.find((p) => p.id === wish.assignedToId);
  const personName = person?.id === SELF_PERSON_ID ? 'Myself' : (person?.name ?? 'Myself');
  const priority = PRIORITY_STYLE[wish.priority];
  const status = STATUS_STYLE[wish.status];
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
          {wish.archived ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 bg-gray-100 text-gray-500 flex items-center gap-0.5">
              <Archive size={9} /> Archived
            </span>
          ) : timeLeft ? (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${timeLeft.className}`}>
              {timeLeft.label}
            </span>
          ) : null}
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
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.fg}`}>{status.label}</span>
            <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function WishList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishes, isLoading } = useWishes();
  const { people } = usePeople();

  const statusFilter = (searchParams.get('status') ?? 'all') as WishStatus | 'archived' | 'all';
  const personId = searchParams.get('personId');
  const dueSoon = searchParams.get('dueSoon') === 'true';

  const now = Date.now();
  const sixMonthsOut = now + 6 * 30 * 24 * 60 * 60 * 1000;

  const filtered = useMemo(() => {
    let list = wishes;

    if (statusFilter === 'archived') {
      list = list.filter((w) => w.archived);
    } else if (statusFilter === 'all') {
      list = list.filter((w) => !w.archived);
    } else {
      list = list.filter((w) => !w.archived && w.status === statusFilter);
    }

    if (personId) {
      list = list.filter((w) => w.assignedToId === personId);
    }

    if (dueSoon) {
      list = list.filter((w) => w.targetDate && w.targetDate >= now && w.targetDate <= sixMonthsOut);
      list = [...list].sort((a, b) => (a.targetDate ?? 0) - (b.targetDate ?? 0));
    }

    return list;
  }, [wishes, statusFilter, personId, dueSoon, now, sixMonthsOut]);

  const pageTitle = useMemo(() => {
    if (dueSoon) return 'Due Soon';
    if (personId) {
      const p = people.find((p) => p.id === personId);
      return p ? (p.id === SELF_PERSON_ID ? 'For Myself' : `For ${p.name}`) : 'Wishes';
    }
    const found = STATUS_FILTERS.find((f) => f.value === statusFilter);
    return found && statusFilter !== 'all' ? found.label : 'All Wishes';
  }, [statusFilter, personId, dueSoon, people]);

  const setStatus = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('status', value);
    next.delete('dueSoon');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="px-4 pt-10 pb-4">
        <button
          onClick={() => navigate('/wishbook')}
          className="flex items-center gap-0.5 text-[#C8922E] font-medium text-sm mb-3"
        >
          <ChevronLeft size={18} />
          <span>Wishbook</span>
        </button>
        <h1 className="text-2xl font-bold text-text-primary">{pageTitle}</h1>
        <p className="text-xs text-text-secondary mt-0.5">{filtered.length} {filtered.length === 1 ? 'wish' : 'wishes'}</p>
      </header>

      {/* Filter chips — hidden when in a specific person or dueSoon context */}
      {!personId && !dueSoon && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#C8922E] text-white'
                    : 'bg-card-bg shadow-card text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-text-primary mb-1">No wishes here</p>
            <p className="text-sm text-text-secondary">
              {statusFilter === 'archived' ? 'Nothing archived yet.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          filtered.map((w) => (
            <WishRow
              key={w.id}
              wish={w}
              people={people}
              onClick={() => navigate(`/wishbook/wish/${w.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
