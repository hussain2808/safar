import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/amaanat/db';
import type { Item, Photo, Document } from '@/modules/amaanat/types';

function itemRef(uid: string, itemId: string) {
  return doc(fsdb, 'users', uid, 'amaanatItems', itemId);
}

export async function pushItem(uid: string, item: Item) {
  await setDoc(itemRef(uid, item.id), item);
}

export async function deleteFirestoreItem(uid: string, itemId: string) {
  await deleteDoc(itemRef(uid, itemId));
}

export async function syncOnLogin(uid: string) {
  const itemsSnap = await getDocs(collection(fsdb, 'users', uid, 'amaanatItems'));
  const items: Item[] = itemsSnap.docs.map((d) => d.data() as Item);
  if (items.length) await db.items.bulkPut(items);

  await syncPhotosOnLogin(uid);
  await syncDocumentsOnLogin(uid);
}

async function syncPhotosOnLogin(uid: string) {
  const photosSnap = await getDocs(collection(fsdb, 'users', uid, 'amaanatPhotos'));
  if (photosSnap.empty) return;

  const existingIds = new Set(await db.photos.toCollection().primaryKeys() as string[]);

  await Promise.all(
    photosSnap.docs.map(async (d) => {
      const { id, url, thumbUrl, createdAt } = d.data() as {
        id: string; url: string; thumbUrl: string; createdAt: number;
      };
      if (existingIds.has(id)) return;

      try {
        const [blob, thumbnail] = await Promise.all([
          fetch(url).then((r) => r.blob()),
          fetch(thumbUrl).then((r) => r.blob()),
        ]);
        const photo: Photo = { id, blob, thumbnail, createdAt };
        await db.photos.put(photo);
      } catch {
        // Non-fatal — photo will sync next login
      }
    }),
  );
}

async function syncDocumentsOnLogin(uid: string) {
  const docsSnap = await getDocs(collection(fsdb, 'users', uid, 'amaanatDocuments'));
  if (docsSnap.empty) return;

  const existingIds = new Set(await db.documents.toCollection().primaryKeys() as string[]);

  await Promise.all(
    docsSnap.docs.map(async (d) => {
      const { id, url, mimeType, fileName, createdAt } = d.data() as {
        id: string; url: string; mimeType: string; fileName: string; createdAt: number;
      };
      if (existingIds.has(id)) return;

      try {
        const blob = await fetch(url).then((r) => r.blob());
        const document: Document = { id, blob, mimeType, fileName, createdAt };
        await db.documents.put(document);
      } catch {
        // Non-fatal — document will sync next login
      }
    }),
  );
}
