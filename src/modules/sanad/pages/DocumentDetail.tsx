import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil, MoreHorizontal, Trash2, FileText, Landmark, Calendar, User, Copy, Check } from 'lucide-react';
import { DocumentForm, draftFromDocument, type DocumentDraft } from '@/modules/sanad/features/documents/components/DocumentForm';
import { StatusBadge } from '@/modules/sanad/features/documents/components/StatusBadge';
import { AttachmentList } from '@/modules/sanad/features/documents/components/AttachmentList';
import { PhotoGallery } from '@/modules/sanad/features/documents/components/PhotoGallery';
import { RenewalReminders } from '@/modules/sanad/features/documents/components/RenewalReminders';
import { useDocument } from '@/modules/sanad/features/documents/hooks/useDocument';
import { createDocument, updateDocument, deleteDocument } from '@/modules/sanad/db/documents';
import { getDocumentStatus } from '@/modules/sanad/lib/documentStatus';
import { categoryIcon, categoryColors, categoryLabel } from '@/modules/sanad/lib/categories';
import { cn, formatDate } from '@/modules/sanad/lib/utils';
import { usePeople } from '@/family/hooks/usePeople';
import { relationshipLabel } from '@/family/lib/relationships';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { document, isLoading, status } = useDocument(isNew ? undefined : id);
  const { people } = usePeople();

  const [mode, setMode] = useState<'view' | 'edit'>(isNew ? 'edit' : 'view');
  const [draft, setDraft] = useState<DocumentDraft>(() => draftFromDocument(null));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && document) setDraft(draftFromDocument(document));
  }, [isNew, document]);

  if (!isNew && isLoading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (!isNew && !isLoading && !document) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-body text-text-secondary">Document not found.</p>
      </div>
    );
  }

  async function handleSave() {
    if (!draft.name.trim()) return;
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      category: draft.category,
      personId: draft.personId,
      documentNumber: draft.documentNumber.trim() || undefined,
      issuingAuthority: draft.issuingAuthority.trim() || undefined,
      issueDate: draft.issueDate ? new Date(draft.issueDate).getTime() : undefined,
      expiryDate: draft.expiryDate ? new Date(draft.expiryDate).getTime() : undefined,
      notes: draft.notes.trim() || undefined,
      photoIds: draft.photoIds,
      fileIds: draft.fileIds,
    };

    if (isNew) {
      const result = await createDocument(payload);
      setSaving(false);
      if (result.ok) navigate(`/sanad/document/${result.data.id}`, { replace: true });
    } else if (id) {
      await updateDocument(id, payload);
      setSaving(false);
      setMode('view');
    }
  }

  async function handleDelete() {
    if (!id) return;
    await deleteDocument(id);
    navigate('/sanad');
  }

  function personName(personId: string): string {
    const person = people.find((p) => p.id === personId);
    if (!person) return '—';
    return person.relationship === 'self' ? relationshipLabel('self') : person.name;
  }

  if (mode === 'edit') {
    const editStatus = draft.expiryDate ? getDocumentStatus(new Date(draft.expiryDate).getTime()) : 'none';

    return (
      <div className="min-h-screen bg-cream">
        <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
          <button
            onClick={() => (isNew ? navigate(-1) : setMode('view'))}
            className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2 pr-2">
            <StatusBadge status={editStatus} />
            {!isNew && (
              <button onClick={() => setConfirmingDelete(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-accent-pink-fg active:bg-card-border transition-colors" aria-label="Delete document">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </header>

        <main className="px-4 pb-32">
          <DocumentForm draft={draft} onChange={setDraft} />
        </main>

        <div className="fixed bottom-8 inset-x-4">
          <button
            onClick={handleSave}
            disabled={saving || !draft.name.trim()}
            className="w-full bg-indigo text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Add Document' : 'Save Changes'}
          </button>
        </div>

        {confirmingDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6" onClick={() => setConfirmingDelete(false)}>
            <div className="bg-card-bg rounded-card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <p className="text-body text-text-primary mb-1">Delete this document?</p>
              <p className="text-caption text-text-secondary mb-4">This will remove its photos and attachments too. This can't be undone.</p>
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

  if (!document) return null;

  const Icon = categoryIcon(document.category);
  const colors = categoryColors(document.category);

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 pr-2">
          <button onClick={() => setMode('edit')} className="w-10 h-10 rounded-full bg-icon-bg flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Edit document">
            <Pencil size={16} strokeWidth={1.5} />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 bg-card-bg rounded-card shadow-card py-1 w-48 z-20">
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmingDelete(true); }}
                    className="w-full text-left px-4 py-2.5 text-caption-md text-accent-pink-fg flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete document
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 pb-12">
        <div className="flex gap-4 items-start mb-5">
          <div className={cn('w-16 h-16 rounded-card flex items-center justify-center flex-shrink-0', colors.bg, colors.fg)}>
            <Icon size={26} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="font-serif text-page-title text-text-primary leading-tight">{document.name}</h1>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption', colors.bg, colors.fg)}>
                <Icon size={11} strokeWidth={1.5} />
                {categoryLabel(document.category)}
              </span>
              <span className="text-caption text-text-secondary">• {personName(document.personId)}</span>
            </div>
          </div>
        </div>

        <div className="bg-icon-bg/60 rounded-card divide-y divide-card-border/60 mb-6">
          <div className="grid grid-cols-2 gap-x-4 p-4">
            <InfoField icon={FileText} label="Document Number" value={document.documentNumber} copyable />
            <InfoField icon={Landmark} label="Issuing Authority" value={document.issuingAuthority} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 p-4">
            <InfoField icon={Calendar} label="Issue Date" value={document.issueDate ? formatDate(document.issueDate) : undefined} />
            <InfoField
              icon={Calendar}
              label="Expiry Date"
              value={document.expiryDate ? formatDate(document.expiryDate) : undefined}
              valueClassName={status === 'expired' || status === 'expiring_soon' ? 'text-accent-pink-fg' : undefined}
            />
          </div>
          <div className="p-4">
            <InfoField icon={User} label="Belongs To" value={personName(document.personId)} />
          </div>
        </div>

        {document.fileIds.length > 0 && (
          <ViewSection title="Attachments">
            <AttachmentList fileIds={document.fileIds} onChange={(fileIds) => id && updateDocument(id, { fileIds })} readOnly />
          </ViewSection>
        )}

        <ViewSection title="Photos or Scans">
          <PhotoGallery photoIds={document.photoIds} onChange={(photoIds) => id && updateDocument(id, { photoIds })} allowRemove={false} />
        </ViewSection>

        {document.notes && (
          <ViewSection title="Notes">
            <div className="bg-icon-bg/60 rounded-card p-4">
              <p className="text-body text-text-primary whitespace-pre-wrap">{document.notes}</p>
              <p className="text-caption text-text-secondary mt-3">Added on {formatDate(document.createdAt)}</p>
            </div>
          </ViewSection>
        )}

        {document.expiryDate && <RenewalReminders expiryDate={document.expiryDate} />}
      </main>

      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6" onClick={() => setConfirmingDelete(false)}>
          <div className="bg-card-bg rounded-card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-body text-text-primary mb-1">Delete this document?</p>
            <p className="text-caption text-text-secondary mb-4">This will remove its photos and attachments too. This can't be undone.</p>
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

function ViewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-caption text-text-secondary uppercase tracking-wide mb-2">{title}</h2>
      {children}
    </div>
  );
}

function InfoField({
  icon: Icon, label, value, valueClassName, copyable,
}: { icon: typeof FileText; label: string; value?: string; valueClassName?: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} strokeWidth={1.5} className="text-text-secondary mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-caption text-text-secondary uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className={cn('text-caption-md text-text-primary mt-0.5 truncate', valueClassName)}>{value || '—'}</p>
          {copyable && value && (
            <button
              onClick={handleCopy}
              aria-label={`Copy ${label}`}
              className="mt-0.5 text-text-secondary active:text-text-primary flex-shrink-0"
            >
              {copied ? <Check size={13} className="text-accent-doneGreen-fg" /> : <Copy size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
