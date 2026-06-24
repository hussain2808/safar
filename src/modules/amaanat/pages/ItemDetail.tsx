import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { ItemForm, draftFromItem, type ItemDraft } from '@/modules/amaanat/features/items/components/ItemForm';
import { WarrantyBadge } from '@/modules/amaanat/features/items/components/WarrantyBadge';
import { useItem } from '@/modules/amaanat/features/items/hooks/useItem';
import { createItem, updateItem, deleteItem } from '@/modules/amaanat/db/items';
import { getWarrantyStatus } from '@/modules/amaanat/lib/warranty';
import { parseAmount } from '@/modules/amaanat/lib/format';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { item, isLoading } = useItem(isNew ? undefined : id);

  const [draft, setDraft] = useState<ItemDraft>(() => draftFromItem(null));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && item) setDraft(draftFromItem(item));
  }, [isNew, item]);

  if (!isNew && isLoading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (!isNew && !isLoading && !item) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-body text-text-secondary">Item not found.</p>
      </div>
    );
  }

  async function handleSave() {
    if (!draft.name.trim()) return;
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      category: draft.category,
      merchant: draft.merchant.trim() || undefined,
      purchaseDate: draft.purchaseDate ? new Date(draft.purchaseDate).getTime() : undefined,
      purchasePrice: draft.purchasePrice ? parseAmount(draft.purchasePrice) : undefined,
      serialNumber: draft.serialNumber.trim() || undefined,
      warrantyProvider: draft.warrantyProvider.trim() || undefined,
      warrantyExpiry: draft.warrantyExpiry ? new Date(draft.warrantyExpiry).getTime() : undefined,
      notes: draft.notes.trim() || undefined,
      photoIds: draft.photoIds,
      documentIds: draft.documentIds,
    };

    if (isNew) {
      const result = await createItem(payload);
      setSaving(false);
      if (result.ok) navigate(`/amaanat/item/${result.data.id}`, { replace: true });
    } else if (id) {
      await updateItem(id, payload);
      setSaving(false);
      navigate('/amaanat');
    }
  }

  async function handleDelete() {
    if (!id) return;
    await deleteItem(id);
    navigate('/amaanat');
  }

  const warrantyStatus = draft.warrantyExpiry ? getWarrantyStatus(new Date(draft.warrantyExpiry).getTime()) : 'none';

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 pr-2">
          {warrantyStatus !== 'none' && warrantyStatus !== 'active' && <WarrantyBadge status={warrantyStatus} />}
          {!isNew && (
            <button onClick={() => setConfirmingDelete(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-accent-pink-fg active:bg-card-border transition-colors" aria-label="Delete item">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="px-4 pb-32">
        <ItemForm draft={draft} onChange={setDraft} />
      </main>

      <div className="fixed bottom-8 inset-x-4">
        <button
          onClick={handleSave}
          disabled={saving || !draft.name.trim()}
          className="w-full bg-brown text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isNew ? 'Add Item' : 'Save Changes'}
        </button>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6" onClick={() => setConfirmingDelete(false)}>
          <div className="bg-card-bg rounded-card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-body text-text-primary mb-1">Delete this item?</p>
            <p className="text-caption text-text-secondary mb-4">This will remove its photos and documents too. This can't be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmingDelete(false)} className="flex-1 bg-icon-bg text-text-primary rounded-button py-2.5 text-caption-md">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-accent-pink-bg text-accent-pink-fg rounded-button py-2.5 text-caption-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
