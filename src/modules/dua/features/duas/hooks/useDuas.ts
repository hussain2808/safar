import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/dua/db';

export function useDuas() {
  const result = useLiveQuery(async () => {
    const duas = await db.duas.toArray();
    return duas.sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const duas = useMemo(() => (result ?? []).filter((d) => !d.archived), [result]);

  const archived = useMemo(() => (result ?? []).filter((d) => d.archived), [result]);

  const favorites = useMemo(() => duas.filter((d) => d.favorite), [duas]);

  const continueReading = useMemo(
    () => duas
      .filter((d) => !!d.lastOpenedAt)
      .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
      .slice(0, 5),
    [duas],
  );

  return { duas, archived, favorites, continueReading, isLoading: result === undefined };
}
