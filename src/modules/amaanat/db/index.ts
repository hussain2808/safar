import Dexie, { type Table } from 'dexie';
import type { Item, Photo, Document, PendingDelete } from '@/modules/amaanat/types';

class AmaanatDB extends Dexie {
  items!: Table<Item>;
  photos!: Table<Photo>;
  documents!: Table<Document>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-amaanat-db');
    this.version(1).stores({
      items: 'id, category, purchaseDate, warrantyExpiry, createdAt',
      photos: 'id, createdAt',
      documents: 'id, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new AmaanatDB();
