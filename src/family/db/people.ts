import { nanoid } from 'nanoid';
import { db, SELF_PERSON_ID } from '@/family/db';
import type { Person, Result } from '@/family/types';
import { auth } from '@/lib/firebase';
import { pushPerson, deleteFirestorePerson } from '@/family/sync/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

export async function ensureSelfSeeded(name: string): Promise<void> {
  const existing = await db.people.get(SELF_PERSON_ID);
  if (existing) return;
  const now = Date.now();
  const person: Person = { id: SELF_PERSON_ID, name, relationship: 'self', createdAt: now, updatedAt: now, pendingSync: true };
  await db.people.add(person);
  const u = uid();
  if (u) pushPerson(u, person).then(() => db.people.update(person.id, { pendingSync: false })).catch(console.error);
}

export async function createPerson(
  input: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'pendingSync'>,
): Promise<Result<Person>> {
  try {
    const now = Date.now();
    const person: Person = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.people.add(person);
    const u = uid();
    if (u) pushPerson(u, person).then(() => db.people.update(person.id, { pendingSync: false })).catch(console.error);
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
    await db.people.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const person = await db.people.get(id);
      if (person) pushPerson(u, person).then(() => db.people.update(id, { pendingSync: false })).catch(console.error);
    }
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
    await db.transaction('rw', [db.people, db.pendingDeletes], async () => {
      await db.pendingDeletes.add({ id: nanoid(), kind: 'person', targetId: id, createdAt: Date.now() });
      await db.people.delete(id);
    });

    const u = uid();
    if (u) {
      deleteFirestorePerson(u, id)
        .then(async () => {
          const pd = await db.pendingDeletes.where({ kind: 'person', targetId: id }).first();
          if (pd) await db.pendingDeletes.delete(pd.id);
        })
        .catch(console.error);
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
