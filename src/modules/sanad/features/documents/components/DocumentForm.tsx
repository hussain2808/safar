import { cn } from '@/modules/sanad/lib/utils';
import { CATEGORIES } from '@/modules/sanad/lib/categories';
import { PhotoGallery } from '@/modules/sanad/features/documents/components/PhotoGallery';
import { AttachmentList } from '@/modules/sanad/features/documents/components/AttachmentList';
import type { DocumentRecord, DocumentCategory } from '@/modules/sanad/types';

export interface DocumentDraft {
  name: string;
  category: DocumentCategory;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
  photoIds: string[];
  fileIds: string[];
}

export function draftFromDocument(document: DocumentRecord | null): DocumentDraft {
  return {
    name: document?.name ?? '',
    category: document?.category ?? 'identity',
    documentNumber: document?.documentNumber ?? '',
    issuingAuthority: document?.issuingAuthority ?? '',
    issueDate: document?.issueDate ? new Date(document.issueDate).toISOString().slice(0, 10) : '',
    expiryDate: document?.expiryDate ? new Date(document.expiryDate).toISOString().slice(0, 10) : '',
    notes: document?.notes ?? '',
    photoIds: document?.photoIds ?? [],
    fileIds: document?.fileIds ?? [],
  };
}

interface DocumentFormProps {
  draft: DocumentDraft;
  onChange: (draft: DocumentDraft) => void;
}

const inputClass = 'w-full bg-cream rounded-button px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none border border-card-border focus:border-text-secondary transition-colors';
const labelClass = 'text-caption text-text-secondary mb-2 uppercase tracking-wide block';

export function DocumentForm({ draft, onChange }: DocumentFormProps) {
  function set<K extends keyof DocumentDraft>(key: K, value: DocumentDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Document Name</label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Passport"
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
                draft.category === id ? 'bg-indigo text-cream' : 'bg-icon-bg text-text-secondary',
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
          <label className={labelClass}>Document Number</label>
          <input type="text" value={draft.documentNumber} onChange={(e) => set('documentNumber', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Issuing Authority</label>
          <input type="text" value={draft.issuingAuthority} onChange={(e) => set('issuingAuthority', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Issue Date</label>
          <input type="date" value={draft.issueDate} onChange={(e) => set('issueDate', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Expiry Date</label>
          <input type="date" value={draft.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={inputClass} />
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
        <label className={labelClass}>Photos or Scans</label>
        <PhotoGallery photoIds={draft.photoIds} onChange={(photoIds) => set('photoIds', photoIds)} />
      </div>

      <div>
        <label className={labelClass}>Attachments</label>
        <AttachmentList fileIds={draft.fileIds} onChange={(fileIds) => set('fileIds', fileIds)} />
      </div>
    </div>
  );
}
