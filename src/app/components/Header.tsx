import { Search, Bell, Leaf } from 'lucide-react';

export function Header() {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <h1 className="font-serif text-2xl text-text-primary flex items-center gap-1">
          Safar
          <Leaf size={16} className="text-accent-green-fg rotate-12" />
        </h1>
        <p className="text-xs text-text-secondary">The story of your journey</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-icon-bg flex items-center justify-center">
          <Search size={18} className="text-text-secondary" />
        </button>
        <button className="w-9 h-9 rounded-full bg-icon-bg flex items-center justify-center">
          <Bell size={18} className="text-text-secondary" />
        </button>
        <div className="w-9 h-9 rounded-full bg-brown flex items-center justify-center text-white text-sm font-medium">
          H
        </div>
      </div>
    </div>
  );
}
