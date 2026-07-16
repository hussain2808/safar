import { db } from '@/modules/done/db';
import {
  pushHabit, deleteFirestoreHabit,
  pushCompletion, deleteFirestoreCompletion,
} from './firestore';

export async function retryPendingSync(uid: string): Promise<void> {
  const [habits, completions, pendingDeletes] = await Promise.all([
    db.habits.filter((h) => h.pendingSync !== false).toArray(),
    db.completions.filter((c) => c.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...habits.map((h) => pushHabit(uid, h).then(() => db.habits.update(h.id, { pendingSync: false })).catch(console.error)),
    ...completions.map((c) => pushCompletion(uid, c).then(() => db.completions.update(c.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'habit') await deleteFirestoreHabit(uid, pd.targetId);
        else await deleteFirestoreCompletion(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) { console.error(e); }
    }),
  ]);
}
