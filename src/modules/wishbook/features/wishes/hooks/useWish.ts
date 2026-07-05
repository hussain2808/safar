import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/wishbook/db';

export function useWish(id: string) {
  const wish = useLiveQuery(() => db.wishes.get(id), [id]);
  return { wish: wish ?? null, isLoading: wish === undefined };
}
