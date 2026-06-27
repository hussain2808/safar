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
import { ensureSelfSeeded } from '@/family/db';

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
      ensureSelfSeeded(user.displayName ?? 'Me').catch(console.error);
      Promise.all([syncHisaabOnLogin(user.uid), syncAmaanatOnLogin(user.uid), syncSanadOnLogin(user.uid)])
        .then(() => Promise.all([retryHisaabSync(user.uid), retryAmaanatSync(user.uid), retrySanadSync(user.uid)]))
        .catch(console.error);
    }
  });

  window.addEventListener('online', () => {
    const u = useAuthStore.getState().user;
    if (u) {
      retryHisaabSync(u.uid).catch(console.error);
      retryAmaanatSync(u.uid).catch(console.error);
      retrySanadSync(u.uid).catch(console.error);
    }
  });
}
