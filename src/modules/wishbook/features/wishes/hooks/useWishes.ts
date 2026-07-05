import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useEffect } from 'react';
import { db } from '@/modules/wishbook/db';
import { useWishesStore } from '@/modules/wishbook/store/wishes';

export function useWishes() {
  const { setWishes, setLoaded } = useWishesStore();

  const result = useLiveQuery(() =>
    db.wishes.orderBy('createdAt').reverse().toArray()
  );

  const wishes = useMemo(() => result ?? [], [result]);
  const isLoaded = result !== undefined;

  useEffect(() => {
    if (isLoaded) setWishes(wishes);
    else setLoaded(false);
  }, [wishes, isLoaded, setWishes, setLoaded]);

  return { wishes, isLoading: !isLoaded };
}
