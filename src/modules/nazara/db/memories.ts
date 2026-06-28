import { nanoid } from 'nanoid';
import { db } from '@/modules/nazara/db';
import type { MemoryRecord, Result } from '@/modules/nazara/types';
import { deletePhoto } from '@/modules/nazara/db/photos';
import { auth } from '@/lib/firebase';
import { pushMemory, deleteFirestoreMemory } from '@/modules/nazara/sync/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

export async function createMemory(
  input: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<MemoryRecord>> {
  try {
    const now = Date.now();
    const memory: MemoryRecord = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.memories.add(memory);
    const u = uid();
    if (u) pushMemory(u, memory).then(() => db.memories.update(memory.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: memory };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateMemory(
  id: string,
  patch: Partial<Omit<MemoryRecord, 'id' | 'createdAt'>>,
): Promise<Result<void>> {
  try {
    await db.memories.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const memory = await db.memories.get(id);
      if (memory) pushMemory(u, memory).then(() => db.memories.update(id, { pendingSync: false })).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteMemory(id: string): Promise<Result<void>> {
  try {
    const memory = await db.memories.get(id);

    await db.transaction('rw', [db.memories, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'memory', targetId: id, createdAt: Date.now() });
      await db.memories.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestoreMemory(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'memory', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    if (memory) {
      memory.photoIds.forEach((pid) => deletePhoto(pid).catch(console.error));
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function toggleFavorite(id: string): Promise<Result<void>> {
  const memory = await db.memories.get(id);
  if (!memory) return { ok: false, error: 'Memory not found' };
  return updateMemory(id, { isFavorite: !memory.isFavorite });
}
