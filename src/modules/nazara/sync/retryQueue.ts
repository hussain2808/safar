import { db } from '@/modules/nazara/db';
import { pushMemory, deleteFirestoreMemory } from './firestore';
import { pushPhoto, deleteFirestorePhoto } from '@/modules/nazara/db/photos';

export async function retryPendingSync(uid: string): Promise<void> {
  const [memories, photos, pendingDeletes] = await Promise.all([
    db.memories.filter((m) => m.pendingSync !== false).toArray(),
    db.photos.filter((p) => p.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...memories.map((m) => pushMemory(uid, m).then(() => db.memories.update(m.id, { pendingSync: false })).catch(console.error)),
    ...photos.map((p) => pushPhoto(uid, p).then(() => db.photos.update(p.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'memory') await deleteFirestoreMemory(uid, pd.targetId);
        else await deleteFirestorePhoto(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) { console.error(e); }
    }),
  ]);
}
