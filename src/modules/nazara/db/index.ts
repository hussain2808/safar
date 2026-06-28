import Dexie, { type Table } from 'dexie';
import type { MemoryRecord, MemoryPhoto, PendingDelete } from '@/modules/nazara/types';

class NazaraDB extends Dexie {
  memories!: Table<MemoryRecord>;
  photos!: Table<MemoryPhoto>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-nazara-db');
    this.version(1).stores({
      memories: 'id, category, date, createdAt',
      photos: 'id, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new NazaraDB();
