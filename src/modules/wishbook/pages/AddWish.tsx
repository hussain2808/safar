import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Link2, ListChecks } from 'lucide-react';
import { nanoid } from 'nanoid';
import { db } from '@/modules/wishbook/db';
import { pushWish } from '@/modules/wishbook/sync/firestore';
import { useWish } from '@/modules/wishbook/features/wishes/hooks/useWish';
import { usePeople } from '@/family/hooks/usePeople';
import { WISH_CATEGORIES } from '@/modules/wishbook/lib/categories';
import { useAuthStore } from '@/store/auth';
import { SELF_PERSON_ID } from '@/family/db';
import type { Wish, WishCategoryId, WishPriority, WishStatus, WishLink, WishItem } from '@/modules/wishbook/types';

const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR', 'PKR'];
const PRIORITIES: { value: WishPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
const STATUSES: { value: WishStatus; label: string }[] = [
  { value: 'dreaming', label: 'Dreaming' },
  { value: 'planning', label: 'Planning' },
  { value: 'saving', label: 'Saving' },
  { value: 'ready', label: 'Ready!' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'cancelled', label: 'Cancelled' },
];

const fieldStyle = 'w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none';
const selectStyle = `${fieldStyle} appearance-none cursor-pointer`;
const rowCard = 'bg-card-bg rounded-card shadow-card divide-y divide-card-border';
const fieldRow = 'flex items-center gap-3 px-4 py-3.5';
const iconBox = (bg: string) => `w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 text-base`;

export default function AddWish() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const { wish: existingWish } = useWish(id ?? '');
  const { people } = usePeople();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<WishCategoryId>('other');
  const [assignedToId, setAssignedToId] = useState(SELF_PERSON_ID);
  const [targetDate, setTargetDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [priority, setPriority] = useState<WishPriority>('medium');
  const [status, setStatus] = useState<WishStatus>('dreaming');
  const [notes, setNotes] = useState('');
  const [whyIWantThis, setWhyIWantThis] = useState('');
  const [links, setLinks] = useState<WishLink[]>([]);
  const [items, setItems] = useState<WishItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingWish) return;
    setTitle(existingWish.title);
    setCategoryId(existingWish.categoryId);
    setAssignedToId(existingWish.assignedToId);
    setTargetDate(existingWish.targetDate
      ? new Date(existingWish.targetDate).toISOString().split('T')[0]
      : '');
    setEstimatedCost(existingWish.estimatedCost ? String(existingWish.estimatedCost) : '');
    setCurrency(existingWish.currency);
    setPriority(existingWish.priority);
    setStatus(existingWish.status);
    setNotes(existingWish.notes ?? '');
    setWhyIWantThis(existingWish.whyIWantThis ?? '');
    setLinks(existingWish.links ?? []);
    setItems(existingWish.items ?? []);
  }, [existingWish]);

  const handleSave = async (addAnother = false) => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const wish: Wish = {
        id: existingWish?.id ?? nanoid(),
        title: title.trim(),
        categoryId,
        assignedToId,
        targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        savedAmount: existingWish?.savedAmount,
        currency,
        priority,
        status,
        notes: notes.trim() || undefined,
        whyIWantThis: whyIWantThis.trim() || undefined,
        links: links.length ? links : undefined,
        items: items.length ? items : undefined,
        purchasedAt: existingWish?.purchasedAt,
        archived: existingWish?.archived,
        createdAt: existingWish?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        pendingSync: true,
      };
      await db.wishes.put(wish);
      const user = useAuthStore.getState().user;
      if (user) {
        pushWish(user.uid, wish)
          .then(() => db.wishes.update(wish.id, { pendingSync: false }))
          .catch(console.error);
      }
      if (addAnother) {
        setTitle(''); setNotes(''); setWhyIWantThis(''); setLinks([]); setItems([]);
        setTargetDate(''); setEstimatedCost('');
        setCategoryId('other'); setAssignedToId(SELF_PERSON_ID);
        setPriority('medium'); setStatus('dreaming');
      } else {
        navigate(isEdit ? `/wishbook/wish/${wish.id}` : '/wishbook');
      }
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => setLinks((prev) => [...prev, { id: nanoid(), label: '', url: '' }]);
  const updateLink = (id: string, field: 'label' | 'url', value: string) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  const removeLink = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id));

  const addItem = () => setItems((prev) => [...prev, { id: nanoid(), label: '', checked: false }]);
  const updateItem = (id: string, field: 'label' | 'estimatedCost', value: string) =>
    setItems((prev) => prev.map((it) =>
      it.id === id ? { ...it, [field]: field === 'estimatedCost' ? (value ? parseFloat(value) : undefined) : value } : it,
    ));
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <header className="px-4 pt-12 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-[#1B4332] font-medium"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-serif text-[34px] leading-tight text-text-primary">
          {isEdit ? 'Edit Wish' : 'Add New Wish'}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {isEdit ? 'Update the details of your wish.' : 'Capture the things you hope to bring into your life.'}
        </p>
      </header>

      <div className="px-4 space-y-4">
        {/* Title */}
        <div className={rowCard}>
          <div className={fieldRow}>
            <div className={iconBox('bg-accent-green-bg')}>📋</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-primary mb-1">Title <span className="text-red-400">*</span></p>
              <input
                className={fieldStyle}
                placeholder="What is this wish?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus={!isEdit}
              />
            </div>
          </div>
        </div>

        {/* Category + Assigned To */}
        <div className={rowCard}>
          <div className="grid grid-cols-2 divide-x divide-card-border">
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-purple-bg')}>🏷️</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Category <span className="text-red-400">*</span></p>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as WishCategoryId)}
                  className={selectStyle}
                >
                  {WISH_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-blue-bg')}>👥</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Assigned To <span className="text-red-400">*</span></p>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className={selectStyle}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id === SELF_PERSON_ID ? 'Myself' : p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Target Date + Estimated Cost */}
        <div className={rowCard}>
          <div className="grid grid-cols-2 divide-x divide-card-border">
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-orange-bg')}>📅</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Target Date</p>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={`${fieldStyle} [color-scheme:light]`}
                />
              </div>
            </div>
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-green-bg')}>💵</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Estimated Cost</p>
                <div className="flex items-center gap-1">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs text-text-secondary bg-transparent outline-none appearance-none cursor-pointer w-10 flex-shrink-0"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className={`${fieldStyle} w-full`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority + Status */}
        <div className={rowCard}>
          <div className="grid grid-cols-2 divide-x divide-card-border">
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-pink-bg')}>🚩</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Priority</p>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WishPriority)}
                  className={selectStyle}
                >
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className={`${fieldRow} col-span-1`}>
              <div className={iconBox('bg-accent-blue-bg')}>⭕</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary mb-1">Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WishStatus)}
                  className={selectStyle}
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={rowCard}>
          <div className="px-4 py-3.5 flex gap-3">
            <div className={`${iconBox('bg-badge-bg')} mt-0.5`}>📝</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-primary mb-1">Notes <span className="text-text-muted font-normal">(Optional)</span></p>
              <textarea
                rows={3}
                placeholder="Add any notes about this wish…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${fieldStyle} resize-none`}
              />
            </div>
          </div>
          <div className="px-4 py-3.5 flex gap-3">
            <div className={`${iconBox('bg-accent-orange-bg')} mt-0.5`}>⭐</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-primary mb-1">Why I Want This <span className="text-text-muted font-normal">(Optional)</span></p>
              <textarea
                rows={2}
                placeholder="What makes this wish meaningful to you?"
                value={whyIWantThis}
                onChange={(e) => setWhyIWantThis(e.target.value)}
                className={`${fieldStyle} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Items / Checklist */}
        <div className={rowCard}>
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className={iconBox('bg-accent-green-bg')}>
                <ListChecks size={16} className="text-accent-green-fg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Items <span className="text-text-muted font-normal text-xs">(Optional)</span></p>
                <p className="text-xs text-text-secondary">Break this wish into a list of things to get.</p>
              </div>
            </div>
            {items.map((item, idx) => (
              <div key={item.id} className="mb-2 bg-icon-bg rounded-xl p-3 flex items-center gap-2">
                <span className="text-text-muted text-xs font-medium w-5 flex-shrink-0">{idx + 1}.</span>
                <input
                  placeholder="Item name…"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  className="flex-1 text-sm text-text-primary bg-transparent outline-none placeholder:text-text-muted"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Cost"
                  value={item.estimatedCost ?? ''}
                  onChange={(e) => updateItem(item.id, 'estimatedCost', e.target.value)}
                  className="w-16 text-xs text-text-secondary bg-transparent outline-none placeholder:text-text-muted text-right"
                />
                <button onClick={() => removeItem(item.id)} className="text-red-400 p-1 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-sm text-accent-green-fg font-medium mt-1"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>
        </div>

        {/* Reference Links */}
        <div className={rowCard}>
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className={iconBox('bg-accent-blue-bg')}>
                <Link2 size={16} className="text-accent-blue-fg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Reference Links <span className="text-text-muted font-normal text-xs">(Optional)</span></p>
                <p className="text-xs text-text-secondary">Add links to websites, articles, videos, etc.</p>
              </div>
            </div>
            {links.map((link) => (
              <div key={link.id} className="mb-2 bg-icon-bg rounded-xl p-3 space-y-1.5">
                <input
                  placeholder="Label (e.g. Sony Official Website)"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                  className="w-full text-sm text-text-primary bg-transparent outline-none placeholder:text-text-muted"
                />
                <div className="flex items-center gap-2">
                  <input
                    placeholder="https://"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    className="flex-1 text-sm text-text-primary bg-transparent outline-none placeholder:text-text-muted"
                    type="url"
                    inputMode="url"
                  />
                  <button onClick={() => removeLink(link.id)} className="text-red-400 p-1 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addLink}
              className="flex items-center gap-1.5 text-sm text-accent-blue-fg font-medium mt-1"
            >
              <Plus size={15} /> Add Link
            </button>
          </div>
        </div>

        {/* Save buttons */}
        <div className="space-y-3 pb-8">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !title.trim()}
            className="w-full h-14 bg-[#1B4332] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold text-base shadow-button active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving…' : isEdit ? 'Update Wish' : 'Save Wish'}
          </button>
          {!isEdit && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !title.trim()}
              className="w-full h-14 bg-card-bg text-text-primary rounded-2xl flex items-center justify-center font-semibold text-base shadow-card border border-card-border active:bg-card-border transition-colors disabled:opacity-50"
            >
              Save &amp; Add Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
