export type Relationship = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  dob?: number;
  createdAt: number;
  updatedAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
