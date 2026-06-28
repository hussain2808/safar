import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/family/db';
import type { Person } from '@/family/types';

function personRef(uid: string, personId: string) {
  return doc(fsdb, 'users', uid, 'people', personId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const rest: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  delete rest.pendingSync;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

export async function pushPerson(uid: string, person: Person) {
  await setDoc(personRef(uid, person.id), toFirestoreDoc(person));
}

export async function deleteFirestorePerson(uid: string, personId: string) {
  await deleteDoc(personRef(uid, personId));
}

export async function syncOnLogin(uid: string) {
  const [peopleSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'people')),
    db.pendingDeletes.toArray(),
  ]);
  const deletedPersonIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'person').map((pd) => pd.targetId));
  const people: Person[] = peopleSnap.docs
    .filter((d) => !deletedPersonIds.has(d.id))
    .map((d) => ({ ...(d.data() as Person), pendingSync: false }));
  if (people.length) await db.people.bulkPut(people);
}
