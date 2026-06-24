import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/amaanat/db';
import { getWarrantyStatus } from '@/modules/amaanat/lib/warranty';
import type { Item } from '@/modules/amaanat/types';

export function useItem(itemId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!itemId) return null;
    const item = await db.items.get(itemId);
    return item ?? null;
  }, [itemId]);

  const item = (result ?? null) as Item | null;

  return {
    item,
    warrantyStatus: item ? getWarrantyStatus(item.warrantyExpiry) : 'none' as const,
    isLoading: result === undefined,
  };
}
