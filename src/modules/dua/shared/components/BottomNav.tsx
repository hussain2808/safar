import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Search, MoreHorizontal } from 'lucide-react';
import { cn } from '@/modules/dua/lib/utils';

const TABS = [
  { key: 'home', label: 'Home', path: '/dua', icon: Home },
  { key: 'duas', label: 'My Duas', path: '/dua/duas', icon: BookOpen },
  { key: 'search', label: 'Search', path: '/dua/search', icon: Search },
  { key: 'more', label: 'More', path: '/dua/more', icon: MoreHorizontal },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-card-border z-30">
      <div className="flex items-center justify-between px-6 py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={cn('flex flex-col items-center gap-1 py-1 flex-1', active ? 'text-brown' : 'text-text-muted')}
            >
              <tab.icon size={20} strokeWidth={1.5} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 rounded-full bg-text-muted/40" />
      </div>
    </div>
  );
}
