import { nanoid } from 'nanoid';
import { db } from '@/modules/done/db';
import type { HabitRecord, Result } from '@/modules/done/types';
import { auth } from '@/lib/firebase';
import { pushHabit, deleteFirestoreHabit, deleteFirestoreCompletionsForHabit } from '@/modules/done/sync/firestore';

function uid() {
  return auth.currentUser?.uid ?? null;
}

export async function createHabit(
  input: Omit<HabitRecord, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<HabitRecord>> {
  try {
    const now = Date.now();
    const habit: HabitRecord = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.habits.add(habit);
    const u = uid();
    if (u) pushHabit(u, habit).then(() => db.habits.update(habit.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: habit };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateHabit(
  id: string,
  patch: Partial<Omit<HabitRecord, 'id' | 'createdAt'>>,
): Promise<Result<void>> {
  try {
    await db.habits.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const habit = await db.habits.get(id);
      if (habit) pushHabit(u, habit).then(() => db.habits.update(id, { pendingSync: false })).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function setArchived(id: string, archived: boolean): Promise<Result<void>> {
  return updateHabit(id, { archived });
}

export async function deleteHabit(id: string): Promise<Result<void>> {
  try {
    const completions = await db.completions.where({ habitId: id }).toArray();

    await db.transaction('rw', [db.habits, db.completions, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'habit', targetId: id, createdAt: Date.now() });
      await db.habits.delete(id);
      await db.completions.where({ habitId: id }).delete();
    });

    const u = uid();
    if (u) {
      deleteFirestoreHabit(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'habit', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
      if (completions.length) deleteFirestoreCompletionsForHabit(u, completions.map((c) => c.id)).catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
