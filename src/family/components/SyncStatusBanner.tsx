import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/family/db';
import { retryPendingSync } from '@/family/sync/retryQueue';
import { useAuthStore } from '@/store/auth';
import { useDelayedTrue } from '@/lib/useDelayedTrue';

export function SyncStatusBanner() {
  const uid = useAuthStore((s) => s.user?.uid);
  const pendingCount = useLiveQuery(async () => {
    const [people, deletes] = await Promise.all([
      db.people.filter((p) => p.pendingSync !== false).count(),
      db.pendingDeletes.count(),
    ]);
    return people + deletes;
  }, [], 0);
  const showBanner = useDelayedTrue(!!pendingCount, 3000);
  if (!showBanner) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 z-50 bg-card-bg shadow-button rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4">
      <p className="text-caption text-text-primary">{pendingCount} change{pendingCount === 1 ? '' : 's'} not yet synced</p>
      <button onClick={() => uid && retryPendingSync(uid)} className="text-caption font-semibold text-brown shrink-0">Retry now</button>
    </div>
  );
}
