import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { DocumentForm, draftFromDocument, type DocumentDraft } from '@/modules/sanad/features/documents/components/DocumentForm';
import { StatusBadge } from '@/modules/sanad/features/documents/components/StatusBadge';
import { useDocument } from '@/modules/sanad/features/documents/hooks/useDocument';
import { createDocument, updateDocument, deleteDocument } from '@/modules/sanad/db/documents';
import { getDocumentStatus } from '@/modules/sanad/lib/documentStatus';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { document, isLoading } = useDocument(isNew ? undefined : id);

  const [draft, setDraft] = useState<DocumentDraft>(() => draftFromDocument(null));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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
      navigate('/sanad');
    }
  }

  async function handleDelete() {
    if (!id) return;
    await deleteDocument(id);
    navigate('/sanad');
  }

  const status = draft.expiryDate ? getDocumentStatus(new Date(draft.expiryDate).getTime()) : 'none';

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2 pr-2">
          <StatusBadge status={status} />
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
