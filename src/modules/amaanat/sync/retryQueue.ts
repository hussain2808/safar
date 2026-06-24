import { db } from '@/modules/amaanat/db';
import { pushItem, deleteFirestoreItem } from './firestore';
import { deletePhoto } from '@/modules/amaanat/db/photos';
import { deleteDocument } from '@/modules/amaanat/db/documents';

export async function retryPendingSync(uid: string): Promise<void> {
  const [items, pendingDeletes] = await Promise.all([
    db.items.filter((i) => !!i.pendingSync).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...items.map((i) => pushItem(uid, i).then(() => db.items.update(i.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'item') await deleteFirestoreItem(uid, pd.targetId);
        else if (pd.kind === 'photo') await deletePhoto(pd.targetId);
        else await deleteDocument(pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) {
        console.error(e);
      }
    }),
  ]);
}
