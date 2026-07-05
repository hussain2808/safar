import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/wishbook/db';
import type { Wish } from '@/modules/wishbook/types';

function wishRef(uid: string, wishId: string) {
  return doc(fsdb, 'users', uid, 'wishbookWishes', wishId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const { pendingSync, ...rest } = obj as T & { pendingSync?: boolean };
  return Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  ) as Omit<T, 'pendingSync'>;
}

export async function pushWish(uid: string, wish: Wish) {
  await setDoc(wishRef(uid, wish.id), toFirestoreDoc(wish));
}

export async function deleteFirestoreWish(uid: string, wishId: string) {
  await deleteDoc(wishRef(uid, wishId));
}

export async function syncOnLogin(uid: string) {
  const [wishesSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'wishbookWishes')),
    db.pendingDeletes.toArray(),
  ]);
  const deletedIds = new Set(
    pendingDeletes.filter((pd) => pd.kind === 'wish').map((pd) => pd.targetId),
  );
  const wishes: Wish[] = wishesSnap.docs
    .filter((d) => !deletedIds.has(d.id))
    .map((d) => ({ ...(d.data() as Wish), pendingSync: false }));
  if (wishes.length) await db.wishes.bulkPut(wishes);
}
