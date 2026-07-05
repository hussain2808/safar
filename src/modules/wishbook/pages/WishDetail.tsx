import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, MoreHorizontal, Pencil, CheckCircle2, Copy,
  Archive, Trash2, Tag, User, Flag, Calendar, PieChart,
  Star, Link2, FileText, ExternalLink, Hourglass, Target,
  Banknote, ListChecks, CheckSquare, Square,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { db } from '@/modules/wishbook/db';
import { pushWish, deleteFirestoreWish } from '@/modules/wishbook/sync/firestore';
import { useWish } from '@/modules/wishbook/features/wishes/hooks/useWish';
import { usePeople } from '@/family/hooks/usePeople';
import { getCategoryById } from '@/modules/wishbook/lib/categories';
import {
  formatCurrency, formatDate, formatDateFull, daysRemaining,
  PRIORITY_STYLE, STATUS_STYLE,
} from '@/modules/wishbook/lib/format';
import { useAuthStore } from '@/store/auth';
import { BottomSheet } from '@/modules/wishbook/shared/components/BottomSheet';
import { SELF_PERSON_ID } from '@/family/db';
import type { PendingDelete, Wish } from '@/modules/wishbook/types';

function MetaCell({ label, value, icon: Icon, valueClass = '' }: {
  label: string; value: string; icon: typeof User; valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <Icon size={14} className="text-text-muted" strokeWidth={1.5} />
      <span className="text-[10px] text-text-secondary">{label}</span>
      <span className={`text-xs font-semibold text-text-primary leading-tight ${valueClass}`}>{value}</span>
    </div>
  );
}

