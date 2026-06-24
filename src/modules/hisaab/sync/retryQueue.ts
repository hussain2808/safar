import { db } from '@/modules/hisaab/db';
import {
  pushBook, pushTransaction, pushCategory,
  deleteFirestoreBook, deleteFirestoreTransaction, deleteFirestoreCategory,
} from './firestore';

export async function retryPendingSync(uid: string): Promise<void> {
  const [books, transactions, categories, pendingDeletes] = await Promise.all([
    db.books.filter((b) => !!b.pendingSync).toArray(),
    db.transactions.filter((t) => !!t.pendingSync).toArray(),
    db.categories.filter((c) => !!c.pendingSync).toArray(),
    db.pendingDeletes.toArray(),
  ]);

  await Promise.all([
    ...books.map((b) => pushBook(uid, b).then(() => db.books.update(b.id, { pendingSync: false })).catch(console.error)),
    ...transactions.map((t) => pushTransaction(uid, t).then(() => db.transactions.update(t.id, { pendingSync: false })).catch(console.error)),
    ...categories.map((c) => pushCategory(uid, c).then(() => db.categories.update(c.id, { pendingSync: false })).catch(console.error)),
    ...pendingDeletes.map(async (pd) => {
      try {
        if (pd.kind === 'book') await deleteFirestoreBook(uid, pd.targetId);
        else if (pd.kind === 'transaction') await deleteFirestoreTransaction(uid, pd.bookId!, pd.targetId);
        else await deleteFirestoreCategory(uid, pd.bookId!, pd.targetId);
        await db.pendingDeletes.delete(pd.id);
      } catch (e) {
        console.error(e);
      }
    }),
  ]);
}
