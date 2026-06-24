import { nanoid } from 'nanoid';
import { db } from './index';
import type { Transaction, Result } from '../types';
import { auth } from '@/lib/firebase';
import { pushTransaction, deleteFirestoreTransaction } from '../sync/firestore';

type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

function uid() { return auth.currentUser?.uid ?? null; }

export async function createTransaction(input: CreateTransactionInput): Promise<Result<Transaction>> {
  try {
    const now = Date.now();
    const tx: Transaction = { ...input, id: nanoid(), createdAt: now, updatedAt: now, pendingSync: true };
    await db.transactions.add(tx);
    const u = uid();
    if (u) pushTransaction(u, tx).then(() => db.transactions.update(tx.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: tx };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'bookId' | 'createdAt'>>): Promise<Result<void>> {
  try {
    await db.transactions.update(id, { ...patch, updatedAt: Date.now(), pendingSync: true });
    const u = uid();
    if (u) {
      const tx = await db.transactions.get(id);
      if (tx) pushTransaction(u, tx).then(() => db.transactions.update(id, { pendingSync: false })).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteTransaction(id: string): Promise<Result<void>> {
  try {
    const tx = await db.transactions.get(id);
    const u = uid();
    if (u && tx) await db.pendingDeletes.add({ id: nanoid(), kind: 'transaction', targetId: id, bookId: tx.bookId, createdAt: Date.now() });
    await db.transactions.delete(id);
    if (u && tx) {
      deleteFirestoreTransaction(u, tx.bookId, id)
        .then(() => db.pendingDeletes.where({ kind: 'transaction', targetId: id }).delete())
        .catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
