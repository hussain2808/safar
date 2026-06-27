import { nanoid } from 'nanoid';
import { db } from '@/modules/sanad/db';
import type { DocumentRecord, Result } from '@/modules/sanad/types';
import { deleteFile } from '@/modules/sanad/db/files';

export async function createDocument(
  input: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<DocumentRecord>> {
  try {
    const now = Date.now();
    const document: DocumentRecord = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
    await db.documents.add(document);
    return { ok: true, data: document };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateDocument(
  id: string,
  patch: Partial<Omit<DocumentRecord, 'id' | 'createdAt'>>,
): Promise<Result<void>> {
  try {
    await db.documents.update(id, { ...patch, updatedAt: Date.now() });
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteDocument(id: string): Promise<Result<void>> {
  try {
    const document = await db.documents.get(id);

    await db.transaction('rw', [db.documents, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'document', targetId: id, createdAt: Date.now() });
      await db.documents.delete(id);
    });

    if (document) {
      [...document.photoIds, ...document.fileIds].forEach((fid) => deleteFile(fid).catch(console.error));
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
