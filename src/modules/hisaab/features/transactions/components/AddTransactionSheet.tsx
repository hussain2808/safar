import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Camera, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Tag, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmSheet } from '@/modules/hisaab/shared/components/ConfirmSheet';
import { PhotoThumb } from '@/modules/hisaab/shared/components/PhotoThumb';
import { CategoryManagerSheet } from '@/modules/hisaab/features/categories/components/CategoryManagerSheet';
import { CategoryPickerSheet } from './CategoryPickerSheet';
import { PaymentMethodSheet } from './PaymentMethodSheet';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { BookIcon } from '@/modules/hisaab/lib/bookIcons';
import { PAYMENT_METHOD_LABELS } from '@/modules/hisaab/lib/paymentMethods';
import { db } from '@/modules/hisaab/db';
import { createTransaction, updateTransaction, deleteTransaction } from '@/modules/hisaab/db/transactions';
import { savePhoto, deletePhoto } from '@/modules/hisaab/db/photos';
import { parseAmountToPaise } from '@/modules/hisaab/lib/format';
import { getCurrency, DEFAULT_CURRENCY } from '@/modules/hisaab/lib/currencies';
import { cn } from '@/modules/hisaab/lib/utils';
import { useUIStore } from '@/modules/hisaab/store/ui';
import { useKeyboardInset } from '@/lib/useKeyboardInset';
import type { TransactionType } from '@/modules/hisaab/types';

