import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/dua/db';
import type { Dua } from '@/modules/dua/types';

export function useDua(duaId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!duaId) return null;
    const dua = await db.duas.get(duaId);
    return dua ?? null;
  }, [duaId]);

  return {
    dua: (result ?? null) as Dua | null,
    isLoading: result === undefined,
  };
}
