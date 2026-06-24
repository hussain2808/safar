import { db } from './index';
import type { Book, Transaction, Category } from '../types';
import { auth } from '@/lib/firebase';
import { pushBook, pushTransaction, pushCategory } from '../sync/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

export async function importBookWithTransactions(book: Book, transactions: Transaction[], categories: Category[] = []): Promise<void> {
  await db.transaction('rw', [db.books, db.transactions, db.categories], async () => {
    await db.books.add(book);
    if (categories.length) await db.categories.bulkAdd(categories);
    await db.transactions.bulkAdd(transactions);
  });

  const u = uid();
  if (u) {
    pushBook(u, book).catch(console.error);
    categories.forEach((c) => pushCategory(u, c).catch(console.error));
    transactions.forEach((tx) => pushTransaction(u, tx).catch(console.error));
  }
}
