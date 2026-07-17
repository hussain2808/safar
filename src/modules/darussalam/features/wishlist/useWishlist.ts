import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { WishlistItem, WishlistCategory } from '@/modules/darussalam/types';

function makeId() {
  return `wish_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function useWishlist(roomId?: string | null) {
  const result = useLiveQuery(async () => {
    const all = await db.wishlistItems.toArray();
    const filtered = roomId ? all.filter((w) => w.roomId === roomId) : all;
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [roomId]);

  return result ?? [];
}

export async function addWishlistItem(input: { title: string; category?: WishlistCategory; notes?: string; roomId?: string | null }) {
  const now = Date.now();
  const item: WishlistItem = {
    id: makeId(),
    title: input.title.trim(),
    category: input.category,
    notes: input.notes?.trim() || undefined,
    roomId: input.roomId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.wishlistItems.add(item);
  return item;
}

export async function toggleWishlistResolved(item: WishlistItem) {
  await db.wishlistItems.update(item.id, { resolved: !item.resolved, updatedAt: Date.now() });
}

export async function deleteWishlistItem(id: string) {
  await db.wishlistItems.delete(id);
}
