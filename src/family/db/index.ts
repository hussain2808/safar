import Dexie, { type Table } from 'dexie';
import type { Person, PendingDelete } from '@/family/types';

class FamilyDB extends Dexie {
  people!: Table<Person>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-family-db');
    this.version(1).stores({
      people: 'id, relationship',
    });
    this.version(2).stores({
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new FamilyDB();

export const SELF_PERSON_ID = 'self';
