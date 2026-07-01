import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { categoryIcon } from '@/modules/amaanat/lib/categories';
import { cn } from '@/modules/amaanat/lib/utils';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface UpcomingRemindersProps {
  reminders: ItemWithStatus[];
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  const navigate = useNavigate();

  if (!reminders.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-home-section-heading text-text-primary">Upcoming Reminders</h2>
        <button onClick={() => navigate('/amaanat/items?filter=attention')} className="text-caption-md text-brown font-semibold">
          View All
        </button>
      </div>
      <div className="px-4 space-y-2">
        {reminders.map((item) => {
          const Icon = categoryIcon(item.category);
          const chipBg = item.warrantyStatus === 'expired' ? 'bg-accent-pink-bg' : item.warrantyStatus === 'expiring_soon' ? 'bg-accent-orange-bg' : 'bg-accent-green-bg';
          const chipFg = item.warrantyStatus === 'expired' ? 'text-accent-pink-fg' : item.warrantyStatus === 'expiring_soon' ? 'text-accent-orange-fg' : 'text-accent-green-fg';
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/amaanat/item/${item.id}`)}
              className="w-full text-left bg-card-bg rounded-card shadow-card px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
            >
              <div className="w-10 h-10 rounded-icon bg-icon-bg flex items-center justify-center flex-shrink-0 text-text-secondary">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption-md text-text-primary truncate">{item.name}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Expires on {format(item.warrantyExpiry!, 'd MMM yyyy')}
                </p>
              </div>
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', chipBg, chipFg)}>
                {item.warrantyStatus === 'expired' ? 'Expired' : formatDistanceToNowStrict(item.warrantyExpiry!, { addSuffix: true })}
              </span>
              <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
