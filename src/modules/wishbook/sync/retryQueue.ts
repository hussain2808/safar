import { db } from '@/modules/wishbook/db';
import { pushWish, deleteFirestoreWish } from './firestore';

export async function retryPendingSync(uid: string): Promise<void> {
  const [wishes, pendingDeletes] = await Promise.all([
    db.wishes.filter((w) => w.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...wishes.map((w) =>
      pushWish(uid, w)
        .then(() => db.wishes.update(w.id, { pendingSync: false }))
        .catch(console.error),
    ),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'wish') await deleteFirestoreWish(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) {
        console.error(e);
      }
    }),
  ]);
}
