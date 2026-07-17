import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileStack, Trash2, Upload, ExternalLink } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { useDocuments, addDocument, deleteDocument, useDocumentFile } from '@/modules/darussalam/features/documents/useDocuments';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import type { DocumentCategory, DocumentRecord } from '@/modules/darussalam/types';

const categories: DocumentCategory[] = ['floorPlan', 'elevation', 'moodBoard', 'sketch', 'municipality', 'other'];
const categoryLabels: Record<DocumentCategory, string> = {
  floorPlan: 'Floor Plan',
  elevation: 'Elevation',
  moodBoard: 'Mood Board',
  sketch: 'Sketch',
  municipality: 'Municipality',
  other: 'Other',
};

function DocumentRow({ doc, roomName, onDelete }: { doc: DocumentRecord; roomName?: string; onDelete: () => void }) {
  const file = useDocumentFile(doc.fileId);

  function handleOpen() {
    if (!file) return;
    const url = URL.createObjectURL(file.blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5">
      <FileStack size={17} className="text-darussalam-green flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-text-primary line-clamp-1">{doc.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] bg-darussalam-tile text-text-secondary px-2 py-0.5 rounded-full">{categoryLabels[doc.category]}</span>
          {roomName && <span className="text-[10px] text-text-muted">{roomName}</span>}
        </div>
      </div>
      {file && (
        <button onClick={handleOpen} className="text-darussalam-green flex-shrink-0"><ExternalLink size={16} /></button>
      )}
      <button onClick={onDelete} className="text-text-muted flex-shrink-0"><Trash2 size={15} /></button>
    </div>
  );
}

export default function DarussalamDocuments() {
  const [params] = useSearchParams();
  const roomId = params.get('room');
  const documents = useDocuments(roomId);
  const { rooms } = useRooms();
  const roomName = (id?: string | null) => rooms.find((r) => r.id === id)?.name;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('floorPlan');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleAdd() {
    if (!name.trim()) return;
    await addDocument({ name, category, roomId, file: pendingFile ?? undefined });
    setName(''); setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Documents</h1>
        <p className="text-sm text-text-secondary mt-1">
          {roomId ? `Documents for ${roomName(roomId) ?? 'this room'}` : 'Floor plans, sketches, mood boards and more.'}
        </p>
      </div>

      <div className="px-5 mt-5 space-y-2.5">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} roomName={!roomId ? roomName(doc.roomId) : undefined} onDelete={() => deleteDocument(doc.id)} />
        ))}
        {documents.length === 0 && <p className="text-sm text-text-muted text-center py-4">No documents saved yet.</p>}

        <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Add a document</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs ${category === c ? 'bg-accent-green-bg text-darussalam-green font-medium' : 'bg-darussalam-tile text-text-secondary'}`}
              >
                {categoryLabels[c]}
              </button>
            ))}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-darussalam-tile rounded-full py-2 text-sm text-text-primary"
          >
            <Upload size={15} /> {pendingFile ? pendingFile.name : 'Attach a file (optional)'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          />
          <button onClick={handleAdd} className="w-full bg-darussalam-green text-white rounded-full py-2.5 text-sm font-medium">
            Save Document
          </button>
        </div>
      </div>
    </div>
  );
}
