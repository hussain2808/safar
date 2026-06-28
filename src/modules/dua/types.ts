export type DuaCategory =
  | 'daily'
  | 'family'
  | 'personal'
  | 'travel'
  | 'health'
  | 'provision'
  | 'forgiveness'
  | 'quran'
  | 'ratib'
  | 'hizb'
  | 'other';

export type ContentBlockType = 'arabic' | 'transliteration' | 'translation' | 'reflection' | 'divider';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  text?: string;
}

export interface Dua {
  id: string;
  title: string;
  category: DuaCategory;
  contentBlocks: ContentBlock[];
  notes?: string;
  favorite: boolean;
  archived: boolean;
  lastOpenedAt?: number;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'dua';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
