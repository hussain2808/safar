import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/hisaab/db';

export function useCategories(bookId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!bookId) return [];
    return db.categories.where('bookId').equals(bookId).sortBy('createdAt');
  }, [bookId]);

  return {
    categories: result ?? [],
    isLoading: result === undefined,
  };
}
