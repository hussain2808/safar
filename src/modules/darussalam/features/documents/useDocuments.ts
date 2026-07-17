import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { DocumentRecord, DocumentCategory } from '@/modules/darussalam/types';

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function useDocuments(roomId?: string | null) {
  const result = useLiveQuery(async () => {
    const all = await db.documents.toArray();
    const filtered = roomId ? all.filter((d) => d.roomId === roomId) : all;
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [roomId]);

  return result ?? [];
}

export async function addDocument(input: { name: string; category: DocumentCategory; roomId?: string | null; file?: File }) {
  const now = Date.now();
  const documentId = makeId('doc');
  let fileId: string | undefined;

  if (input.file) {
    fileId = makeId('docfile');
    await db.documentFiles.add({
      id: fileId,
      documentId,
      blob: input.file,
      mimeType: input.file.type,
      fileName: input.file.name,
      createdAt: now,
    });
  }

  const doc: DocumentRecord = {
    id: documentId,
    name: input.name.trim(),
    category: input.category,
    roomId: input.roomId ?? null,
    fileId,
    createdAt: now,
    updatedAt: now,
  };
  await db.documents.add(doc);
  return doc;
}

export async function deleteDocument(id: string) {
  const doc = await db.documents.get(id);
  if (doc?.fileId) await db.documentFiles.delete(doc.fileId);
  await db.documents.delete(id);
}

export function useDocumentFile(fileId: string | undefined) {
  const result = useLiveQuery(async () => (fileId ? (await db.documentFiles.get(fileId)) ?? null : null), [fileId]);
  return result ?? null;
}
