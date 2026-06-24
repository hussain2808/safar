import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/amaanat/db';
import { getWarrantyStatus } from '@/modules/amaanat/lib/warranty';
import type { Item, WarrantyStatus } from '@/modules/amaanat/types';

export interface ItemWithStatus extends Item {
  warrantyStatus: WarrantyStatus;
}

export function useItems() {
  const result = useLiveQuery(async () => {
    const items = await db.items.toArray();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  });

  const items = useMemo<ItemWithStatus[]>(
    () => (result ?? []).map((item) => ({ ...item, warrantyStatus: getWarrantyStatus(item.warrantyExpiry) })),
    [result],
  );

  const attentionItems = useMemo(
    () => items.filter((i) => i.warrantyStatus === 'expired' || i.warrantyStatus === 'expiring_soon'),
    [items],
  );

  return { items, attentionItems, isLoading: result === undefined };
}
