import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/nazara/db';
import type { MemoryRecord } from '@/modules/nazara/types';

function memoryRef(uid: string, memoryId: string) {
  return doc(fsdb, 'users', uid, 'nazaraMemories', memoryId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const rest: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  delete rest.pendingSync;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

export async function pushMemory(uid: string, memory: MemoryRecord) {
  await setDoc(memoryRef(uid, memory.id), toFirestoreDoc(memory));
}

export async function deleteFirestoreMemory(uid: string, memoryId: string) {
  await deleteDoc(memoryRef(uid, memoryId));
}

export async function syncOnLogin(uid: string) {
  const [memoriesSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'nazaraMemories')),
    db.pendingDeletes.toArray(),
  ]);
  const deletedMemoryIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'memory').map((pd) => pd.targetId));
  const memories: MemoryRecord[] = memoriesSnap.docs
    .filter((d) => !deletedMemoryIds.has(d.id))
    .map((d) => ({ ...(d.data() as MemoryRecord), pendingSync: false }));
  if (memories.length) await db.memories.bulkPut(memories);

  await syncPhotosOnLogin(uid, pendingDeletes);
}

async function syncPhotosOnLogin(uid: string, pendingDeletes: { kind: string; targetId: string }[]) {
  const deletedPhotoIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'photo').map((pd) => pd.targetId));
  const photosSnap = await getDocs(collection(fsdb, 'users', uid, 'nazaraPhotos'));
  if (photosSnap.empty) return;
  const existingIds = new Set(await db.photos.toCollection().primaryKeys() as string[]);
  await Promise.all(
    photosSnap.docs.filter((d) => !deletedPhotoIds.has(d.id)).map(async (d) => {
      const { id, url, thumbUrl, mimeType, fileName, createdAt } = d.data() as {
        id: string; url: string; thumbUrl?: string; mimeType: string; fileName: string; createdAt: number;
      };
      if (existingIds.has(id)) {
        await db.photos.update(id, { pendingSync: false });
        return;
      }
      try {
        const [blob, thumbnail] = await Promise.all([
          fetch(url).then((r) => r.blob()),
          thumbUrl ? fetch(thumbUrl).then((r) => r.blob()) : Promise.resolve(undefined),
        ]);
        await db.photos.put({ id, blob, thumbnail, mimeType, fileName, createdAt, pendingSync: false });
      } catch { /* Non-fatal — photo will sync next login */ }
    }),
  );
}
