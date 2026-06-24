import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth';
import SignIn from '@/pages/SignIn';

export function AuthGate({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <h1 className="font-serif text-3xl text-text-primary animate-pulse">Safar</h1>
      </div>
    );
  }

  if (!user) return <SignIn />;

  return <>{children}</>;
}
