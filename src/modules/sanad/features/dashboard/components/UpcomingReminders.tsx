import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { categoryIcon } from '@/modules/sanad/lib/categories';
import { cn } from '@/modules/sanad/lib/utils';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface UpcomingRemindersProps {
  reminders: DocumentWithStatus[];
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  const navigate = useNavigate();

  if (!reminders.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-body text-text-primary">Upcoming Reminders</h2>
        <button onClick={() => navigate('/sanad/documents?filter=attention')} className="text-caption-md text-indigo font-semibold">
          View All
        </button>
      </div>
      <div className="px-4 space-y-2">
        {reminders.map((doc) => {
          const Icon = categoryIcon(doc.category);
          const chipBg = doc.status === 'expired' ? 'bg-accent-pink-bg' : doc.status === 'expiring_soon' ? 'bg-accent-orange-bg' : 'bg-accent-green-bg';
          const chipFg = doc.status === 'expired' ? 'text-accent-pink-fg' : doc.status === 'expiring_soon' ? 'text-accent-orange-fg' : 'text-accent-green-fg';
          return (
            <button
              key={doc.id}
              onClick={() => navigate(`/sanad/document/${doc.id}`)}
              className="w-full text-left bg-card-bg rounded-card shadow-card px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
            >
              <div className="w-10 h-10 rounded-icon bg-icon-bg flex items-center justify-center flex-shrink-0 text-text-secondary">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption-md text-text-primary truncate">{doc.name}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {doc.status === 'expired' ? 'Expired on' : 'Expires on'} {format(doc.expiryDate!, 'd MMM yyyy')}
                </p>
              </div>
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', chipBg, chipFg)}>
                {doc.status === 'expired' ? 'Expired' : formatDistanceToNowStrict(doc.expiryDate!, { addSuffix: true })}
              </span>
              <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
