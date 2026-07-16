import { nanoid } from 'nanoid';
import { db } from '@/modules/done/db';
import type { HabitCompletion, Result } from '@/modules/done/types';
import { auth } from '@/lib/firebase';
import { pushCompletion, deleteFirestoreCompletion } from '@/modules/done/sync/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

/** Toggles completion for a habit on a given date. Returns the new done state. */
export async function toggleCompletion(habitId: string, date: string): Promise<Result<boolean>> {
  try {
    const existing = await db.completions.where({ habitId, date }).first();

    if (existing) {
      await db.transaction('rw', [db.completions, db.pendingDeletes], async () => {
        await db.pendingDeletes.add({ id: nanoid(), kind: 'completion', targetId: existing.id, createdAt: Date.now() });
        await db.completions.delete(existing.id);
      });
      const u = uid();
      if (u) {
        deleteFirestoreCompletion(u, existing.id)
          .then(async () => {
            const pd = await db.pendingDeletes.where({ kind: 'completion', targetId: existing.id }).first();
            if (pd) await db.pendingDeletes.delete(pd.id);
          })
          .catch(console.error);
      }
      return { ok: true, data: false };
    }

    const completion: HabitCompletion = { id: nanoid(), habitId, date, completedAt: Date.now(), pendingSync: true };
    await db.completions.add(completion);
    const u = uid();
    if (u) pushCompletion(u, completion).then(() => db.completions.update(completion.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
