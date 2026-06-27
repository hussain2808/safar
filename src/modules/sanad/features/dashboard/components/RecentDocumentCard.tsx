import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { categoryIcon } from '@/modules/sanad/lib/categories';
import { cn } from '@/modules/sanad/lib/utils';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface RecentDocumentCardProps {
  document: DocumentWithStatus;
}

export const RecentDocumentCard = memo(function RecentDocumentCard({ document }: RecentDocumentCardProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(document.category);
  const chipBg = document.status === 'expired' ? 'bg-accent-pink-bg' : document.status === 'expiring_soon' ? 'bg-accent-orange-bg' : 'bg-accent-green-bg';
  const chipFg = document.status === 'expired' ? 'text-accent-pink-fg' : document.status === 'expiring_soon' ? 'text-accent-orange-fg' : 'text-accent-green-fg';

  return (
    <button
      onClick={() => navigate(`/sanad/document/${document.id}`)}
      className="flex-shrink-0 w-[170px] bg-card-bg rounded-card shadow-card p-3.5 text-left active:scale-[0.98] transition-transform duration-100"
    >
      <div className="w-9 h-9 rounded-icon bg-icon-bg flex items-center justify-center text-text-secondary mb-2.5">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <p className="text-caption-md text-text-primary truncate">{document.name}</p>
      <p className="text-[11px] text-text-secondary mt-0.5 truncate">{document.documentNumber ?? '—'}</p>
      {document.expiryDate && (
        <>
          <p className="text-[11px] text-text-secondary mt-1.5">Expiry: {format(document.expiryDate, 'd MMM yyyy')}</p>
          <span className={cn('inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full', chipBg, chipFg)}>
            {document.status === 'expired' ? 'Expired' : formatDistanceToNowStrict(document.expiryDate, { addSuffix: true })}
          </span>
        </>
      )}
    </button>
  );
});
