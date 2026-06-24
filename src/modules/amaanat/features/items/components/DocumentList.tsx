import { useEffect, useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { db } from '@/modules/amaanat/db';
import { saveDocument, deleteDocument } from '@/modules/amaanat/db/documents';
import type { Document } from '@/modules/amaanat/types';

interface DocumentListProps {
  documentIds: string[];
  onChange: (documentIds: string[]) => void;
}

export function DocumentList({ documentIds, onChange }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(documentIds.map((id) => db.documents.get(id)));
      setDocs(loaded.filter(Boolean) as Document[]);
    })();
  }, [documentIds]);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      const result = await saveDocument(file);
      if (result.ok) onChange([...documentIds, result.data.id]);
    }
  }

  async function handleRemove(id: string) {
    onChange(documentIds.filter((d) => d !== id));
    deleteDocument(id).catch(console.error);
  }

  function openDoc(doc: Document) {
    const url = URL.createObjectURL(doc.blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 bg-icon-bg rounded-icon px-3 py-2.5">
          <FileText size={16} className="text-text-secondary flex-shrink-0" />
          <button onClick={() => openDoc(doc)} className="flex-1 text-left text-caption-md text-text-primary truncate">
            {doc.fileName}
          </button>
          <button onClick={() => handleRemove(doc.id)} className="text-text-secondary flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
      <label className="flex items-center justify-center gap-2 bg-icon-bg rounded-icon px-3 py-2.5 text-caption-md text-text-secondary cursor-pointer">
        <Plus size={14} />
        Add invoice / receipt
        <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleAdd} />
      </label>
    </div>
  );
}
