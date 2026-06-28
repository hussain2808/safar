import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/modules/hisaab/store/ui';
import { ConfirmSheet } from '@/modules/hisaab/shared/components/ConfirmSheet';

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const maskAmounts = useUIStore((s) => s.maskAmounts);
  const toggleMaskAmounts = useUIStore((s) => s.toggleMaskAmounts);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-page-title text-hisaabText-primary font-serif">Settings</h1>
      </header>

      <main className="px-4 space-y-6 pt-2">
        {/* Account */}
        <section>
          <p className="text-caption text-hisaabText-secondary uppercase tracking-wide px-1 mb-2">Account</p>
          <div className="bg-bg-card rounded-2xl shadow-card px-4 py-4 flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center text-hisaabText-secondary text-body font-medium">
                {user?.displayName?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-hisaabText-primary truncate">{user?.displayName ?? '—'}</p>
              <p className="text-caption text-hisaabText-secondary truncate">{user?.email ?? '—'}</p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <p className="text-caption text-hisaabText-secondary uppercase tracking-wide px-1 mb-2">Privacy</p>
          <div className="bg-bg-card rounded-2xl shadow-card px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-body text-hisaabText-primary">Mask amounts</p>
              <p className="text-caption text-hisaabText-secondary mt-0.5">Hide book balances on Home. Double-tap to reveal.</p>
            </div>
            <button
              role="switch"
              aria-checked={maskAmounts}
              onClick={toggleMaskAmounts}
              className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${maskAmounts ? 'bg-hisaabAccent-button' : 'bg-bg-hover'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maskAmounts ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>

        {/* Actions */}
        <section>
          <p className="text-caption text-hisaabText-secondary uppercase tracking-wide px-1 mb-2">Account</p>
          <div className="bg-bg-card rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-4 text-hisaabAccent-negative active:bg-bg-hover transition-colors"
            >
              <LogOut size={18} />
              <span className="text-body">Sign out</span>
            </button>
          </div>
        </section>
      </main>

      <ConfirmSheet
        open={confirmOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your books."
        confirmLabel="Sign out"
        variant="danger"
        onConfirm={handleSignOut}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
