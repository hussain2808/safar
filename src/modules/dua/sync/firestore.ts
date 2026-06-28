import {
  doc, setDoc, deleteDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/dua/db';
import type { Dua } from '@/modules/dua/types';

function duaRef(uid: string, duaId: string) {
  return doc(fsdb, 'users', uid, 'duaDuas', duaId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const rest: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  delete rest.pendingSync;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

export async function pushDua(uid: string, dua: Dua) {
  await setDoc(duaRef(uid, dua.id), toFirestoreDoc(dua));
}

export async function deleteFirestoreDua(uid: string, duaId: string) {
  await deleteDoc(duaRef(uid, duaId));
}

export async function syncOnLogin(uid: string) {
  const [duasSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'duaDuas')),
    db.pendingDeletes.toArray(),
  ]);
  const deletedDuaIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'dua').map((pd) => pd.targetId));
  const duas: Dua[] = duasSnap.docs
    .filter((d) => !deletedDuaIds.has(d.id))
    .map((d) => ({ ...(d.data() as Dua), pendingSync: false }));
  if (duas.length) await db.duas.bulkPut(duas);
}
