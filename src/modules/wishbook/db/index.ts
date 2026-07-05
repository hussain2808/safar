import Dexie, { type Table } from 'dexie';
import type { Wish, PendingDelete } from '@/modules/wishbook/types';

class WishbookDB extends Dexie {
  wishes!: Table<Wish>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-wishbook-db');
    this.version(1).stores({
      wishes: 'id, categoryId, assignedToId, status, priority, targetDate, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new WishbookDB();
