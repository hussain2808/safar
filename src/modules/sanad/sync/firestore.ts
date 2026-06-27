import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/sanad/db';
import type { DocumentRecord } from '@/modules/sanad/types';

function documentRef(uid: string, documentId: string) {
  return doc(fsdb, 'users', uid, 'sanadDocuments', documentId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const rest: Record<string, unknown> = { ...obj };
  delete rest.pendingSync;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

export async function pushDocument(uid: string, document: DocumentRecord) {
  await setDoc(documentRef(uid, document.id), toFirestoreDoc(document));
}

export async function deleteFirestoreDocument(uid: string, documentId: string) {
  await deleteDoc(documentRef(uid, documentId));
}

export async function syncOnLogin(uid: string) {
  const docsSnap = await getDocs(collection(fsdb, 'users', uid, 'sanadDocuments'));
  const documents: DocumentRecord[] = docsSnap.docs.map((d) => d.data() as DocumentRecord);
  if (documents.length) await db.documents.bulkPut(documents);

  await syncFilesOnLogin(uid);
}

async function syncFilesOnLogin(uid: string) {
  const filesSnap = await getDocs(collection(fsdb, 'users', uid, 'sanadFiles'));
  if (filesSnap.empty) return;
  const existingIds = new Set(await db.files.toCollection().primaryKeys() as string[]);
  await Promise.all(
    filesSnap.docs.map(async (d) => {
      const { id, url, thumbUrl, mimeType, fileName, createdAt } = d.data() as {
        id: string; url: string; thumbUrl?: string; mimeType: string; fileName: string; createdAt: number;
      };
      if (existingIds.has(id)) return;
      try {
        const [blob, thumbnail] = await Promise.all([
          fetch(url).then((r) => r.blob()),
          thumbUrl ? fetch(thumbUrl).then((r) => r.blob()) : Promise.resolve(undefined),
        ]);
        await db.files.put({ id, blob, thumbnail, mimeType, fileName, createdAt });
      } catch { /* Non-fatal — file will sync next login */ }
    }),
  );
}
