import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { Camera, ChevronLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmSheet } from '@/modules/hisaab/shared/components/ConfirmSheet';
import { PhotoThumb } from '@/modules/hisaab/shared/components/PhotoThumb';
import { CategoryManagerSheet } from '@/modules/hisaab/features/categories/components/CategoryManagerSheet';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { CategoryIcon } from '@/modules/hisaab/lib/categoryIcons';
import { db } from '@/modules/hisaab/db';
import { createTransaction, updateTransaction, deleteTransaction } from '@/modules/hisaab/db/transactions';
import { savePhoto, deletePhoto } from '@/modules/hisaab/db/photos';
import { parseAmountToPaise } from '@/modules/hisaab/lib/format';
import { getCurrency, DEFAULT_CURRENCY } from '@/modules/hisaab/lib/currencies';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';
import type { TransactionType } from '@/modules/hisaab/types';

export function AddTransactionSheet() {
  const { addTransactionSheetOpen, addTransactionBookId, editingTransaction, closeAddTransaction } = useUIStore();

  const book = useLiveQuery(
    () => addTransactionBookId ? db.books.get(addTransactionBookId) : undefined,
    [addTransactionBookId],
  );
  const currencySymbol = getCurrency(book?.currency ?? DEFAULT_CURRENCY).symbol;
  const { categories: bookCategories } = useCategories(addTransactionBookId ?? undefined);

  const [type, setType] = useState<TransactionType>('out');
  const [amountInput, setAmountInput] = useState('');
  const [remark, setRemark] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [dateStr, setDateStr] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addTransactionSheetOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountInput(String(editingTransaction.amount / 100));
      setRemark(editingTransaction.remark);
      setCategory(editingTransaction.category);
      setDateStr(format(editingTransaction.date, 'yyyy-MM-dd'));
      setPhotoId(editingTransaction.photoId);
    } else {
      setType('out');
      setAmountInput('');
      setRemark('');
      setCategory(undefined);
      setDateStr(format(Date.now(), 'yyyy-MM-dd'));
      setPhotoId(undefined);
    }
    setTimeout(() => amountRef.current?.focus(), 300);
  }, [addTransactionSheetOpen, editingTransaction]);

  useEffect(() => {
    document.body.style.overflow = addTransactionSheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [addTransactionSheetOpen]);

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(undefined);
  }

  async function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = await savePhoto(file);
    if (result.ok) {
      if (photoId) await deletePhoto(photoId);
      setPhotoId(result.data.id);
    }
  }

  async function handleRemovePhoto() {
    if (photoId) await deletePhoto(photoId);
    setPhotoId(undefined);
  }

  async function handleSave() {
    const amount = parseAmountToPaise(amountInput);
    if (amount <= 0 || !addTransactionBookId || saving) return;
    setSaving(true);
    const date = new Date(dateStr).getTime();
    const payload = { bookId: addTransactionBookId, type, amount, remark: remark.trim(), category, photoId, date };
    const result = editingTransaction
      ? await updateTransaction(editingTransaction.id, payload)
      : await createTransaction(payload);
    setSaving(false);
    if (result.ok) closeAddTransaction();
  }

  async function handleDelete() {
    if (!editingTransaction || saving) return;
    setSaving(true);
    await deleteTransaction(editingTransaction.id);
    if (editingTransaction.photoId) await deletePhoto(editingTransaction.photoId);
    setSaving(false);
    closeAddTransaction();
  }

  const amount = parseAmountToPaise(amountInput);
  const categories = bookCategories;

  return (
    <>
      <AnimatePresence>
        {addTransactionSheetOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <header className="flex items-center gap-2 px-2 pt-12 pb-3 flex-shrink-0">
              <button
                onClick={closeAddTransaction}
                className="w-10 h-10 rounded-full flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <h1 className="flex-1 text-section-heading text-hisaabText-primary">
                {editingTransaction ? 'Edit Entry' : 'Add Entry'}
              </h1>
              {editingTransaction && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-caption text-hisaabAccent-negative px-3 py-1.5 rounded-button active:bg-bg-hover transition-colors"
                >
                  Delete
                </button>
              )}
            </header>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto pb-36">
              {/* Type toggle */}
              <div className="px-5 pt-2">
                <div className="flex bg-bg-hover rounded-button p-1">
                  <button
                    onClick={() => handleTypeChange('in')}
                    className={cn(
                      'flex-1 h-11 rounded-icon text-body transition-colors',
                      type === 'in' ? 'bg-hisaabAccent-positive text-white' : 'text-hisaabText-secondary',
                    )}
                  >
                    Cash In
                  </button>
                  <button
                    onClick={() => handleTypeChange('out')}
                    className={cn(
                      'flex-1 h-11 rounded-icon text-body transition-colors',
                      type === 'out' ? 'bg-hisaabAccent-negative text-white' : 'text-hisaabText-secondary',
                    )}
                  >
                    Cash Out
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-baseline justify-center gap-2 py-8">
                <span className={cn('font-sans text-amount-lg', type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
                  {currencySymbol}
                </span>
                <input
                  ref={amountRef}
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className={cn(
                    'font-sans font-bold tabular-nums text-[52px] leading-none text-center bg-transparent outline-none w-48 placeholder:text-hisaabText-placeholder',
                    type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative',
                  )}
                />
              </div>

              <div className="px-5 space-y-4">
                {/* Remark */}
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="What was it for?"
                  className="w-full bg-bg-card rounded-button px-4 py-3.5 text-body text-hisaabText-primary placeholder:text-hisaabText-placeholder outline-none border border-hisaabBorder-light focus:border-hisaabText-secondary transition-colors shadow-card"
                />

                {/* Category */}
                <div>
                  <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(category === c.id ? undefined : c.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-icon text-caption transition-colors',
                          category === c.id
                            ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                            : 'bg-bg-card text-hisaabText-secondary shadow-card active:bg-bg-hover',
                        )}
                      >
                        <CategoryIcon iconId={c.icon} size={13} />
                        {c.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setQuickAddOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-icon text-caption bg-bg-icon text-hisaabText-secondary active:bg-bg-hover transition-colors"
                    >
                      <Plus size={13} />
                      New
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 bg-bg-card rounded-button px-4 py-3.5 border border-hisaabBorder-light shadow-card">
                  <span className="flex-1 text-body text-hisaabText-primary">Date</span>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="bg-transparent text-caption-md text-hisaabText-secondary outline-none"
                  />
                </div>

                {/* Photo */}
                <div>
                  <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Receipt</p>
                  {photoId ? (
                    <PhotoThumb photoId={photoId} onRemove={handleRemovePhoto} />
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 rounded-icon bg-bg-card shadow-card flex flex-col items-center justify-center gap-1.5 text-hisaabText-secondary active:bg-bg-hover transition-colors"
                    >
                      <Camera size={20} />
                      <span className="text-caption">Attach a photo</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} className="hidden" />
                </div>
              </div>
            </div>

            {/* Fixed save button */}
            <div className="fixed bottom-0 inset-x-0 px-5 pb-10 pt-4 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pointer-events-none">
              <button
                onClick={handleSave}
                disabled={amount <= 0 || saving}
                className="w-full pointer-events-auto bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button disabled:opacity-40 active:scale-[0.98] transition-transform duration-100"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this entry?"
        description="This entry will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
      />

      {addTransactionBookId && (
        <CategoryManagerSheet
          bookId={addTransactionBookId}
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          startAdding
          onCreated={(c) => { setCategory(c.id); setQuickAddOpen(false); }}
        />
      )}
    </>
  );
}
