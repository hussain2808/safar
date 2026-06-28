import {
  doc, setDoc, deleteDoc,
  collection, getDocs, writeBatch,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/hisaab/db';
import type { Book, Transaction, Category, Photo } from '@/modules/hisaab/types';

// Firestore rejects any field with an `undefined` value — strip them before writing,
// since optional fields (e.g. Transaction.category, Transaction.photoId) are often
// passed through as literal `undefined` rather than omitted. Also strip `pendingSync`:
// it's local-only bookkeeping — writing it remotely would bake in whatever value was
// true at push time, and the next pull-on-login would overwrite the local (correctly
// cleared) flag with that stale remote value, causing it to "un-sync" forever.
function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const { pendingSync, ...rest } = obj as T & { pendingSync?: boolean };
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

function bookRef(uid: string, bookId: string) {
  return doc(fsdb, 'users', uid, 'books', bookId);
}

function txRef(uid: string, bookId: string, txId: string) {
  return doc(fsdb, 'users', uid, 'books', bookId, 'transactions', txId);
}

function categoryRef(uid: string, bookId: string, categoryId: string) {
  return doc(fsdb, 'users', uid, 'books', bookId, 'categories', categoryId);
}

// ── Write-through helpers (fire-and-forget at call sites) ─────────────────────

export async function pushBook(uid: string, book: Book) {
  await setDoc(bookRef(uid, book.id), toFirestoreDoc(book));
}

export async function deleteFirestoreBook(uid: string, bookId: string) {
  const [txSnap, catSnap] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'books', bookId, 'transactions')),
    getDocs(collection(fsdb, 'users', uid, 'books', bookId, 'categories')),
  ]);
  const batch = writeBatch(fsdb);
  txSnap.forEach((d) => batch.delete(d.ref));
  catSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(bookRef(uid, bookId));
  await batch.commit();
}

export async function pushTransaction(uid: string, tx: Transaction) {
  await setDoc(txRef(uid, tx.bookId, tx.id), toFirestoreDoc(tx));
}

export async function deleteFirestoreTransaction(uid: string, bookId: string, txId: string) {
  await deleteDoc(txRef(uid, bookId, txId));
}

export async function pushCategory(uid: string, category: Category) {
  await setDoc(categoryRef(uid, category.bookId, category.id), toFirestoreDoc(category));
}

export async function deleteFirestoreCategory(uid: string, bookId: string, categoryId: string) {
  await deleteDoc(categoryRef(uid, bookId, categoryId));
}

// ── Pull on login — Firestore → Dexie ────────────────────────────────────────

export async function syncOnLogin(uid: string) {
  const [booksSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'books')),
    db.pendingDeletes.toArray(),
  ]);
  const deletedBookIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'book').map((pd) => pd.targetId));
  const deletedTxIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'transaction').map((pd) => pd.targetId));
  const deletedCategoryIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'category').map((pd) => pd.targetId));

  const books: Book[] = [];
  const transactions: Transaction[] = [];
  const categories: Category[] = [];

  await Promise.all(
    booksSnap.docs.map(async (bookDoc) => {
      if (deletedBookIds.has(bookDoc.id)) return;
      books.push({ ...(bookDoc.data() as Book), pendingSync: false });
      const [txSnap, catSnap] = await Promise.all([
        getDocs(collection(fsdb, 'users', uid, 'books', bookDoc.id, 'transactions')),
        getDocs(collection(fsdb, 'users', uid, 'books', bookDoc.id, 'categories')),
      ]);
      txSnap.forEach((d) => { if (!deletedTxIds.has(d.id)) transactions.push({ ...(d.data() as Transaction), pendingSync: false }); });
      catSnap.forEach((d) => { if (!deletedCategoryIds.has(d.id)) categories.push({ ...(d.data() as Category), pendingSync: false }); });
    }),
  );

  if (books.length) await db.books.bulkPut(books);
  if (transactions.length) await db.transactions.bulkPut(transactions);
  if (categories.length) await db.categories.bulkPut(categories);

  await syncPhotosOnLogin(uid);
}

async function syncPhotosOnLogin(uid: string) {
  const photosSnap = await getDocs(collection(fsdb, 'users', uid, 'photos'));
  if (photosSnap.empty) return;

  const existingIds = new Set(await db.photos.toCollection().primaryKeys() as string[]);

  await Promise.all(
    photosSnap.docs.map(async (d) => {
      const { id, url, thumbUrl, createdAt } = d.data() as {
        id: string; url: string; thumbUrl: string; createdAt: number;
      };
      if (existingIds.has(id)) return;

      try {
        const [blob, thumbnail] = await Promise.all([
          fetch(url).then((r) => r.blob()),
          fetch(thumbUrl).then((r) => r.blob()),
        ]);
        const photo: Photo = { id, blob, thumbnail, createdAt };
        await db.photos.put(photo);
      } catch {
        // Non-fatal — photo will sync next login
      }
    }),
  );
}
