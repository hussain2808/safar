import { nanoid } from 'nanoid';
import { db } from './index';
import type { Category, Result } from '../types';
import { auth } from '@/lib/firebase';
import { pushCategory, deleteFirestoreCategory } from '../sync/firestore';

function uid() { return auth.currentUser?.uid ?? null; }

export async function createCategory(
  bookId: string,
  label: string,
  icon: string,
): Promise<Result<Category>> {
  try {
    const category: Category = { id: nanoid(), bookId, label, icon, createdAt: Date.now(), pendingSync: true };
    await db.categories.add(category);
    const u = uid();
    if (u) pushCategory(u, category).then(() => db.categories.update(category.id, { pendingSync: false })).catch(console.error);
    return { ok: true, data: category };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'label' | 'icon'>>,
): Promise<Result<void>> {
  try {
    await db.categories.update(id, { ...patch, pendingSync: true });
    const u = uid();
    if (u) {
      const category = await db.categories.get(id);
      if (category) pushCategory(u, category).then(() => db.categories.update(id, { pendingSync: false })).catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteCategory(id: string): Promise<Result<void>> {
  try {
    const usageCount = await db.transactions.where('category').equals(id).count();
    if (usageCount > 0) {
      return { ok: false, error: `Used by ${usageCount} ${usageCount === 1 ? 'entry' : 'entries'} — remove or recategorize them first.` };
    }
    const category = await db.categories.get(id);
    const u = uid();
    if (u && category) await db.pendingDeletes.add({ id: nanoid(), kind: 'category', targetId: id, bookId: category.bookId, createdAt: Date.now() });
    await db.categories.delete(id);
    if (u && category) {
      deleteFirestoreCategory(u, category.bookId, id)
        .then(() => db.pendingDeletes.where({ kind: 'category', targetId: id }).delete())
        .catch(console.error);
    }
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
