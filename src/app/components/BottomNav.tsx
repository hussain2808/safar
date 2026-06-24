import { Home, Image, Wallet, Box, MapPin } from 'lucide-react';
import { bottomNavItems } from '../mockData';

const icons = {
  home: Home,
  nazara: Image,
  hisaab: Wallet,
  things: Box,
  journey: MapPin,
} as const;

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-card-border">
      <div className="flex items-center justify-between px-6 py-2">
        {bottomNavItems.map((item) => {
          const Icon = icons[item.key as keyof typeof icons];
          return (
            <button
              key={item.key}
              disabled={!item.enabled}
              className={`flex flex-col items-center gap-1 py-1 ${
                item.enabled ? 'text-brown' : 'text-text-muted opacity-50'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
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
