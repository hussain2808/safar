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

export async function saveDocument(file: File): Promise<Result<Document>> {
  try {
    const document: Document = {
      id: nanoid(),
      blob: file,
      mimeType: file.type,
      fileName: file.name,
      createdAt: Date.now(),
    };
    await db.documents.add(document);

    const u = uid();
    if (u) {
      uploadBytes(storageRef(u, document.id), file, { contentType: file.type })
        .then((snap) => getDownloadURL(snap.ref))
        .then((url) => setDoc(docRef(u, document.id), {
          id: document.id, url, mimeType: document.mimeType, fileName: document.fileName, createdAt: document.createdAt,
        }))
        .catch(console.error);
    }

    return { ok: true, data: document };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteDocument(id: string): Promise<Result<void>> {
  try {
    await db.documents.delete(id);

    const u = uid();
    if (u) {
      Promise.all([
        deleteObject(storageRef(u, id)).catch(() => {}),
        deleteDoc(docRef(u, id)),
      ]).catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
