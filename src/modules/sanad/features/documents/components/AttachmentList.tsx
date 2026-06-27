import { useEffect, useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { db } from '@/modules/sanad/db';
import { saveFile, deleteFile } from '@/modules/sanad/db/files';
import type { DocumentFile } from '@/modules/sanad/types';

interface AttachmentListProps {
  fileIds: string[];
  onChange: (fileIds: string[]) => void;
}

export function AttachmentList({ fileIds, onChange }: AttachmentListProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(fileIds.map((id) => db.files.get(id)));
      setFiles(loaded.filter(Boolean) as DocumentFile[]);
    })();
  }, [fileIds]);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      const result = await saveFile(file);
      if (result.ok) onChange([...fileIds, result.data.id]);
    }
  }

  async function handleRemove(id: string) {
    onChange(fileIds.filter((f) => f !== id));
    deleteFile(id).catch(console.error);
  }

  function openFile(file: DocumentFile) {
    const url = URL.createObjectURL(file.blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 bg-icon-bg rounded-icon px-3 py-2.5">
          <FileText size={16} className="text-text-secondary flex-shrink-0" />
          <button onClick={() => openFile(file)} className="flex-1 text-left text-caption-md text-text-primary truncate">
            {file.fileName}
          </button>
          <button onClick={() => handleRemove(file.id)} className="text-text-secondary flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
      <label className="flex items-center justify-center gap-2 bg-icon-bg rounded-icon px-3 py-2.5 text-caption-md text-text-secondary cursor-pointer">
        <Plus size={14} />
        Add attachment
        <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleAdd} />
      </label>
    </div>
  );
}
