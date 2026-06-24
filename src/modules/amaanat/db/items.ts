import { nanoid } from 'nanoid';
import { db } from '@/modules/amaanat/db';
import type { Item, Result } from '@/modules/amaanat/types';
import { auth } from '@/lib/firebase';
import { pushItem, deleteFirestoreItem } from '@/modules/amaanat/sync/firestore';
import { deletePhoto } from '@/modules/amaanat/db/photos';
import { deleteDocument } from '@/modules/amaanat/db/documents';

function uid() { return auth.currentUser?.uid ?? null; }

export async function createItem(
  input: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<Item>> {
  try {
    const now = Date.now();
    const item: Item = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.items.add(item);

    const u = uid();
    if (u) pushItem(u, item).then(() => db.items.update(item.id, { pendingSync: false })).catch(console.error);

    return { ok: true, data: item };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateItem(id: string, patch: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Result<void>> {
  try {
    const updatedAt = Date.now();
    await db.items.update(id, { ...patch, updatedAt, pendingSync: true });

    const u = uid();
    if (u) {
      const item = await db.items.get(id);
      if (item) pushItem(u, item).then(() => db.items.update(id, { pendingSync: false })).catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteItem(id: string): Promise<Result<void>> {
  try {
    const item = await db.items.get(id);

    await db.transaction('rw', [db.items, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'item', targetId: id, createdAt: Date.now() });
      await db.items.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestoreItem(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'item', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    if (item) {
      item.photoIds.forEach((pid) => deletePhoto(pid).catch(console.error));
      item.documentIds.forEach((did) => deleteDocument(did).catch(console.error));
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
