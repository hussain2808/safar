import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/hisaab/db';
import { retryPendingSync } from '@/modules/hisaab/sync/retryQueue';
import { useAuthStore } from '@/store/auth';
import { useDelayedTrue } from '@/lib/useDelayedTrue';

export function SyncStatusBanner() {
  const uid = useAuthStore((s) => s.user?.uid);

  const pendingCount = useLiveQuery(async () => {
    const [books, txs, cats, photos, deletes] = await Promise.all([
      db.books.filter((b) => b.pendingSync !== false).count(),
      db.transactions.filter((t) => t.pendingSync !== false).count(),
      db.categories.filter((c) => c.pendingSync !== false).count(),
      db.photos.filter((p) => p.pendingSync !== false).count(),
      db.pendingDeletes.count(),
    ]);
    return books + txs + cats + photos + deletes;
  }, [], 0);

  const showBanner = useDelayedTrue(!!pendingCount, 3000);

  if (!showBanner) return null;

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
