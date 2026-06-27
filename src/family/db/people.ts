import { nanoid } from 'nanoid';
import { db, SELF_PERSON_ID } from '@/family/db';
import type { Person, Result } from '@/family/types';

export async function createPerson(
  input: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Result<Person>> {
  try {
    const now = Date.now();
    const person: Person = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
    await db.people.add(person);
    return { ok: true, data: person };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updatePerson(
  id: string,
  patch: Partial<Omit<Person, 'id' | 'createdAt'>>,
): Promise<Result<void>> {
  try {
    await db.people.update(id, { ...patch, updatedAt: Date.now() });
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deletePerson(id: string): Promise<Result<void>> {
  if (id === SELF_PERSON_ID) {
    return { ok: false, error: 'Cannot delete yourself.' };
  }
  try {
    await db.people.delete(id);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
