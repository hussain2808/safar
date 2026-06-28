import { nanoid } from 'nanoid';
import { db } from '@/modules/nazara/db';
import type { MemoryPhoto, Result } from '@/modules/nazara/types';
import { compressPhoto } from '@/modules/nazara/lib/compress';
import { auth, storage, fsdb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

function storageRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/nazara-photos/${photoId}`);
}

function thumbStorageRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/nazara-photos/${photoId}_thumb`);
}

function photoDocRef(userId: string, photoId: string) {
  return doc(fsdb, 'users', userId, 'nazaraPhotos', photoId);
}

export async function pushPhoto(userId: string, photo: MemoryPhoto): Promise<void> {
  const snap = await uploadBytes(storageRef(userId, photo.id), photo.blob, { contentType: photo.mimeType });
  const url = await getDownloadURL(snap.ref);

  let thumbUrl: string | undefined;
  if (photo.thumbnail) {
    const thumbSnap = await uploadBytes(thumbStorageRef(userId, photo.id), photo.thumbnail, { contentType: photo.mimeType });
    thumbUrl = await getDownloadURL(thumbSnap.ref);
  }

  await setDoc(photoDocRef(userId, photo.id), {
    id: photo.id,
    url,
    ...(thumbUrl ? { thumbUrl } : {}),
    mimeType: photo.mimeType,
    fileName: photo.fileName,
    createdAt: photo.createdAt,
  });
}

export async function deleteFirestorePhoto(userId: string, photoId: string): Promise<void> {
  await Promise.all([
    deleteObject(storageRef(userId, photoId)).catch(() => {}),
    deleteObject(thumbStorageRef(userId, photoId)).catch(() => {}),
    deleteDoc(photoDocRef(userId, photoId)),
  ]);
}

export async function savePhoto(file: File): Promise<Result<MemoryPhoto>> {
  try {
    const { blob, thumbnail } = await compressPhoto(file);
    const record: MemoryPhoto = {
      id: nanoid(),
      blob,
      thumbnail,
      mimeType: 'image/jpeg',
      fileName: file.name,
      createdAt: Date.now(),
      pendingSync: true,
    };
    await db.photos.add(record);
    const u = uid();
    if (u) pushPhoto(u, record).then(() => db.photos.update(record.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: record };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deletePhoto(id: string): Promise<Result<void>> {
  try {
    await db.transaction('rw', [db.photos, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'photo', targetId: id, createdAt: Date.now() });
      await db.photos.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestorePhoto(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'photo', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
