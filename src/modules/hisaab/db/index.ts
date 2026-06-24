import Dexie, { type Table } from 'dexie';
import type { Book, Transaction, Photo, Category, PendingDelete } from '@/modules/hisaab/types';

class HisaabDB extends Dexie {
  books!: Table<Book>;
  transactions!: Table<Transaction>;
  photos!: Table<Photo>;
  categories!: Table<Category>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-hisaab-db');
    this.version(1).stores({
      books:        'id, name, archived, createdAt',
      transactions: 'id, bookId, type, date, category, [bookId+date]',
      photos:       'id, createdAt',
      categories:   'id, bookId',
    });
    this.version(2).stores({
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new HisaabDB();