export function AddTransactionSheet() {
  const { addTransactionSheetOpen, addTransactionBookId, editingTransaction, closeAddTransaction } = useUIStore();
  const keyboardInset = useKeyboardInset();

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
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [dateStr, setDateStr] = useState(format(Date.now(), 'yyyy-MM-dd'));
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const savedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [paymentMethodPickerOpen, setPaymentMethodPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addTransactionSheetOpen) return;
    setSavedToast(null);
    if (savedToastTimeoutRef.current) clearTimeout(savedToastTimeoutRef.current);
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountInput(String(editingTransaction.amount / 100));
      setRemark(editingTransaction.remark);
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDateStr(format(editingTransaction.date, 'yyyy-MM-dd'));
      setPhotoId(editingTransaction.photoId);
    } else {
      setType('out');
      setAmountInput('');
      setRemark('');
      setCategory(undefined);
      setPaymentMethod(undefined);
      setDateStr(format(Date.now(), 'yyyy-MM-dd'));
      setPhotoId(undefined);
    }
    setTimeout(() => amountRef.current?.focus(), 300);
  }, [addTransactionSheetOpen, editingTransaction]);

  useEffect(() => {
    document.body.style.overflow = addTransactionSheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [addTransactionSheetOpen]);

  useEffect(() => () => {
    if (savedToastTimeoutRef.current) clearTimeout(savedToastTimeoutRef.current);
  }, []);

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

  async function handleSave(andAddNew = false) {
    const amount = parseAmountToPaise(amountInput);
    if (amount <= 0 || !addTransactionBookId || saving) return;
    setSaving(true);
    const date = new Date(dateStr).getTime();
    const payload = { bookId: addTransactionBookId, type, amount, remark: remark.trim(), category, paymentMethod, photoId, date };
    const result = editingTransaction
      ? await updateTransaction(editingTransaction.id, payload)
      : await createTransaction(payload);
    setSaving(false);
    if (!result.ok) return;

    if (andAddNew && !editingTransaction) {
      if (savedToastTimeoutRef.current) clearTimeout(savedToastTimeoutRef.current);
      setSavedToast(`Saved ${currencySymbol}${amountInput}`);
      savedToastTimeoutRef.current = setTimeout(() => setSavedToast(null), 1400);

      setAmountInput('');
      setRemark('');
      setCategory(undefined);
      setPaymentMethod(undefined);
      setPhotoId(undefined);
      setTimeout(() => amountRef.current?.focus(), 50);
    } else {
      closeAddTransaction();
    }
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
  const selectedCategory = categories.find((c) => c.id === category);

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
            <header className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0">
              <button
                onClick={closeAddTransaction}
                className="w-10 h-10 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-primary active:bg-bg-hover transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-section-heading text-hisaabText-primary leading-tight">
                  {editingTransaction ? 'Edit Entry' : 'Add Entry'}
                </h1>
                {book && (
                  <div className="flex items-center gap-1.5 mt-0.5 text-hisaabText-secondary">
                    <BookIcon iconId={book.emoji} size={13} />
                    <span className="text-caption truncate">{book.name}</span>
                  </div>
                )}
              </div>
              {editingTransaction && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-caption text-hisaabAccent-negative px-3 py-1.5 rounded-button active:bg-bg-hover transition-colors flex-shrink-0"
                >
                  Delete
                </button>
              )}
            </header>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto pb-28">
              {/* Type toggle */}
              <div className="px-5 pt-1 flex gap-3">
                <button
                  onClick={() => handleTypeChange('in')}
                  className={cn(
                    'flex-1 h-11 rounded-button flex items-center justify-center gap-2 text-body transition-colors',
                    type === 'in'
                      ? 'bg-hisaabAccent-positiveSoft text-hisaabAccent-positive border-2 border-hisaabAccent-positive'
                      : 'bg-bg-hover text-hisaabAccent-positive',
                  )}
                >
                  <ArrowUp size={16} />
                  Cash In
                </button>
                <button
                  onClick={() => handleTypeChange('out')}
                  className={cn(
                    'flex-1 h-11 rounded-button flex items-center justify-center gap-2 text-body transition-colors',
                    type === 'out'
                      ? 'bg-hisaabAccent-negativeSoft text-hisaabAccent-negative border-2 border-hisaabAccent-negative'
                      : 'bg-bg-hover text-hisaabAccent-negative',
                  )}
                >
                  <ArrowDown size={16} />
                  Cash Out
                </button>
              </div>

              {/* Amount */}
              <div className="px-5 pt-4">
                <div className="bg-bg-card rounded-card shadow-card px-5 py-5 flex items-center justify-center gap-2">
                  <span className={cn('font-sans text-amount-md', type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative')}>
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
                      'font-sans font-bold tabular-nums text-[40px] leading-none text-center bg-transparent outline-none w-44 placeholder:text-hisaabText-placeholder',
                      type === 'in' ? 'text-hisaabAccent-positive' : 'text-hisaabAccent-negative',
                    )}
                  />
                </div>
              </div>

              <div className="px-5 pt-3 space-y-2.5">
                {/* Remark */}
                <div className="bg-bg-card rounded-card shadow-card px-4 py-3">
                  <p className="text-body text-hisaabText-primary mb-0.5">What was it for?</p>
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="e.g. Grocery, Restaurant, Petrol"
                    className="w-full bg-transparent text-caption-md text-hisaabText-primary placeholder:text-hisaabText-placeholder outline-none"
                  />
                </div>

                {/* Category */}
                <button
                  onClick={() => setCategoryPickerOpen(true)}
                  className="w-full flex items-center justify-between gap-3 bg-bg-card rounded-card shadow-card px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Tag size={14} className="text-hisaabText-secondary" />
                      <span className="text-body text-hisaabText-primary">Category</span>
                    </div>
                    <span className={cn('text-caption-md truncate block', selectedCategory ? 'text-hisaabText-primary' : 'text-hisaabText-secondary')}>
                      {selectedCategory ? selectedCategory.label : 'Select a category'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-hisaabText-secondary flex-shrink-0" />
                </button>

                {/* Date */}
                <div className="relative w-full flex items-center gap-3 bg-bg-card rounded-card shadow-card px-4 py-3">
                  <CalendarDays size={16} className="text-hisaabText-secondary flex-shrink-0" />
                  <span className="flex-1 text-body text-hisaabText-primary">Date</span>
                  <span className="text-caption-md text-hisaabText-secondary">{format(new Date(dateStr), 'd MMM yyyy')}</span>
                  <ChevronRight size={16} className="text-hisaabText-secondary flex-shrink-0" />
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    aria-label="Date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Payment method */}
                <button
                  onClick={() => setPaymentMethodPickerOpen(true)}
                  className="w-full flex items-center justify-between gap-3 bg-bg-card rounded-card shadow-card px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Wallet size={16} className="text-hisaabText-secondary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-body text-hisaabText-primary">
                        Payment method <span className="text-hisaabText-secondary">(optional)</span>
                      </p>
                      <p className={cn('text-caption-md truncate', paymentMethod ? 'text-hisaabText-primary' : 'text-hisaabText-secondary')}>
                        {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : 'Select payment method'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-hisaabText-secondary flex-shrink-0" />
                </button>

                {/* Photo */}
                <div>
                  <p className="text-body text-hisaabText-primary mb-2">
                    Receipt <span className="text-hisaabText-secondary">(optional)</span>
                  </p>
                  {photoId ? (
                    <PhotoThumb photoId={photoId} onRemove={handleRemovePhoto} />
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 rounded-card border-2 border-dashed border-hisaabBorder-light flex flex-col items-center justify-center gap-1 active:bg-bg-hover transition-colors"
                    >
                      <Camera size={20} className="text-hisaabText-secondary" />
                      <span className="text-caption-md text-hisaabText-primary">Attach a photo</span>
                      <span className="text-caption text-hisaabText-secondary">JPG, PNG up to 5MB</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} className="hidden" />
                </div>
              </div>
            </div>

            {/* Fixed save button — floats above the on-screen keyboard when one is open */}
            <div
              className={cn(
                'fixed inset-x-0 px-5 pt-4 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pointer-events-none transition-[bottom] duration-150',
                keyboardInset > 0 ? 'pb-3' : 'pb-10',
              )}
              style={{ bottom: keyboardInset }}
            >
              <AnimatePresence>
                {savedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="flex justify-center mb-2.5"
                  >
                    <span className="bg-hisaabAccent-positive text-white text-caption-md px-4 py-2 rounded-full shadow-button flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {savedToast}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-3">
                {!editingTransaction && (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={amount <= 0 || saving}
                    className="flex-1 pointer-events-auto bg-transparent text-hisaabAccent-button border-2 border-hisaabAccent-button rounded-button py-4 text-body disabled:opacity-40 active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2"
                  >
                    Save &amp; add new
                  </button>
                )}
                <button
                  onClick={() => handleSave(false)}
                  disabled={amount <= 0 || saving}
                  className="flex-1 pointer-events-auto bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button disabled:opacity-40 active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
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

      <CategoryPickerSheet
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        categories={categories}
        value={category}
        onSelect={setCategory}
        onAddNew={() => { setCategoryPickerOpen(false); setQuickAddOpen(true); }}
      />

      <PaymentMethodSheet
        open={paymentMethodPickerOpen}
        onClose={() => setPaymentMethodPickerOpen(false)}
        value={paymentMethod}
        onSelect={setPaymentMethod}
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
