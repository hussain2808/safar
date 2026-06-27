import { nanoid } from 'nanoid';
import { db } from '@/modules/sanad/db';
import type { DocumentFile, Result } from '@/modules/sanad/types';
import { compressPhoto } from '@/modules/sanad/lib/compress';
import { auth, storage, fsdb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

function storageRef(userId: string, fileId: string) {
  return ref(storage, `users/${userId}/sanad-files/${fileId}`);
}

function thumbStorageRef(userId: string, fileId: string) {
  return ref(storage, `users/${userId}/sanad-files/${fileId}_thumb`);
}

function fileDocRef(userId: string, fileId: string) {
  return doc(fsdb, 'users', userId, 'sanadFiles', fileId);
}

export async function pushFile(userId: string, file: DocumentFile): Promise<void> {
  const snap = await uploadBytes(storageRef(userId, file.id), file.blob, { contentType: file.mimeType });
  const url = await getDownloadURL(snap.ref);

  let thumbUrl: string | undefined;
  if (file.thumbnail) {
    const thumbSnap = await uploadBytes(thumbStorageRef(userId, file.id), file.thumbnail, { contentType: file.mimeType });
    thumbUrl = await getDownloadURL(thumbSnap.ref);
  }

  await setDoc(fileDocRef(userId, file.id), {
    id: file.id,
    url,
    ...(thumbUrl ? { thumbUrl } : {}),
    mimeType: file.mimeType,
    fileName: file.fileName,
    createdAt: file.createdAt,
  });
}

export async function deleteFirestoreFile(userId: string, fileId: string): Promise<void> {
  await Promise.all([
    deleteObject(storageRef(userId, fileId)).catch(() => {}),
    deleteObject(thumbStorageRef(userId, fileId)).catch(() => {}),
    deleteDoc(fileDocRef(userId, fileId)),
  ]);
}

export async function saveFile(file: File): Promise<Result<DocumentFile>> {
  try {
    const isImage = file.type.startsWith('image/');
    const { blob, thumbnail } = isImage ? await compressPhoto(file) : { blob: file as Blob, thumbnail: undefined };
    const record: DocumentFile = {
      id: nanoid(),
      blob,
      thumbnail,
      mimeType: file.type,
      fileName: file.name,
      createdAt: Date.now(),
      pendingSync: true,
    };
    await db.files.add(record);
    const u = uid();
    if (u) pushFile(u, record).then(() => db.files.update(record.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: record };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteFile(id: string): Promise<Result<void>> {
  try {
    await db.transaction('rw', [db.files, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'file', targetId: id, createdAt: Date.now() });
      await db.files.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestoreFile(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'file', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
