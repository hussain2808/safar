import { nanoid } from 'nanoid';
import { db } from '@/modules/sanad/db';
import type { DocumentFile, Result } from '@/modules/sanad/types';
import { compressPhoto } from '@/modules/sanad/lib/compress';

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
    };
    await db.files.add(record);
    return { ok: true, data: record };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteFile(id: string): Promise<Result<void>> {
  try {
    await db.files.delete(id);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
