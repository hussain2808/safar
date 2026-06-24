import { nanoid } from 'nanoid';
import { db } from './index';
import type { Book, Result } from '../types';
import { auth } from '@/lib/firebase';
import { pushBook, deleteFirestoreBook } from '../sync/firestore';
import { DEFAULT_CURRENCY } from '../lib/currencies';

function uid() { return auth.currentUser?.uid ?? null; }

export async function createBook(name: string, emoji: string, currency = DEFAULT_CURRENCY): Promise<Result<Book>> {
  try {
    const now = Date.now();
    const book: Book = { id: nanoid(), name, emoji, currency, archived: false, createdAt: now, updatedAt: now };
    await db.books.add(book);
    const u = uid();
    if (u) pushBook(u, book).catch(console.error);
    return { ok: true, data: book };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateBook(id: string, patch: Partial<Pick<Book, 'name' | 'emoji' | 'currency' | 'archived'>>): Promise<Result<void>> {
  try {
    const updatedAt = Date.now();
    await db.books.update(id, { ...patch, updatedAt });
    const u = uid();
    if (u) {
      const book = await db.books.get(id);
      if (book) pushBook(u, book).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteBook(id: string): Promise<Result<void>> {
  try {
    await db.transaction('rw', [db.books, db.transactions, db.categories], async () => {
      await db.transactions.where('bookId').equals(id).delete();
      await db.categories.where('bookId').equals(id).delete();
      await db.books.delete(id);
    });
    const u = uid();
    if (u) deleteFirestoreBook(u, id).catch(console.error);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
