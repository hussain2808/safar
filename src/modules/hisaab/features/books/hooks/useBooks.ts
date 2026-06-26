import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useEffect } from 'react';
import { db } from '@/modules/hisaab/db';
import { calculateBalance } from '@/modules/hisaab/lib/balance';
import { useBooksStore } from '@/modules/hisaab/store/books';
import type { BookWithStats } from '@/modules/hisaab/types';

export function useBooks() {
  const { setBooks, setLoaded } = useBooksStore();

  const result = useLiveQuery(async () => {
    const [allBooks, allTransactions] = await Promise.all([
      db.books.toArray(),
      db.transactions.toArray(),
    ]);
    const books = allBooks.filter((b) => !b.archived).sort((a, b) => a.createdAt - b.createdAt);

    const txByBook = new Map<string, typeof allTransactions>();
    for (const tx of allTransactions) {
      const list = txByBook.get(tx.bookId) ?? [];
      list.push(tx);
      txByBook.set(tx.bookId, list);
    }

    return books.map((book): BookWithStats => {
      const txs = txByBook.get(book.id) ?? [];
      return {
        ...book,
        balance: calculateBalance(txs),
        transactionCount: txs.length,
        hasPendingSync: !!book.pendingSync || txs.some((t) => t.pendingSync),
        lastEntryAt: txs.length ? Math.max(...txs.map((t) => t.date)) : book.createdAt,
      };
    });
  });

  const books = useMemo(() => result ?? [], [result]);
  const isLoaded = result !== undefined;

  useEffect(() => {
    if (isLoaded) setBooks(books);
    else setLoaded(false);
  }, [books, isLoaded, setBooks, setLoaded]);

  return { books, isLoading: !isLoaded };
}
