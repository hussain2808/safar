import { nanoid } from 'nanoid';
import { db } from '@/modules/sanad/db';
import type { DocumentRecord, Result } from '@/modules/sanad/types';
import { deleteFile } from '@/modules/sanad/db/files';
import { auth } from '@/lib/firebase';
import { pushDocument, deleteFirestoreDocument } from '@/modules/sanad/sync/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

export async function createDocument(
  input: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<DocumentRecord>> {
  try {
    const now = Date.now();
    const document: DocumentRecord = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.documents.add(document);
    const u = uid();
    if (u) pushDocument(u, document).then(() => db.documents.update(document.id, { pendingSync: false })).catch(console.error);
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
    await db.documents.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const document = await db.documents.get(id);
      if (document) pushDocument(u, document).then(() => db.documents.update(id, { pendingSync: false })).catch(console.error);
    }
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

    const u = uid();
    if (u) {
      deleteFirestoreDocument(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'document', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    if (document) {
      [...document.photoIds, ...document.fileIds].forEach((fid) => deleteFile(fid).catch(console.error));
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
