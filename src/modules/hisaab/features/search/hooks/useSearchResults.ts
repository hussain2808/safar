import Fuse, { type FuseResultMatch } from 'fuse.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/hisaab/db';
import { formatAmountRaw } from '@/modules/hisaab/lib/format';
import type { Book, Transaction } from '@/modules/hisaab/types';

interface SearchableTransaction {
  transaction: Transaction;
  book: Book;
  remark: string;
  categoryLabel: string;
  bookName: string;
  amountText: string;
}

export interface SearchMatch {
  transaction: Transaction;
  categoryLabel?: string;
  matches: readonly FuseResultMatch[];
}

export interface SearchGroup {
  book: Book;
  results: SearchMatch[];
}

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<SearchableTransaction>>[1] = {
  keys: ['remark', 'categoryLabel', 'bookName', 'amountText'],
  includeMatches: true,
  threshold: 0.35,
  ignoreLocation: true,
};

export function useSearchResults(query: string) {
  const data = useLiveQuery(async () => {
    const [books, transactions, categories] = await Promise.all([
      db.books.toArray(),
      db.transactions.toArray(),
      db.categories.toArray(),
    ]);
    return { books, transactions, categories };
  });

  const searchable = useMemo<SearchableTransaction[]>(() => {
    if (!data) return [];
    const booksById = new Map(data.books.map((b) => [b.id, b]));
    const categoryLabelById = new Map(data.categories.map((c) => [c.id, c.label]));
    return data.transactions.flatMap((transaction) => {
      const book = booksById.get(transaction.bookId);
      if (!book) return [];
      const categoryLabel = (transaction.category && categoryLabelById.get(transaction.category)) ?? '';
      return [{
        transaction,
        book,
        remark: transaction.remark,
        categoryLabel,
        bookName: book.name,
        amountText: formatAmountRaw(transaction.amount),
      }];
    });
  }, [data]);

  const fuse = useMemo(() => new Fuse(searchable, FUSE_OPTIONS), [searchable]);

  const groups = useMemo<SearchGroup[]>(() => {
    if (!query.trim()) return [];
    const hits = fuse.search(query.trim());
    const byBook = new Map<string, SearchGroup>();
    for (const hit of hits) {
      const { book, transaction, categoryLabel } = hit.item;
      const group = byBook.get(book.id) ?? { book, results: [] };
      group.results.push({ transaction, categoryLabel: categoryLabel || undefined, matches: hit.matches ?? [] });
      byBook.set(book.id, group);
    }
    return [...byBook.values()];
  }, [fuse, query]);

  return { groups, isLoading: data === undefined };
}
