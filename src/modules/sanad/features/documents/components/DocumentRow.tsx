import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { categoryIcon, categoryLabel, categoryColors } from '@/modules/sanad/lib/categories';
import { cn } from '@/modules/sanad/lib/utils';
import { StatusBadge } from '@/modules/sanad/features/documents/components/StatusBadge';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface DocumentRowProps {
  document: DocumentWithStatus;
  personLabel?: string;
}

export const DocumentRow = memo(function DocumentRow({ document, personLabel }: DocumentRowProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(document.category);
  const colors = categoryColors(document.category);

  return (
    <button
      onClick={() => navigate(`/sanad/document/${document.id}`)}
      className="w-full text-left bg-card-bg rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
    >
      <div className={cn('w-11 h-11 rounded-icon flex items-center justify-center flex-shrink-0', colors.bg, colors.fg)}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-text-primary truncate">{document.name}</p>
        <p className="text-caption text-text-secondary mt-0.5 truncate">
          {categoryLabel(document.category)}
          {personLabel ? ` · ${personLabel}` : ''}
          {document.expiryDate ? ` · ${format(document.expiryDate, 'd MMM yyyy')}` : ''}
        </p>
        <StatusBadge status={document.status} className="mt-1.5" />
      </div>
      <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
    </button>
  );
});
