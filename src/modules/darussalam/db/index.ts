import Dexie, { type Table } from 'dexie';
import type { Room, Idea, IdeaFile, PendingDelete } from '@/modules/darussalam/types';

class DarussalamDB extends Dexie {
  rooms!: Table<Room>;
  ideas!: Table<Idea>;
  files!: Table<IdeaFile>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-darussalam-db');
    this.version(1).stores({
      rooms: 'id, category, order, createdAt',
      ideas: 'id, roomId, type, favorite, createdAt',
      files: 'id, ideaId, createdAt',
      pendingDeletes: 'id, kind',
    });
  }
}

export const db = new DarussalamDB();
