import { nanoid } from 'nanoid';
import { db } from '@/modules/dua/db';
import type { Dua, Result } from '@/modules/dua/types';
import { auth } from '@/lib/firebase';
import { pushDua, deleteFirestoreDua } from '@/modules/dua/sync/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

export async function createDua(
  input: Omit<Dua, 'id' | 'favorite' | 'archived' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<Dua>> {
  try {
    const now = Date.now();
    const dua: Dua = { ...input, id: nanoid(), favorite: false, archived: false, createdAt: now, updatedAt: now, pendingSync: true };
    await db.duas.add(dua);
    const u = uid();
    if (u) pushDua(u, dua).then(() => db.duas.update(dua.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: dua };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateDua(
  id: string,
  patch: Partial<Omit<Dua, 'id' | 'createdAt'>>,
): Promise<Result<void>> {
  try {
    await db.duas.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const dua = await db.duas.get(id);
      if (dua) pushDua(u, dua).then(() => db.duas.update(id, { pendingSync: false })).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteDua(id: string): Promise<Result<void>> {
  try {
    await db.transaction('rw', [db.duas, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'dua', targetId: id, createdAt: Date.now() });
      await db.duas.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestoreDua(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'dua', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<Result<void>> {
  return updateDua(id, { favorite });
}

export async function markOpened(id: string): Promise<Result<void>> {
  return updateDua(id, { lastOpenedAt: Date.now() });
}

export async function toggleArchived(id: string, archived: boolean): Promise<Result<void>> {
  return updateDua(id, { archived });
}
