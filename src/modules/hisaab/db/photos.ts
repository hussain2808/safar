import { nanoid } from 'nanoid';
import { db } from '@/modules/hisaab/db';
import type { Photo, Result } from '@/modules/hisaab/types';
import { compressPhoto } from '@/modules/hisaab/lib/compress';
import { auth, storage, fsdb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

function storageRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/photos/${photoId}`);
}

function thumbRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/photos/${photoId}_thumb`);
}

function photoDocRef(userId: string, photoId: string) {
  return doc(fsdb, 'users', userId, 'photos', photoId);
}

export async function pushPhoto(userId: string, photo: Photo): Promise<void> {
  const [fullSnap, thumbSnap] = await Promise.all([
    uploadBytes(storageRef(userId, photo.id), photo.blob, { contentType: 'image/jpeg' }),
    uploadBytes(thumbRef(userId, photo.id), photo.thumbnail, { contentType: 'image/jpeg' }),
  ]);
  const [url, thumbUrl] = await Promise.all([
    getDownloadURL(fullSnap.ref),
    getDownloadURL(thumbSnap.ref),
  ]);
  await setDoc(photoDocRef(userId, photo.id), {
    id: photo.id, url, thumbUrl, createdAt: photo.createdAt,
  });
}

export async function savePhoto(file: File): Promise<Result<Photo>> {
  try {
    const { blob, thumbnail } = await compressPhoto(file);
    const photo: Photo = { id: nanoid(), blob, thumbnail, createdAt: Date.now(), pendingSync: true };
    await db.photos.add(photo);

    const u = uid();
    if (u) pushPhoto(u, photo).then(() => db.photos.update(photo.id, { pendingSync: false })).catch(console.error);

    return { ok: true, data: photo };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteFirestorePhoto(userId: string, photoId: string): Promise<void> {
  await Promise.all([
    deleteObject(storageRef(userId, photoId)).catch(() => {}),
    deleteObject(thumbRef(userId, photoId)).catch(() => {}),
    deleteDoc(photoDocRef(userId, photoId)),
  ]);
}

export async function deletePhoto(id: string): Promise<Result<void>> {
  try {
    const u = uid();
    if (u) await db.pendingDeletes.put({ id: nanoid(), kind: 'photo', targetId: id, createdAt: Date.now() });
    await db.photos.delete(id);
    if (u) {
      deleteFirestorePhoto(u, id)
        .then(() => db.pendingDeletes.where({ kind: 'photo', targetId: id }).delete())
        .catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
