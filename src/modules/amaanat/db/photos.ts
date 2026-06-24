import { nanoid } from 'nanoid';
import { db } from '@/modules/amaanat/db';
import type { Photo, Result } from '@/modules/amaanat/types';
import { compressPhoto } from '@/modules/amaanat/lib/compress';
import { auth, storage, fsdb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

function storageRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/amaanat-photos/${photoId}`);
}

function thumbRef(userId: string, photoId: string) {
  return ref(storage, `users/${userId}/amaanat-photos/${photoId}_thumb`);
}

function photoDocRef(userId: string, photoId: string) {
  return doc(fsdb, 'users', userId, 'amaanatPhotos', photoId);
}

export async function savePhoto(file: File): Promise<Result<Photo>> {
  try {
    const { blob, thumbnail } = await compressPhoto(file);
    const photo: Photo = { id: nanoid(), blob, thumbnail, createdAt: Date.now() };
    await db.photos.add(photo);

    const u = uid();
    if (u) {
      (async () => {
        const [fullSnap, thumbSnap] = await Promise.all([
          uploadBytes(storageRef(u, photo.id), blob, { contentType: 'image/jpeg' }),
          uploadBytes(thumbRef(u, photo.id), thumbnail, { contentType: 'image/jpeg' }),
        ]);
        const [url, thumbUrl] = await Promise.all([
          getDownloadURL(fullSnap.ref),
          getDownloadURL(thumbSnap.ref),
        ]);
        await setDoc(photoDocRef(u, photo.id), {
          id: photo.id, url, thumbUrl, createdAt: photo.createdAt,
        });
      })().catch(console.error);
    }

    return { ok: true, data: photo };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deletePhoto(id: string): Promise<Result<void>> {
  try {
    await db.photos.delete(id);

    const u = uid();
    if (u) {
      Promise.all([
        deleteObject(storageRef(u, id)).catch(() => {}),
        deleteObject(thumbRef(u, id)).catch(() => {}),
        deleteDoc(photoDocRef(u, id)),
      ]).catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
