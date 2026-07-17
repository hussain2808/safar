import Dexie, { type Table } from 'dexie';
import type {
  Room, Idea, IdeaFile, Measurement, RoomNote, Decision, WishlistItem,
  DocumentRecord, DocumentFile, VisionBoard, HouseSettings, PendingDelete,
} from '@/modules/darussalam/types';

class DarussalamDB extends Dexie {
  rooms!: Table<Room>;
  ideas!: Table<Idea>;
  files!: Table<IdeaFile>;
  measurements!: Table<Measurement>;
  notes!: Table<RoomNote>;
  decisions!: Table<Decision>;
  wishlistItems!: Table<WishlistItem>;
  documents!: Table<DocumentRecord>;
  documentFiles!: Table<DocumentFile>;
  visionBoard!: Table<VisionBoard>;
  settings!: Table<HouseSettings>;
  pendingDeletes!: Table<PendingDelete>;

  constructor() {
    super('safar-darussalam-db');
    this.version(1).stores({
      rooms: 'id, category, order, createdAt',
      ideas: 'id, roomId, type, favorite, createdAt',
      files: 'id, ideaId, createdAt',
      pendingDeletes: 'id, kind',
    });
    this.version(2).stores({
      measurements: 'id, roomId, createdAt',
      notes: 'id, roomId, createdAt',
      decisions: 'id, roomId, date, createdAt',
      wishlistItems: 'id, roomId, category, createdAt',
      documents: 'id, roomId, category, createdAt',
      documentFiles: 'id, documentId, createdAt',
      visionBoard: 'id',
      settings: 'id',
    });
  }
}

export const db = new DarussalamDB();
