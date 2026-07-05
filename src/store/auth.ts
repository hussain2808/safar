import { create } from 'zustand';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { syncOnLogin as syncHisaabOnLogin } from '@/modules/hisaab/sync/firestore';
import { retryPendingSync as retryHisaabSync } from '@/modules/hisaab/sync/retryQueue';
import { syncOnLogin as syncAmaanatOnLogin } from '@/modules/amaanat/sync/firestore';
import { retryPendingSync as retryAmaanatSync } from '@/modules/amaanat/sync/retryQueue';
import { syncOnLogin as syncSanadOnLogin } from '@/modules/sanad/sync/firestore';
import { retryPendingSync as retrySanadSync } from '@/modules/sanad/sync/retryQueue';
import { syncOnLogin as syncNazaraOnLogin } from '@/modules/nazara/sync/firestore';
import { retryPendingSync as retryNazaraSync } from '@/modules/nazara/sync/retryQueue';
import { syncOnLogin as syncDuaOnLogin } from '@/modules/dua/sync/firestore';
import { retryPendingSync as retryDuaSync } from '@/modules/dua/sync/retryQueue';
import { syncOnLogin as syncWishbookOnLogin } from '@/modules/wishbook/sync/firestore';
import { retryPendingSync as retryWishbookSync } from '@/modules/wishbook/sync/retryQueue';
import { syncOnLogin as syncFamilyOnLogin } from '@/family/sync/firestore';
import { retryPendingSync as retryFamilySync } from '@/family/sync/retryQueue';
import { ensureSelfSeeded } from '@/family/db/people';

interface AuthStore {
  user: User | null;
  authLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authLoading: true,

  signIn: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    set({ user: result.user });
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
  },
}));

export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ user, authLoading: false });
    if (user) {
      ensureSelfSeeded(user.displayName ?? 'Me')
        .then(() => Promise.all([
          syncHisaabOnLogin(user.uid), syncAmaanatOnLogin(user.uid), syncSanadOnLogin(user.uid), syncNazaraOnLogin(user.uid), syncDuaOnLogin(user.uid), syncWishbookOnLogin(user.uid), syncFamilyOnLogin(user.uid),
        ]))
        .then(() => Promise.all([
          retryHisaabSync(user.uid), retryAmaanatSync(user.uid), retrySanadSync(user.uid), retryNazaraSync(user.uid), retryDuaSync(user.uid), retryWishbookSync(user.uid), retryFamilySync(user.uid),
        ]))
        .catch(console.error);
    }
  });

  window.addEventListener('online', () => {
    const u = useAuthStore.getState().user;
    if (u) {
      retryHisaabSync(u.uid).catch(console.error);
      retryAmaanatSync(u.uid).catch(console.error);
      retrySanadSync(u.uid).catch(console.error);
      retryNazaraSync(u.uid).catch(console.error);
      retryDuaSync(u.uid).catch(console.error);
      retryWishbookSync(u.uid).catch(console.error);
      retryFamilySync(u.uid).catch(console.error);
    }
  });
}
