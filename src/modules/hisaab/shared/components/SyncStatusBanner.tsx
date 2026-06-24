import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/hisaab/db';
import { retryPendingSync } from '@/modules/hisaab/sync/retryQueue';
import { useAuthStore } from '@/store/auth';

export function SyncStatusBanner() {
  const uid = useAuthStore((s) => s.user?.uid);

  const pendingCount = useLiveQuery(async () => {
    const [books, txs, cats, deletes] = await Promise.all([
      db.books.filter((b) => !!b.pendingSync).count(),
      db.transactions.filter((t) => !!t.pendingSync).count(),
      db.categories.filter((c) => !!c.pendingSync).count(),
      db.pendingDeletes.count(),
    ]);
    return books + txs + cats + deletes;
  }, [], 0);

  if (!pendingCount) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 bg-bg-card shadow-button rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4">
      <p className="text-caption text-hisaabText-primary">
        {pendingCount} change{pendingCount === 1 ? '' : 's'} not yet synced
      </p>
      <button
        onClick={() => uid && retryPendingSync(uid)}
        className="text-caption font-semibold text-hisaabAccent-button shrink-0"
      >
        Retry now
      </button>
    </div>
  );
}
