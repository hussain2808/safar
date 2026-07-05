import { nanoid } from 'nanoid';
import { db } from '@/modules/amaanat/db';
import type { Document, Result } from '@/modules/amaanat/types';
import { auth, storage, fsdb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

function storageRef(userId: string, docId: string) {
  return ref(storage, `users/${userId}/amaanat-documents/${docId}`);
}

function docRef(userId: string, docId: string) {
  return doc(fsdb, 'users', userId, 'amaanatDocuments', docId);
}

export async function pushDocument(userId: string, document: Document): Promise<void> {
  const snap = await uploadBytes(storageRef(userId, document.id), document.blob, { contentType: document.mimeType });
  const url = await getDownloadURL(snap.ref);
  await setDoc(docRef(userId, document.id), {
    id: document.id, url, mimeType: document.mimeType, fileName: document.fileName, createdAt: document.createdAt,
  });
}

export async function saveDocument(file: File): Promise<Result<Document>> {
  try {
    const document: Document = {
      id: nanoid(),
      blob: file,
      mimeType: file.type,
      fileName: file.name,
      createdAt: Date.now(),
      pendingSync: true,
    };
    await db.documents.add(document);

    const u = uid();
    if (u) pushDocument(u, document).then(() => db.documents.update(document.id, { pendingSync: false })).catch(console.error);

    return { ok: true, data: document };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteFirestoreDocument(userId: string, docId: string): Promise<void> {
  await Promise.all([
    deleteObject(storageRef(userId, docId)).catch(() => {}),
    deleteDoc(docRef(userId, docId)),
  ]);
}

export async function deleteDocument(id: string): Promise<Result<void>> {
  try {
    const u = uid();
    if (u) await db.pendingDeletes.put({ id: nanoid(), kind: 'document', targetId: id, createdAt: Date.now() });
    await db.documents.delete(id);
    if (u) {
      deleteFirestoreDocument(u, id)
        .then(() => db.pendingDeletes.where({ kind: 'document', targetId: id }).delete())
        .catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
