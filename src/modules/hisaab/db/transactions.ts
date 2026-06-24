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
    const tx: Transaction = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
    await db.transactions.add(tx);
    const u = uid();
    if (u) pushTransaction(u, tx).catch(console.error);
    return { ok: true, data: tx };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'bookId' | 'createdAt'>>): Promise<Result<void>> {
  try {
    await db.transactions.update(id, { ...patch, updatedAt: Date.now() });
    const u = uid();
    if (u) {
      const tx = await db.transactions.get(id);
      if (tx) pushTransaction(u, tx).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteTransaction(id: string): Promise<Result<void>> {
  try {
    const tx = await db.transactions.get(id);
    await db.transactions.delete(id);
    const u = uid();
    if (u && tx) deleteFirestoreTransaction(u, tx.bookId, id).catch(console.error);
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
