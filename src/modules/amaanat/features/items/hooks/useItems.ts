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

  const stats = useMemo(() => ({
    totalItems: items.length,
    underWarranty: items.filter((i) => i.warrantyStatus === 'active' || i.warrantyStatus === 'expiring_soon').length,
    receiptsCount: items.reduce((sum, i) => sum + i.documentIds.length, 0),
    expiringSoonCount: items.filter((i) => i.warrantyStatus === 'expiring_soon').length,
  }), [items]);

  const upcomingReminders = useMemo(
    () => items
      .filter((i) => !!i.warrantyExpiry && i.warrantyStatus !== 'none')
      .sort((a, b) => a.warrantyExpiry! - b.warrantyExpiry!)
      .slice(0, 4),
    [items],
  );

  return { items, attentionItems, stats, upcomingReminders, isLoading: result === undefined };
}
