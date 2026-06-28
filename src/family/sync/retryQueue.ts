import { db } from '@/family/db';
import { pushPerson, deleteFirestorePerson } from './firestore';

export async function retryPendingSync(uid: string): Promise<void> {
  const [people, pendingDeletes] = await Promise.all([
    db.people.filter((p) => p.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...people.map((p) => pushPerson(uid, p).then(() => db.people.update(p.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        await deleteFirestorePerson(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) { console.error(e); }
    }),
  ]);
}
