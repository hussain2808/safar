import { create } from 'zustand';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { syncOnLogin } from '@/modules/hisaab/sync/firestore';
import { retryPendingSync } from '@/modules/hisaab/sync/retryQueue';

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
      syncOnLogin(user.uid)
        .then(() => retryPendingSync(user.uid))
        .catch(console.error);
    }
  });

  window.addEventListener('online', () => {
    const u = useAuthStore.getState().user;
    if (u) retryPendingSync(u.uid).catch(console.error);
  });
}
