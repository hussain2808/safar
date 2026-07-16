import Dexie, { type Table } from 'dexie';
import type { HabitRecord, HabitCompletion, PendingDelete } from '@/modules/done/types';

class DoneDB extends Dexie {
  habits!: Table<HabitRecord>;
  completions!: Table<HabitCompletion>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-done-db');
    this.version(1).stores({
      habits: 'id, archived, createdAt',
      completions: 'id, habitId, date, [habitId+date]',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new DoneDB();
