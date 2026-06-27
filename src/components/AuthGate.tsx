import type { ReactNode } from 'react';
import { Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import SignIn from '@/pages/SignIn';

export function AuthGate({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <h1 className="font-serif text-module-name text-brown flex items-center gap-1 animate-pulse">
          Safar
          <Leaf size={16} className="text-accent-green-fg rotate-12 -mt-3" />
        </h1>
      </div>
    );
  }

  if (!user) return <SignIn />;

  return <>{children}</>;
}
