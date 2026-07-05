import { db } from '@/modules/amaanat/db';
import { pushItem, deleteFirestoreItem } from './firestore';
import { pushPhoto, deleteFirestorePhoto } from '@/modules/amaanat/db/photos';
import { pushDocument, deleteFirestoreDocument } from '@/modules/amaanat/db/documents';

export async function retryPendingSync(uid: string): Promise<void> {
  const [items, photos, documents, pendingDeletes] = await Promise.all([
    db.items.filter((i) => i.pendingSync !== false).toArray(),
    db.photos.filter((p) => p.pendingSync !== false).toArray(),
    db.documents.filter((d) => d.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...items.map((i) => pushItem(uid, i).then(() => db.items.update(i.id, { pendingSync: false })).catch(console.error)),
    ...photos.map((p) => pushPhoto(uid, p).then(() => db.photos.update(p.id, { pendingSync: false })).catch(console.error)),
    ...documents.map((d) => pushDocument(uid, d).then(() => db.documents.update(d.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'item') await deleteFirestoreItem(uid, pd.targetId);
        else if (pd.kind === 'photo') await deleteFirestorePhoto(uid, pd.targetId);
        else if (pd.kind === 'document') await deleteFirestoreDocument(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) {
        console.error(e);
      }
    }),
  ]);
}