function InfoCell({ label, value, icon: Icon, valueClass = '' }: {
  label: string; value: string; icon: typeof Calendar; valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className="w-8 h-8 rounded-xl bg-icon-bg flex items-center justify-center">
        <Icon size={14} className="text-text-secondary" strokeWidth={1.5} />
      </div>
      <span className="text-[10px] text-text-secondary">{label}</span>
      <span className={`text-[11px] font-semibold text-text-primary ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function WishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wish, isLoading } = useWish(id ?? '');
  const { people } = usePeople();
  const [showSavedSheet, setShowSavedSheet] = useState(false);
  const [savedInput, setSavedInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-cream" />;
  if (!wish) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-text-secondary">Wish not found.</p>
    </div>
  );

  const category = getCategoryById(wish.categoryId);
  const CategoryIcon = category.icon;
  const person = people.find((p) => p.id === wish.assignedToId);
  const personName = person?.id === SELF_PERSON_ID ? 'Myself' : (person?.name ?? 'Myself');
  const status = STATUS_STYLE[wish.status];
  const priority = PRIORITY_STYLE[wish.priority];
  const progress = (wish.estimatedCost && wish.savedAmount)
    ? Math.min(100, Math.round((wish.savedAmount / wish.estimatedCost) * 100))
    : 0;
  const checkedCount = wish.items?.filter((it) => it.checked).length ?? 0;
  const totalItems = wish.items?.length ?? 0;
  const itemProgress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const syncWish = (updated: Partial<Wish>) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const merged = { ...wish, ...updated };
    pushWish(user.uid, merged as Wish)
      .then(() => db.wishes.update(wish.id, { pendingSync: false }))
      .catch(console.error);
  };

  const handleMarkPurchased = async () => {
    const updates = { status: 'purchased' as const, purchasedAt: Date.now(), updatedAt: Date.now(), pendingSync: true };
    await db.wishes.update(wish.id, updates);
    syncWish(updates);
  };

  const handleArchive = async () => {
    const updates = { archived: true, updatedAt: Date.now(), pendingSync: true };
    await db.wishes.update(wish.id, updates);
    syncWish(updates);
    navigate('/wishbook');
  };

  const handleDuplicate = async () => {
    const duplicate: Wish = {
      ...wish,
      id: nanoid(),
      title: `${wish.title} (Copy)`,
      status: 'dreaming',
      purchasedAt: undefined,
      archived: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pendingSync: true,
    };
    await db.wishes.put(duplicate);
    const user = useAuthStore.getState().user;
    if (user) {
      pushWish(user.uid, duplicate)
        .then(() => db.wishes.update(duplicate.id, { pendingSync: false }))
        .catch(console.error);
    }
    navigate(`/wishbook/wish/${duplicate.id}`);
  };

  const handleDelete = async () => {
    const pd: PendingDelete = { id: nanoid(), kind: 'wish', targetId: wish.id, createdAt: Date.now() };
    await db.wishes.delete(wish.id);
    await db.pendingDeletes.put(pd);
    const user = useAuthStore.getState().user;
    if (user) {
      deleteFirestoreWish(user.uid, wish.id).then(() => db.pendingDeletes.delete(pd.id)).catch(console.error);
    }
    navigate('/wishbook');
  };

  const handleToggleItem = async (itemId: string) => {
    const updated = (wish.items ?? []).map((it) =>
      it.id === itemId ? { ...it, checked: !it.checked } : it,
    );
    const updates = { items: updated, updatedAt: Date.now(), pendingSync: true };
    await db.wishes.update(wish.id, updates);
    syncWish(updates);
  };

  const handleSaveSavedAmount = async () => {
    const amount = parseFloat(savedInput);
    if (isNaN(amount)) return;
    const updates = { savedAmount: amount, updatedAt: Date.now(), pendingSync: true };
    await db.wishes.update(wish.id, updates);
    syncWish(updates);
    setShowSavedSheet(false);
  };

  return (
    <div className="min-h-screen bg-cream pb-36">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => navigate('/wishbook')}
          className="flex items-center gap-0.5 text-[#C8922E] font-medium text-sm"
        >
          <ChevronLeft size={18} />
          <span>Wishbook</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/wishbook/wish/${id}/edit`)}
            className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button className="w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Hero */}
        <div className="flex items-start gap-4">
          <div className={`w-20 h-20 rounded-2xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
            <CategoryIcon size={36} className={category.fg} strokeWidth={1.5} />
          </div>
          <div className="flex-1 pt-1">
            <h1 className="text-[22px] font-bold text-text-primary leading-snug">{wish.title}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag size={13} className={category.fg} />
              <span className={`text-sm font-medium ${category.fg}`}>{category.label}</span>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="bg-card-bg rounded-card shadow-card px-4 py-4 grid grid-cols-4 gap-2">
          <MetaCell label="For" value={personName} icon={User} />
          <MetaCell label="Status" value={status.label} icon={Flag} valueClass={status.fg} />
          <MetaCell label="Priority" value={priority.label} icon={Flag} valueClass={priority.color} />
          <MetaCell label="Target Date" value={wish.targetDate ? formatDate(wish.targetDate) : '—'} icon={Calendar} />
        </div>

        {/* Cost row */}
        <div className="bg-card-bg rounded-card shadow-card px-4 py-4 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1.5">
              <Calendar size={12} />
              <span>Estimated Cost</span>
            </div>
            <p className="text-xl font-bold text-[#C8922E]">
              {wish.estimatedCost ? formatCurrency(wish.estimatedCost, wish.currency) : '—'}
            </p>
          </div>
          <button
            onClick={() => { setSavedInput(String(wish.savedAmount ?? 0)); setShowSavedSheet(true); }}
            className="text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1.5">
                <Banknote size={12} />
                <span>Saved So Far</span>
              </div>
              <ChevronLeft size={14} className="text-text-muted rotate-180 mb-1.5" />
            </div>
            <p className="text-xl font-bold text-[#C8922E]">
              {wish.savedAmount ? formatCurrency(wish.savedAmount, wish.currency) : `${wish.currency} 0`}
            </p>
          </button>
        </div>

        {/* Progress */}
        {!!wish.estimatedCost && (
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <PieChart size={15} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-semibold text-text-primary text-sm">Progress</span>
              </div>
              <span className="font-bold text-text-primary text-sm">{progress}%</span>
            </div>
            <p className="text-xs text-text-secondary mb-2.5">
              {wish.savedAmount ? formatCurrency(wish.savedAmount, wish.currency) : `${wish.currency} 0`} saved of {formatCurrency(wish.estimatedCost, wish.currency)}
            </p>
            <div className="h-2 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C8922E] to-[#E0B25C] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items checklist */}
        {!!wish.items?.length && (
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks size={15} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-semibold text-text-primary text-sm">Items</span>
              </div>
              <span className="text-xs text-text-secondary font-medium">
                {checkedCount}/{totalItems} · {itemProgress}%
              </span>
            </div>
            <div className="h-1.5 bg-card-border rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#C8922E] to-[#E0B25C] rounded-full transition-all duration-300"
                style={{ width: `${itemProgress}%` }}
              />
            </div>
            <div className="space-y-0.5">
              {wish.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className="w-full flex items-center gap-3 py-2.5 px-1 active:bg-card-border rounded-xl transition-colors"
                >
                  {item.checked
                    ? <CheckSquare size={18} className="text-[#C8922E] flex-shrink-0" />
                    : <Square size={18} className="text-text-muted flex-shrink-0" />
                  }
                  <span className={`flex-1 text-left text-sm ${item.checked ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {item.label}
                  </span>
                  {!!item.estimatedCost && (
                    <span className="text-xs text-text-secondary flex-shrink-0">
                      {wish.currency} {item.estimatedCost.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Why I Want This */}
        {!!wish.whyIWantThis && (
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={15} className="text-gold" />
              <span className="font-semibold text-text-primary text-sm">Why I Want This</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{wish.whyIWantThis}</p>
          </div>
        )}

        {/* Reference Links */}
        {!!wish.links?.length && (
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={15} className="text-text-secondary" strokeWidth={1.5} />
              <span className="font-semibold text-text-primary text-sm">Reference Links</span>
            </div>
            <div className="space-y-2">
              {wish.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-accent-blue-fg text-sm py-0.5"
                >
                  <span className="line-clamp-1">{link.label || link.url}</span>
                  <ExternalLink size={13} className="flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {!!wish.notes && (
          <div className="bg-card-bg rounded-card shadow-card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={15} className="text-text-secondary" strokeWidth={1.5} />
              <span className="font-semibold text-text-primary text-sm">Notes</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{wish.notes}</p>
          </div>
        )}

        {/* Bottom info row */}
        <div className="bg-card-bg rounded-card shadow-card px-4 py-4 grid grid-cols-4 gap-2">
          <InfoCell label="Created" value={formatDateFull(wish.createdAt)} icon={Calendar} />
          <InfoCell label="Target" value={wish.targetDate ? formatDate(wish.targetDate) : '—'} icon={Target} />
          <InfoCell
            label="Days Remaining"
            value={wish.targetDate ? `${Math.max(0, daysRemaining(wish.targetDate))} days` : '—'}
            icon={Hourglass}
            valueClass="text-accent-blue-fg"
          />
          <InfoCell label="Belongs To" value={personName} icon={User} />
        </div>

        {/* Mark as Purchased */}
        {wish.status !== 'purchased' && wish.status !== 'cancelled' && !wish.archived && (
          <button
            onClick={handleMarkPurchased}
            className="w-full h-14 bg-gradient-to-r from-[#C8922E] to-[#E0B25C] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold text-base shadow-button active:scale-[0.98] transition-transform duration-100"
          >
            <CheckCircle2 size={20} />
            Mark as Purchased
          </button>
        )}

        {/* Action row */}
        <div className="bg-card-bg rounded-card shadow-card overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-card-border">
            {[
              { icon: Pencil, label: 'Edit', onClick: () => navigate(`/wishbook/wish/${id}/edit`), cls: '' },
              { icon: Copy, label: 'Duplicate', onClick: handleDuplicate, cls: '' },
              { icon: Archive, label: 'Archive', onClick: handleArchive, cls: '' },
              { icon: Trash2, label: 'Delete', onClick: () => setShowDeleteConfirm(true), cls: 'text-red-500' },
            ].map(({ icon: Icon, label, onClick, cls }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex flex-col items-center gap-1.5 py-3.5 active:bg-card-border transition-colors ${cls || 'text-text-secondary'}`}
              >
                <Icon size={17} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-100 rounded-card p-4 space-y-3">
            <p className="text-sm font-medium text-red-700">Delete this wish permanently?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-card-bg border border-card-border text-text-secondary text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved So Far sheet */}
      <BottomSheet
        open={showSavedSheet}
        onClose={() => setShowSavedSheet(false)}
        title="Saved So Far"
      >
        <div className="px-5 py-5 space-y-4">
          <div className="bg-icon-bg rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-text-secondary text-sm font-medium">{wish.currency}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={savedInput}
              onChange={(e) => setSavedInput(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-lg font-bold text-text-primary bg-transparent outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleSaveSavedAmount}
            className="w-full h-12 bg-gradient-to-r from-[#C8922E] to-[#E0B25C] text-white rounded-xl font-semibold"
          >
            Save
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
