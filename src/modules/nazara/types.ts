export type CategoryType =
  | 'graduation'
  | 'plant'
  | 'car'
  | 'home'
  | 'travel'
  | 'birthday'
  | 'wedding'
  | 'baby'
  | 'work'
  | 'camping'
  | 'family'
  | 'other';

export type EventType = 'memory' | 'recurring';

export interface MemoryRecord {
  id: string;
  title: string;
  date: number;
  type: EventType;
  notes?: string;
  photoIds: string[];
  people: string[];
  category: CategoryType;
  notifyYearly: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface MemoryPhoto {
  id: string;
  blob: Blob;
  thumbnail?: Blob;
  mimeType: string;
  fileName: string;
  createdAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'memory' | 'photo';
  targetId: string;
  createdAt: number;
}

export interface MemoryFormData {
  title: string;
  date: string;
  type: EventType;
  notes: string;
  photos: File[];
  existingPhotoIds: string[];
  people: string[];
  category: CategoryType;
  notifyYearly: boolean;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
