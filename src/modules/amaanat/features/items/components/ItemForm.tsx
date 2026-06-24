import { cn } from '@/modules/amaanat/lib/utils';
import { CATEGORIES } from '@/modules/amaanat/lib/categories';
import { PhotoGallery } from '@/modules/amaanat/features/items/components/PhotoGallery';
import { DocumentList } from '@/modules/amaanat/features/items/components/DocumentList';
import type { Item, ItemCategory } from '@/modules/amaanat/types';

export interface ItemDraft {
  name: string;
  category: ItemCategory;
  merchant: string;
  purchaseDate: string;
  purchasePrice: string;
  serialNumber: string;
  warrantyProvider: string;
  warrantyExpiry: string;
  notes: string;
  photoIds: string[];
  documentIds: string[];
}

export function draftFromItem(item: Item | null): ItemDraft {
  return {
    name: item?.name ?? '',
    category: item?.category ?? 'electronics',
    merchant: item?.merchant ?? '',
    purchaseDate: item?.purchaseDate ? new Date(item.purchaseDate).toISOString().slice(0, 10) : '',
    purchasePrice: item?.purchasePrice != null ? String(item.purchasePrice) : '',
    serialNumber: item?.serialNumber ?? '',
    warrantyProvider: item?.warrantyProvider ?? '',
    warrantyExpiry: item?.warrantyExpiry ? new Date(item.warrantyExpiry).toISOString().slice(0, 10) : '',
    notes: item?.notes ?? '',
    photoIds: item?.photoIds ?? [],
    documentIds: item?.documentIds ?? [],
  };
}

interface ItemFormProps {
  draft: ItemDraft;
  onChange: (draft: ItemDraft) => void;
}

const inputClass = 'w-full bg-cream rounded-button px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none border border-card-border focus:border-text-secondary transition-colors';
const labelClass = 'text-caption text-text-secondary mb-2 uppercase tracking-wide block';

export function ItemForm({ draft, onChange }: ItemFormProps) {
  function set<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. MacBook Pro 16&quot;"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => set('category', id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-icon text-caption transition-colors',
                draft.category === id ? 'bg-brown text-cream' : 'bg-icon-bg text-text-secondary',
              )}
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Merchant / Seller</label>
          <input type="text" value={draft.merchant} onChange={(e) => set('merchant', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Purchase Date</label>
          <input type="date" value={draft.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Purchase Price</label>
          <input type="number" value={draft.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Serial Number</label>
          <input type="text" value={draft.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Warranty Provider</label>
          <input type="text" value={draft.warrantyProvider} onChange={(e) => set('warrantyProvider', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Warranty Expiry</label>
          <input type="date" value={draft.warrantyExpiry} onChange={(e) => set('warrantyExpiry', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={draft.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      <div>
        <label className={labelClass}>Photos</label>
        <PhotoGallery photoIds={draft.photoIds} onChange={(photoIds) => set('photoIds', photoIds)} />
      </div>

      <div>
        <label className={labelClass}>Invoices & Receipts</label>
        <DocumentList documentIds={draft.documentIds} onChange={(documentIds) => set('documentIds', documentIds)} />
      </div>
    </div>
  );
}
