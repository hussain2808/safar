import Dexie, { type Table } from 'dexie';
import type { Dua, PendingDelete } from '@/modules/dua/types';

class DuaDB extends Dexie {
  duas!: Table<Dua>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-dua-db');
    this.version(1).stores({
      duas: 'id, category, favorite, archived, lastOpenedAt, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new DuaDB();
