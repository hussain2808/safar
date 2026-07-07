import { useEffect, useState } from 'react';
import { FileText, Plus, X, Download, ExternalLink } from 'lucide-react';
import { db } from '@/modules/sanad/db';
import { saveFile, deleteFile } from '@/modules/sanad/db/files';
import { downloadBlob } from '@/modules/sanad/lib/download';
import { formatFileSize } from '@/modules/sanad/lib/utils';
import { extractFromPdf, type ExtractedMeta } from '@/modules/sanad/lib/extractDocumentMeta';
import type { DocumentFile } from '@/modules/sanad/types';

interface AttachmentListProps {
  fileIds: string[];
  onChange: (fileIds: string[]) => void;
  readOnly?: boolean;
  onExtracting?: (extracting: boolean) => void;
  onMeta?: (meta: ExtractedMeta) => void;
}

function fileTypeLabel(file: DocumentFile): string {
  if (file.mimeType === 'application/pdf') return 'PDF';
  const ext = file.fileName.split('.').pop();
  return ext ? ext.toUpperCase() : (file.mimeType.split('/')[1]?.toUpperCase() ?? 'FILE');
}

export function AttachmentList({ fileIds, onChange, readOnly = false, onExtracting, onMeta }: AttachmentListProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(fileIds.map((id) => db.files.get(id)));
      setFiles(loaded.filter(Boolean) as DocumentFile[]);
    })();
  }, [fileIds]);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';

    let newIds = [...fileIds];
    const pdfs = picked.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

    // Start extraction early (in parallel with saving)
    let extractionPromise: Promise<void> | null = null;
    if (pdfs.length > 0 && onMeta) {
      onExtracting?.(true);
      extractionPromise = extractFromPdf(pdfs[0])
        .then((meta) => { onMeta(meta); })
        .catch(console.error)
        .finally(() => onExtracting?.(false));
    }

    for (const file of picked) {
      const result = await saveFile(file);
      if (result.ok) newIds = [...newIds, result.data.id];
    }
    onChange(newIds);

    await extractionPromise;
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
          <FileText size={18} className={readOnly ? 'text-accent-pink-fg flex-shrink-0' : 'text-text-secondary flex-shrink-0'} />
          <button onClick={() => openFile(file)} className="flex-1 text-left min-w-0">
            <p className="text-caption-md text-text-primary truncate">{file.fileName}</p>
            {readOnly && (
              <p className="text-caption text-text-secondary mt-0.5">
                {fileTypeLabel(file)} • {formatFileSize(file.blob.size)}
              </p>
            )}
          </button>
          <button onClick={() => downloadBlob(file.blob, file.fileName)} className="text-text-secondary flex-shrink-0" aria-label="Download attachment">
            <Download size={14} />
          </button>
          {readOnly ? (
            <button onClick={() => openFile(file)} className="text-text-secondary flex-shrink-0" aria-label="Open attachment">
              <ExternalLink size={14} />
            </button>
          ) : (
            <button onClick={() => handleRemove(file.id)} className="text-text-secondary flex-shrink-0" aria-label="Remove attachment">
              <X size={14} />
            </button>
          )}
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
