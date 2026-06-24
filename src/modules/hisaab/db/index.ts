import Dexie, { type Table } from 'dexie';
import type { Book, Transaction, Photo, Category } from '../types';

class HisaabDB extends Dexie {
  books!: Table<Book>;
  transactions!: Table<Transaction>;
  photos!: Table<Photo>;
  categories!: Table<Category>;

  constructor() {
    super('safar-hisaab-db');
    this.version(1).stores({
      books:        'id, name, archived, createdAt',
      transactions: 'id, bookId, type, date, category, [bookId+date]',
      photos:       'id, createdAt',
      categories:   'id, bookId',
    });
  }
}

export const db = new HisaabDB();
