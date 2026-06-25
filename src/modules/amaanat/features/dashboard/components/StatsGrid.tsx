import { Package, ShieldCheck, Receipt, AlertTriangle } from 'lucide-react';
import { cn } from '@/modules/amaanat/lib/utils';

interface StatsGridProps {
  stats: {
    totalItems: number;
    underWarranty: number;
    receiptsCount: number;
    expiringSoonCount: number;
  };
}

const CELLS = [
  { key: 'totalItems', label: 'Total Items', caption: 'In your vault', icon: Package, bg: 'bg-accent-blue-bg', fg: 'text-accent-blue-fg' },
  { key: 'underWarranty', label: 'Under Warranty', caption: 'Protected', icon: ShieldCheck, bg: 'bg-accent-green-bg', fg: 'text-accent-green-fg' },
  { key: 'receiptsCount', label: 'Receipts', caption: 'Saved', icon: Receipt, bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { key: 'expiringSoonCount', label: 'Expiring Soon', caption: 'Needs attention', icon: AlertTriangle, bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
] as const;

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {CELLS.map(({ key, label, caption, icon: Icon, bg, fg }) => (
        <div key={key} className="bg-card-bg rounded-card shadow-card p-4">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center mb-3', bg, fg)}>
            <Icon size={16} strokeWidth={1.5} />
          </div>
          <p className="text-[22px] font-semibold text-text-primary leading-none">{stats[key]}</p>
          <p className="text-caption-md text-text-primary mt-1.5">{label}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{caption}</p>
        </div>
      ))}
    </div>
  );
}
