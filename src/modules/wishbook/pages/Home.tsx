import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MoreHorizontal, Bookmark, CalendarClock, Users, Heart,
  Plus, Cloud, ChevronRight, User, Calendar, Tag,
} from 'lucide-react';
import { useWishes } from '@/modules/wishbook/features/wishes/hooks/useWishes';
import { usePeople } from '@/family/hooks/usePeople';
import { getCategoryById } from '@/modules/wishbook/lib/categories';
import { SELF_PERSON_ID } from '@/family/db';
import { formatCurrency, formatDate, getTimeLeft, PRIORITY_STYLE, STATUS_STYLE } from '@/modules/wishbook/lib/format';
import type { Wish } from '@/modules/wishbook/types';
import type { Person } from '@/family/types';

const PERSON_COLORS = [
  { bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg',  count: 'text-accent-green-fg' },
  { bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg',   count: 'text-accent-orange-fg' },
  { bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg', count: 'text-accent-green-fg' },
  { bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg', count: 'text-accent-purple-fg' },
  { bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg',   count: 'text-accent-blue-fg' },
];

function SectionHeader({ icon: Icon, title, onViewAll }: { icon: typeof Cloud; title: string; onViewAll: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-text-secondary" />
        <h2 className="text-home-section-heading font-semibold text-text-primary">{title}</h2>
      </div>
      <button onClick={onViewAll} className="flex items-center gap-0.5 text-accent-green-fg text-sm font-medium">
        View All <ChevronRight size={14} />
      </button>
    </div>
  );
}

function StatItem({
  icon: Icon, count, label, iconBg, iconFg,
}: { icon: typeof Bookmark; count: number; label: string; iconBg: string; iconFg: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={16} className={iconFg} strokeWidth={1.5} />
      </div>
      <span className="text-[17px] font-bold text-text-primary leading-tight">{count}</span>
      <span className="text-[10px] text-text-secondary leading-tight">{label}</span>
    </div>
  );
}

function WishCard({ wish, people, onClick }: { wish: Wish; people: Person[]; onClick: () => void }) {
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
      <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
        <CategoryIcon size={22} className={category.fg} strokeWidth={1.5} />
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
            <User size={10} /> For {personName}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            {wish.targetDate && (
              <span className="flex items-center gap-0.5">
                <Calendar size={10} /> {formatDate(wish.targetDate)}
              </span>
            )}
            {wish.estimatedCost && (
              <span className="flex items-center gap-0.5">
                <Tag size={10} /> {formatCurrency(wish.estimatedCost, wish.currency)} (Est.)
              </span>
            )}
          </div>
          <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
        </div>
      </div>
    </button>
  );
}

function DreamingRow({ wish, onClick }: { wish: Wish; onClick: () => void }) {
  const category = getCategoryById(wish.categoryId);
  const CategoryIcon = category.icon;
  const status = STATUS_STYLE[wish.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 active:bg-card-border transition-colors"
    >
      <div className={`w-9 h-9 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
        <CategoryIcon size={16} className={category.fg} strokeWidth={1.5} />
      </div>
      <span className="flex-1 text-sm font-medium text-text-primary">{wish.title}</span>
      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.fg}`}>
        {status.label}
      </span>
      <Bookmark size={15} className="text-text-muted flex-shrink-0" />
    </button>
  );
}

function PersonCard({ person, count, colorIdx, onClick }: {
  person: Person; count: number; colorIdx: number; onClick: () => void;
}) {
  const color = PERSON_COLORS[colorIdx % PERSON_COLORS.length];
  const initial = person.name.charAt(0).toUpperCase();

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20 active:scale-[0.97] transition-transform">
      <div className={`w-14 h-14 rounded-full ${color.bg} flex items-center justify-center`}>
        <span className={`text-xl font-bold ${color.fg}`}>{initial}</span>
      </div>
      <span className="text-xs font-medium text-text-primary text-center leading-tight">{person.name}</span>
      <span className={`text-xs font-semibold ${color.count}`}>{count} {count === 1 ? 'wish' : 'wishes'} ›</span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { wishes, isLoading } = useWishes();
  const { people } = usePeople();

  const activeWishes = useMemo(
    () => wishes.filter((w) => !w.archived && w.status !== 'cancelled'),
    [wishes],
  );

  const now = Date.now();
  const sixMonthsOut = now + 6 * 30 * 24 * 60 * 60 * 1000;

  const dueSoonWishes = useMemo(
    () =>
      activeWishes
        .filter((w) => w.targetDate && w.targetDate >= now && w.targetDate <= sixMonthsOut)
        .sort((a, b) => (a.targetDate ?? 0) - (b.targetDate ?? 0))
        .slice(0, 3),
    [activeWishes, now, sixMonthsOut],
  );

  const dreamingWishes = useMemo(
    () => activeWishes.filter((w) => w.status === 'dreaming').slice(0, 4),
    [activeWishes],
  );

  const familyStats = useMemo(() => {
    const countMap = new Map<string, number>();
    activeWishes.forEach((w) => countMap.set(w.assignedToId, (countMap.get(w.assignedToId) ?? 0) + 1));
    return people
      .filter((p) => countMap.has(p.id))
      .map((p) => ({ person: p, count: countMap.get(p.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [activeWishes, people]);

  const familyWishCount = useMemo(
    () => activeWishes.filter((w) => {
      const p = people.find((p) => p.id === w.assignedToId);
      return p && p.relationship !== 'self';
    }).length,
    [activeWishes, people],
  );

  const purchasedCount = useMemo(() => wishes.filter((w) => w.status === 'purchased').length, [wishes]);

  const isEmpty = !isLoading && wishes.length === 0;

  return (
    <div className="min-h-screen bg-cream pb-36">
      {/* Header */}
      <header className="px-5 pt-12 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[44px] leading-none text-[#1B4332]">
              Wishbook<span className="text-gold text-3xl align-top mt-1 inline-block">✦</span>
            </h1>
            <p className="text-text-secondary text-sm mt-2 leading-snug">
              Things I hope to bring<br />into my life.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors">
              <Search size={16} />
            </button>
            <button className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Stats */}
        <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
          <div className="grid grid-cols-4 gap-2">
            <StatItem icon={Bookmark} count={activeWishes.length} label="Total Wishes" iconBg="bg-accent-green-bg" iconFg="text-accent-green-fg" />
            <StatItem icon={CalendarClock} count={dueSoonWishes.length} label="Due Soon" iconBg="bg-accent-orange-bg" iconFg="text-accent-orange-fg" />
            <StatItem icon={Users} count={familyWishCount} label="For Family" iconBg="bg-accent-purple-bg" iconFg="text-accent-purple-fg" />
            <StatItem icon={Heart} count={purchasedCount} label="Purchased" iconBg="bg-accent-pink-bg" iconFg="text-accent-pink-fg" />
          </div>
        </div>

        {/* Due Soon */}
        {!isLoading && dueSoonWishes.length > 0 && (
          <section>
            <SectionHeader icon={CalendarClock} title="Due Soon" onViewAll={() => {}} />
            <div className="space-y-3">
              {dueSoonWishes.map((w) => (
                <WishCard key={w.id} wish={w} people={people} onClick={() => navigate(`/wishbook/wish/${w.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* For Family */}
        {!isLoading && familyStats.length > 0 && (
          <section>
            <SectionHeader icon={Users} title="For Family" onViewAll={() => {}} />
            <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4">
              {familyStats.map(({ person, count }, i) => (
                <PersonCard key={person.id} person={person} count={count} colorIdx={i} onClick={() => {}} />
              ))}
            </div>
          </section>
        )}

        {/* Dreaming */}
        {!isLoading && dreamingWishes.length > 0 && (
          <section>
            <SectionHeader icon={Cloud} title="Dreaming" onViewAll={() => {}} />
            <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border overflow-hidden">
              {dreamingWishes.map((w) => (
                <DreamingRow key={w.id} wish={w} onClick={() => navigate(`/wishbook/wish/${w.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-green-bg flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-accent-green-fg" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-semibold text-text-primary mb-1">No wishes yet</p>
            <p className="text-sm text-text-secondary">Start adding things you hope to bring into your life.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/wishbook/add')}
        className="fixed bottom-[72px] inset-x-4 h-14 bg-[#1B4332] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold text-base shadow-button active:scale-[0.98] transition-transform duration-100"
      >
        <Plus size={20} />
        <span>Add New Wish</span>
        <span className="text-gold ml-0.5">✦</span>
      </button>
    </div>
  );
}
