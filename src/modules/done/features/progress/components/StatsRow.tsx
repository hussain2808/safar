import { Flame, Trophy, TrendingUp, Target, type LucideIcon } from 'lucide-react';

export const STAT_ICONS = { Flame, Trophy, TrendingUp, Target };

interface StatItem {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
}

export function StatsRow({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {items.map((item, i) => (
        <div key={i}>
          <item.icon size={18} className="text-accent-doneGreen-fg mx-auto mb-1.5" />
          <p className="text-amount-md text-text-primary">{item.value}</p>
          <p className="text-caption text-text-secondary">{item.label}</p>
          {item.sublabel && <p className="text-caption text-text-secondary">{item.sublabel}</p>}
        </div>
      ))}
    </div>
  );
}
