import Dexie, { type Table } from 'dexie';
import type { DocumentRecord, DocumentFile, PendingDelete } from '@/modules/sanad/types';

class SanadDB extends Dexie {
  documents!: Table<DocumentRecord>;
  files!: Table<DocumentFile>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-sanad-db');
    this.version(1).stores({
      documents: 'id, category, expiryDate, createdAt',
      files: 'id, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new SanadDB();
