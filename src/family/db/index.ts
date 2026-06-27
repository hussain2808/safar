import Dexie, { type Table } from 'dexie';
import type { Person } from '@/family/types';

class FamilyDB extends Dexie {
  people!: Table<Person>;

  constructor() {
    super('safar-family-db');
    this.version(1).stores({
      people: 'id, relationship',
    });
  }
}

export const db = new FamilyDB();

export const SELF_PERSON_ID = 'self';

export async function ensureSelfSeeded(name: string): Promise<void> {
  const existing = await db.people.get(SELF_PERSON_ID);
  if (existing) return;
  const now = Date.now();
  await db.people.add({ id: SELF_PERSON_ID, name, relationship: 'self', createdAt: now, updatedAt: now });
}
