import { Files, ShieldCheck, CalendarClock, AlertCircle } from 'lucide-react';
import { cn } from '@/modules/sanad/lib/utils';

interface StatsGridProps {
  stats: {
    total: number;
    valid: number;
    expiringSoon: number;
    expired: number;
  };
}

const CELLS = [
  { key: 'total', label: 'Total Documents', caption: 'All your documents', icon: Files, bg: 'bg-accent-blue-bg', fg: 'text-accent-blue-fg' },
  { key: 'valid', label: 'Valid Documents', caption: 'Currently valid', icon: ShieldCheck, bg: 'bg-accent-green-bg', fg: 'text-accent-green-fg' },
  { key: 'expiringSoon', label: 'Expiring Soon', caption: 'Next 90 days', icon: CalendarClock, bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { key: 'expired', label: 'Expired', caption: 'Need attention', icon: AlertCircle, bg: 'bg-accent-pink-bg', fg: 'text-accent-pink-fg' },
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
