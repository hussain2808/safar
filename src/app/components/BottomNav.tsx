import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Shield, FileCheck2 } from 'lucide-react';
import { bottomNavItems } from '../mockData';

const icons = {
  home: Home,
  hisaab: Wallet,
  amaanat: Shield,
  sanad: FileCheck2,
} as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-card-border">
      <div className="flex items-center justify-between px-6 py-2">
        {bottomNavItems.map((item) => {
          const Icon = icons[item.key as keyof typeof icons];
          const active = pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 ${active ? 'text-brown' : 'text-text-muted'}`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 rounded-full bg-text-muted/40" />
      </div>
    </div>
  );
}
