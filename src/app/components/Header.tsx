import { Bell, Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const initial = user?.displayName?.charAt(0) ?? 'H';

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <h1 className="font-serif text-3xl text-brown flex items-center gap-1">
          Safar
          <Leaf size={16} className="text-accent-green-fg rotate-12 -mt-3" />
        </h1>
        <p className="text-xs text-text-secondary">The story of your journey</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-10 h-10 rounded-full bg-icon-bg flex items-center justify-center">
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500" />
        </button>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}
