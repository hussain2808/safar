import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/hisaab/db';
import type { Book } from '@/modules/hisaab/types';

export function useBook(bookId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!bookId) return null;
    const book = await db.books.get(bookId);
    return book ?? null;
  }, [bookId]);

  return {
    book: (result ?? null) as Book | null,
    isLoading: result === undefined,
  };
}
