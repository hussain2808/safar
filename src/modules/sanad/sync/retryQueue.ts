import { db } from '@/modules/sanad/db';
import { pushDocument, deleteFirestoreDocument } from './firestore';
import { pushFile, deleteFirestoreFile } from '@/modules/sanad/db/files';

export async function retryPendingSync(uid: string): Promise<void> {
  const [documents, files, pendingDeletes] = await Promise.all([
    db.documents.filter((d) => d.pendingSync !== false).toArray(),
    db.files.filter((f) => f.pendingSync !== false).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...documents.map((d) => pushDocument(uid, d).then(() => db.documents.update(d.id, { pendingSync: false })).catch(console.error)),
    ...files.map((f) => pushFile(uid, f).then(() => db.files.update(f.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'document') await deleteFirestoreDocument(uid, pd.targetId);
        else await deleteFirestoreFile(uid, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) { console.error(e); }
    }),
  ]);
}
