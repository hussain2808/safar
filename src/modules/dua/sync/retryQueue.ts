import { db } from '@/modules/dua/db';
import { pushDua, deleteFirestoreDua } from './firestore';

export async function retryPendingSync(uid: string): Promise<void> {
  const [duas, pendingDeletes] = await Promise.all([
    db.duas.filter((d) => d.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...duas.map((d) => pushDua(uid, d).then(() => db.duas.update(d.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        await deleteFirestoreDua(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) { console.error(e); }
    }),
  ]);
}
