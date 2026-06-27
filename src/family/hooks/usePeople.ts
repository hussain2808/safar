import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/family/db';

export function usePeople() {
  const result = useLiveQuery(() => db.people.toArray());

  const people = useMemo(
    () =>
      (result ?? []).slice().sort((a, b) => {
        if (a.relationship === 'self') return -1;
        if (b.relationship === 'self') return 1;
        return a.createdAt - b.createdAt;
      }),
    [result],
  );

  return { people, isLoading: result === undefined };
}
