import { useCallback, useRef, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { cn } from '@/modules/sanad/lib/utils';
import { CATEGORIES } from '@/modules/sanad/lib/categories';
import { PhotoGallery } from '@/modules/sanad/features/documents/components/PhotoGallery';
import { AttachmentList } from '@/modules/sanad/features/documents/components/AttachmentList';
import { usePeople } from '@/family/hooks/usePeople';
import { PersonSheet } from '@/family/components/PersonSheet';
import { SELF_PERSON_ID } from '@/family/db';
import { relationshipLabel } from '@/family/lib/relationships';
import type { ExtractedMeta } from '@/modules/sanad/lib/extractDocumentMeta';
import type { DocumentRecord, DocumentCategory } from '@/modules/sanad/types';

export interface DocumentDraft {
  name: string;
  category: DocumentCategory;
  personId: string;
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
    personId: document?.personId ?? SELF_PERSON_ID,
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

const labelClass = 'text-caption text-text-secondary mb-2 uppercase tracking-wide block';

function FieldWrapper({ extracting, children }: { extracting: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {extracting && (
        <div className="absolute inset-0 rounded-button overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DocumentForm({ draft, onChange }: DocumentFormProps) {
  const { people } = usePeople();
  const [addingPerson, setAddingPerson] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedCount, setExtractedCount] = useState(0);

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function set<K extends keyof DocumentDraft>(key: K, value: DocumentDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  const applyMeta = useCallback((meta: ExtractedMeta) => {
    const cur = draftRef.current;
    const cb = onChangeRef.current;
    let filled = 0;
    const next = { ...cur };
    if (meta.name && !next.name) { next.name = meta.name; filled++; }
    if (meta.documentNumber && !next.documentNumber) { next.documentNumber = meta.documentNumber; filled++; }
    if (meta.issuingAuthority && !next.issuingAuthority) { next.issuingAuthority = meta.issuingAuthority; filled++; }
    if (meta.issueDate && !next.issueDate) { next.issueDate = meta.issueDate; filled++; }
    if (meta.expiryDate && !next.expiryDate) { next.expiryDate = meta.expiryDate; filled++; }
    if (filled > 0) {
      cb(next);
      setExtractedCount(filled);
      setTimeout(() => setExtractedCount(0), 4000);
    }
  }, []);

  const inputClass = cn(
    'w-full bg-cream rounded-button px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none border border-card-border focus:border-text-secondary transition-colors',
    extracting && 'opacity-50',
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="space-y-5">
        {/* Extraction status banner */}
        {(extracting || extractedCount > 0) && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
            extracting
              ? 'bg-accent-blue-bg text-accent-blue-fg'
              : 'bg-accent-green-bg text-accent-green-fg',
          )}>
            <Sparkles size={14} className={extracting ? 'animate-spin' : ''} />
            {extracting
              ? 'Reading document… fields will fill automatically'
              : `Filled ${extractedCount} field${extractedCount !== 1 ? 's' : ''} from document`}
          </div>
        )}

        <div>
          <label className={labelClass}>Belongs To</label>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => set('personId', person.id)}
                className={cn(
                  'px-3 py-2 rounded-icon text-caption transition-colors',
                  draft.personId === person.id ? 'bg-indigo text-cream' : 'bg-icon-bg text-text-secondary',
                )}
              >
                {person.relationship === 'self' ? relationshipLabel('self') : person.name}
              </button>
            ))}
            <button
              onClick={() => setAddingPerson(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-icon text-caption bg-icon-bg text-text-secondary"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Document Name</label>
          <FieldWrapper extracting={extracting}>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Passport"
              className={inputClass}
            />
          </FieldWrapper>
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
            <FieldWrapper extracting={extracting}>
              <input type="text" value={draft.documentNumber} onChange={(e) => set('documentNumber', e.target.value)} className={inputClass} />
            </FieldWrapper>
          </div>
          <div>
            <label className={labelClass}>Issuing Authority</label>
            <FieldWrapper extracting={extracting}>
              <input type="text" value={draft.issuingAuthority} onChange={(e) => set('issuingAuthority', e.target.value)} className={inputClass} />
            </FieldWrapper>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Issue Date</label>
            <FieldWrapper extracting={extracting}>
              <input type="date" value={draft.issueDate} onChange={(e) => set('issueDate', e.target.value)} className={inputClass} />
            </FieldWrapper>
          </div>
          <div>
            <label className={labelClass}>Expiry Date</label>
            <FieldWrapper extracting={extracting}>
              <input type="date" value={draft.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={inputClass} />
            </FieldWrapper>
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
          <AttachmentList
            fileIds={draft.fileIds}
            onChange={(fileIds) => set('fileIds', fileIds)}
            onExtracting={setExtracting}
            onMeta={applyMeta}
          />
        </div>

        {addingPerson && (
          <PersonSheet
            person={null}
            onClose={() => setAddingPerson(false)}
            onSaved={(person) => set('personId', person.id)}
          />
        )}
      </div>
    </>
  );
}
