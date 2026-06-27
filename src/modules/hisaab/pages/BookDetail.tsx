import { useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CalendarDays, ChevronLeft, MoreVertical, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { BookIcon, getBookColorForId } from '@/modules/hisaab/lib/bookIcons';
import { useBook } from '@/modules/hisaab/features/books/hooks/useBook';
import { useTransactions } from '@/modules/hisaab/features/transactions/hooks/useTransactions';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { TransactionRow } from '@/modules/hisaab/features/transactions/components/TransactionRow';
import { BookOptionsSheet } from '@/modules/hisaab/features/books/components/BookOptionsSheet';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { AmountDisplay } from '@/modules/hisaab/shared/components/AmountDisplay';
import { TransactionRowSkeleton } from '@/modules/hisaab/shared/components/Skeleton';
import { EmptyState } from '@/modules/hisaab/shared/components/EmptyState';
import { format } from 'date-fns';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';

type DateFilter = 'all' | 'today' | 'yesterday' | 'month' | 'lastmonth' | 'year' | 'lastyear' | 'day' | 'range';
type EntryTypeFilter = 'all' | 'in' | 'out';

const DATE_FILTER_OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'all',       label: 'All time' },
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'month',     label: 'This month' },
  { id: 'lastmonth', label: 'Last month' },
  { id: 'year',      label: 'This year' },
  { id: 'lastyear',  label: 'Last year' },
  { id: 'day',       label: 'Single day' },
  { id: 'range',     label: 'Date range' },
];

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { book, isLoading: bookLoading } = useBook(id);
  const { transactions, balance, isLoading: txLoading } = useTransactions(id ?? '');
  const { categories } = useCategories(id);
  const { openAddTransaction, openTransactionDetail } = useUIStore();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [renameDirect, setRenameDirect] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<EntryTypeFilter>('all');

  // pending state inside the sheet (applied on "Apply")
  const [filter, setFilter] = useState<DateFilter>('all');
  const [singleDay, setSingleDay] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [rangeFrom, setRangeFrom] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [rangeTo, setRangeTo] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // draft state while sheet is open
  const [draftFilter, setDraftFilter] = useState<DateFilter>('all');
  const [draftSingleDay, setDraftSingleDay] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [draftRangeFrom, setDraftRangeFrom] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [draftRangeTo, setDraftRangeTo] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [draftCategory, setDraftCategory] = useState<string | null>(null);

  const openOptions = useCallback(() => { setRenameDirect(false); setOptionsOpen(true); }, []);
  const openRename = useCallback(() => { setRenameDirect(true); setOptionsOpen(true); }, []);

  const openFilter = useCallback(() => {
    setDraftFilter(filter);
    setDraftSingleDay(singleDay);
    setDraftRangeFrom(rangeFrom);
    setDraftRangeTo(rangeTo);
    setDraftCategory(categoryFilter);
    setFilterOpen(true);
  }, [filter, singleDay, rangeFrom, rangeTo, categoryFilter]);

  const applyFilter = useCallback(() => {
    setFilter(draftFilter);
    setSingleDay(draftSingleDay);
    setRangeFrom(draftRangeFrom);
    setRangeTo(draftRangeTo);
    setCategoryFilter(draftCategory);
    setFilterOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [draftFilter, draftSingleDay, draftRangeFrom, draftRangeTo, draftCategory]);

  const clearFilter = useCallback(() => {
    setFilter('all');
    setSingleDay(format(Date.now(), 'yyyy-MM-dd'));
    setRangeFrom(format(Date.now(), 'yyyy-MM-dd'));
    setRangeTo(format(Date.now(), 'yyyy-MM-dd'));
    setCategoryFilter(null);
    setFilterOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const isFiltered = filter !== 'all' || categoryFilter !== null;

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayStart = startOfDay(now);
    let result = transactions;
    if (typeFilter !== 'all') result = result.filter((tx) => tx.type === typeFilter);
    if (filter === 'today')          result = result.filter((tx) => tx.date >= todayStart);
    else if (filter === 'yesterday') { const y = todayStart - 86400000; result = result.filter((tx) => tx.date >= y && tx.date < todayStart); }
    else if (filter === 'month')     result = result.filter((tx) => tx.date >= new Date(now.getFullYear(), now.getMonth(), 1).getTime());
    else if (filter === 'lastmonth') { const s = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(); const e = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); result = result.filter((tx) => tx.date >= s && tx.date < e); }
    else if (filter === 'year')      result = result.filter((tx) => tx.date >= new Date(now.getFullYear(), 0, 1).getTime());
    else if (filter === 'lastyear')  { const s = new Date(now.getFullYear() - 1, 0, 1).getTime(); const e = new Date(now.getFullYear(), 0, 1).getTime(); result = result.filter((tx) => tx.date >= s && tx.date < e); }
    else if (filter === 'day')       { const s = startOfDay(new Date(singleDay)); result = result.filter((tx) => tx.date >= s && tx.date < s + 86400000); }
    else if (filter === 'range')     { const s = new Date(rangeFrom).getTime(); const e = new Date(rangeTo).getTime() + 86400000; result = result.filter((tx) => tx.date >= s && tx.date < e); }
    if (categoryFilter) result = result.filter((tx) => tx.category === categoryFilter);
    return result;
  }, [transactions, typeFilter, filter, singleDay, rangeFrom, rangeTo, categoryFilter]);

  const categoryLabelById = useMemo(() => new Map(categories.map((c) => [c.id, c.label])), [categories]);

  const monthGroups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const key = format(tx.date, 'MMMM yyyy');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return Array.from(map.entries()).map(([month, txs]) => ({ month, txs }));
  }, [filtered]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: monthGroups.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => 44 + monthGroups[i].txs.length * 73 + 16,
    overscan: 3,
  });

  const { statIn, statOut } = useMemo(() => {
    let inTotal = 0, outTotal = 0;
    for (const tx of transactions) {
      if (tx.type === 'in') inTotal += tx.amount;
      else outTotal += tx.amount;
    }
    return { statIn: inTotal, statOut: outTotal };
  }, [transactions]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filter !== 'all') {
      const label = DATE_FILTER_OPTIONS.find((o) => o.id === filter)?.label ?? '';
      if (filter === 'day') parts.push(singleDay);
      else if (filter === 'range') parts.push(`${rangeFrom} – ${rangeTo}`);
      else parts.push(label);
    }
    if (categoryFilter) {
      const cat = categories.find((c) => c.id === categoryFilter);
      if (cat) parts.push(cat.label);
    }
    return parts.length ? parts.join(' · ') : 'All time';
  }, [filter, singleDay, rangeFrom, rangeTo, categoryFilter, categories]);

  if (bookLoading) return null;

  if (!book) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <EmptyState title="Book not found" description="This book may have been deleted." />
      </div>
    );
  }

  const color = getBookColorForId(book.id);

  return (
    <div className="h-screen bg-bg-primary flex flex-col">
      <header className="px-2 pt-12 pb-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/hisaab')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <span className={cn('w-10 h-10 rounded-icon flex items-center justify-center flex-shrink-0', color.bg, color.fg)}>
          <BookIcon iconId={book.emoji} size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-book-title text-hisaabText-primary truncate">{book.name}</span>
            <button onClick={openRename} aria-label="Rename book" className="text-hisaabText-secondary flex-shrink-0 active:opacity-60">
              <Pencil size={14} />
            </button>
          </div>
          <p className="text-caption text-hisaabText-secondary truncate">
            {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={() => navigate('/hisaab/search')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors flex-shrink-0"
          aria-label="Search"
        >
          <Search size={19} />
        </button>
        <button
          onClick={openOptions}
          className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors flex-shrink-0"
          aria-label="Book options"
        >
          <MoreVertical size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-28">
        <div className="px-4 pt-1">
          <div className="bg-bg-card rounded-card shadow-card px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-caption text-hisaabText-secondary uppercase tracking-wide">Current Balance</p>
              <AmountDisplay paise={balance} currency={book.currency} size="lg" className="mt-1" />
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-hisaabAccent-positive flex-shrink-0" />
                <span className="text-caption text-hisaabText-secondary">Income</span>
                <span className="font-sans tabular-nums text-caption-md text-hisaabAccent-positive whitespace-nowrap">{formatAmount(statIn, book.currency)}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-hisaabAccent-negative flex-shrink-0" />
                <span className="text-caption text-hisaabText-secondary">Expense</span>
                <span className="font-sans tabular-nums text-caption-md text-hisaabAccent-negative whitespace-nowrap">{formatAmount(statOut, book.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {([
              { id: 'all', label: 'All Entries' },
              { id: 'in', label: 'Income' },
              { id: 'out', label: 'Expense' },
            ] as const).map(({ id: tid, label }) => (
              <button
                key={tid}
                onClick={() => setTypeFilter(tid)}
                className={cn(
                  'px-3.5 py-1.5 rounded-button text-caption whitespace-nowrap transition-colors flex-shrink-0',
                  typeFilter === tid
                    ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                    : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={openFilter}
            aria-label="Filter by category"
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
              isFiltered ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText' : 'bg-bg-card shadow-card text-hisaabText-secondary',
            )}
          >
            <SlidersHorizontal size={15} />
          </button>
          <button
            onClick={openFilter}
            aria-label="Filter by date"
            className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center flex-shrink-0 text-hisaabText-secondary"
          >
            <CalendarDays size={16} />
          </button>
        </div>

        {isFiltered && (
          <div className="px-5 pt-2 flex items-center justify-between gap-3">
            <p className="text-caption text-hisaabText-secondary truncate">{filterSummary}</p>
            <button onClick={clearFilter} className="text-caption text-hisaabText-secondary underline flex-shrink-0">Clear</button>
          </div>
        )}

        <div className="px-4 pt-4">
          {txLoading ? (
            <div className="bg-bg-card rounded-card shadow-card overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <TransactionRowSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-bg-card rounded-card shadow-card">
              <EmptyState
                title={transactions.length === 0 ? 'No entries yet' : 'No entries for this filter'}
                description={transactions.length === 0 ? 'Tap + to record your first cash in or out.' : 'Try adjusting the filters.'}
              />
            </div>
          ) : (
            <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((item) => {
                const group = monthGroups[item.index];
                return (
                  <div
                    key={item.key}
                    ref={virtualizer.measureElement}
                    data-index={item.index}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${item.start}px)` }}
                    className="pb-4"
                  >
                    <div className="flex items-center justify-between px-2 pb-2">
                      <p className="font-serif text-lg text-hisaabText-primary">{group.month}</p>
                      <p className="text-caption text-hisaabText-secondary">{group.txs.length} {group.txs.length === 1 ? 'entry' : 'entries'}</p>
                    </div>
                    <div className="bg-bg-card rounded-card shadow-card overflow-hidden divide-y divide-hisaabBorder-light">
                      {group.txs.map((tx) => (
                        <TransactionRow
                          key={tx.id}
                          transaction={tx}
                          categoryLabel={tx.category ? categoryLabelById.get(tx.category) : undefined}
                          currency={book.currency}
                          onOpen={openTransactionDetail}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => id && openAddTransaction(id)}
        className="fixed bottom-8 right-5 w-14 h-14 rounded-full bg-hisaabAccent-button text-hisaabAccent-buttonText shadow-button flex items-center justify-center active:scale-[0.95] transition-transform duration-100"
        aria-label="Add Entry"
      >
        <Plus size={24} />
      </button>

      <BookOptionsSheet book={book} open={optionsOpen} onClose={() => setOptionsOpen(false)} startInRename={renameDirect} />

      {/* Filter sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter">
        <div className="px-5 pt-2 pb-8 space-y-6">

          {/* Date */}
          <div>
            <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Date</p>
            <div className="flex flex-wrap gap-2">
              {DATE_FILTER_OPTIONS.map(({ id: oid, label }) => (
                <button
                  key={oid}
                  onClick={() => setDraftFilter(oid)}
                  className={cn(
                    'px-4 py-2 rounded-button text-caption transition-colors',
                    draftFilter === oid
                      ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                      : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {draftFilter === 'day' && (
              <input
                type="date"
                value={draftSingleDay}
                onChange={(e) => setDraftSingleDay(e.target.value)}
                className="mt-3 w-full bg-bg-primary rounded-button px-4 py-3 text-body text-hisaabText-primary border border-hisaabBorder-light outline-none"
              />
            )}
            {draftFilter === 'range' && (
              <div className="mt-3 flex gap-2">
                <input
                  type="date"
                  value={draftRangeFrom}
                  onChange={(e) => setDraftRangeFrom(e.target.value)}
                  className="flex-1 bg-bg-primary rounded-button px-3 py-3 text-caption-md text-hisaabText-primary border border-hisaabBorder-light outline-none"
                />
                <span className="self-center text-caption text-hisaabText-secondary">to</span>
                <input
                  type="date"
                  value={draftRangeTo}
                  onChange={(e) => setDraftRangeTo(e.target.value)}
                  className="flex-1 bg-bg-primary rounded-button px-3 py-3 text-caption-md text-hisaabText-primary border border-hisaabBorder-light outline-none"
                />
              </div>
            )}
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDraftCategory(null)}
                  className={cn(
                    'px-4 py-2 rounded-button text-caption transition-colors',
                    draftCategory === null
                      ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                      : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                  )}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDraftCategory(draftCategory === c.id ? null : c.id)}
                    className={cn(
                      'px-4 py-2 rounded-button text-caption transition-colors',
                      draftCategory === c.id
                        ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                        : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={clearFilter}
              className="flex-1 py-3.5 rounded-button text-body text-hisaabText-secondary bg-bg-hover active:opacity-70 transition-opacity"
            >
              Clear
            </button>
            <button
              onClick={applyFilter}
              className="flex-[2] py-3.5 rounded-button text-body bg-hisaabAccent-button text-hisaabAccent-buttonText shadow-button active:scale-[0.98] transition-transform duration-100"
            >
              Apply
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
