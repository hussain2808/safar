import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { fsdb, storage } from '@/lib/firebase';
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
  await Promise.all([
    deleteDoc(personRef(uid, personId)),
    deleteObject(ref(storage, `users/${uid}/personPhotos/${personId}`)).catch(() => {}),
    deleteObject(ref(storage, `users/${uid}/personPhotos/${personId}_thumb`)).catch(() => {}),
  ]);
}

export async function uploadPersonPhoto(
  uid: string,
  personId: string,
  blob: Blob,
  thumbnail: Blob,
): Promise<{ photoUrl: string; thumbnailUrl: string }> {
  const fullRef = ref(storage, `users/${uid}/personPhotos/${personId}`);
  const thumbRef = ref(storage, `users/${uid}/personPhotos/${personId}_thumb`);
  const [fullSnap, thumbSnap] = await Promise.all([
    uploadBytes(fullRef, blob, { contentType: 'image/jpeg' }),
    uploadBytes(thumbRef, thumbnail, { contentType: 'image/jpeg' }),
  ]);
  const [photoUrl, thumbnailUrl] = await Promise.all([
    getDownloadURL(fullSnap.ref),
    getDownloadURL(thumbSnap.ref),
  ]);
  return { photoUrl, thumbnailUrl };
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
