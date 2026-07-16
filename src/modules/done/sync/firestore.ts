import {
  doc, setDoc, deleteDoc, writeBatch,
  collection, getDocs,
} from 'firebase/firestore';
import { fsdb } from '@/lib/firebase';
import { db } from '@/modules/done/db';
import type { HabitRecord, HabitCompletion } from '@/modules/done/types';

function habitRef(uid: string, habitId: string) {
  return doc(fsdb, 'users', uid, 'doneHabits', habitId);
}

function completionRef(uid: string, completionId: string) {
  return doc(fsdb, 'users', uid, 'doneCompletions', completionId);
}

function toFirestoreDoc<T extends object>(obj: T): Omit<T, 'pendingSync'> {
  const rest: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  delete rest.pendingSync;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Omit<T, 'pendingSync'>;
}

export async function pushHabit(uid: string, habit: HabitRecord) {
  await setDoc(habitRef(uid, habit.id), toFirestoreDoc(habit));
}

export async function deleteFirestoreHabit(uid: string, habitId: string) {
  await deleteDoc(habitRef(uid, habitId));
}

export async function pushCompletion(uid: string, completion: HabitCompletion) {
  await setDoc(completionRef(uid, completion.id), toFirestoreDoc(completion));
}

export async function deleteFirestoreCompletion(uid: string, completionId: string) {
  await deleteDoc(completionRef(uid, completionId));
}

export async function deleteFirestoreCompletionsForHabit(uid: string, completionIds: string[]) {
  if (!completionIds.length) return;
  const batch = writeBatch(fsdb);
  completionIds.forEach((id) => batch.delete(completionRef(uid, id)));
  await batch.commit();
}

export async function syncOnLogin(uid: string) {
  const [habitsSnap, completionsSnap, pendingDeletes] = await Promise.all([
    getDocs(collection(fsdb, 'users', uid, 'doneHabits')),
    getDocs(collection(fsdb, 'users', uid, 'doneCompletions')),
    db.pendingDeletes.toArray(),
  ]);

  const deletedHabitIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'habit').map((pd) => pd.targetId));
  const deletedCompletionIds = new Set(pendingDeletes.filter((pd) => pd.kind === 'completion').map((pd) => pd.targetId));

  const habits: HabitRecord[] = habitsSnap.docs
    .filter((d) => !deletedHabitIds.has(d.id))
    .map((d) => ({ ...(d.data() as HabitRecord), pendingSync: false }));
  if (habits.length) await db.habits.bulkPut(habits);

  const completions: HabitCompletion[] = completionsSnap.docs
    .filter((d) => !deletedCompletionIds.has(d.id))
    .map((d) => ({ ...(d.data() as HabitCompletion), pendingSync: false }));
  if (completions.length) await db.completions.bulkPut(completions);
}
