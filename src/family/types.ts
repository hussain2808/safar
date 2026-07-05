export type Relationship = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  dob?: number;
  photoUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'person';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
