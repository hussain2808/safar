import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { categoryIcon } from '@/modules/amaanat/lib/categories';
import { usePhotoUrl } from '@/modules/amaanat/features/items/hooks/usePhotoUrl';
import { cn } from '@/modules/amaanat/lib/utils';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface RecentItemCardProps {
  item: ItemWithStatus;
}

export const RecentItemCard = memo(function RecentItemCard({ item }: RecentItemCardProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(item.category);
  const photoUrl = usePhotoUrl(item.photoIds[0]);
  const hasWarranty = item.warrantyStatus !== 'none';

  return (
    <button
      onClick={() => navigate(`/amaanat/item/${item.id}`)}
      className="flex-shrink-0 w-[150px] bg-card-bg rounded-card shadow-card overflow-hidden text-left active:scale-[0.98] transition-transform duration-100"
    >
      <div className="w-full h-[100px] bg-icon-bg flex items-center justify-center text-text-secondary overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} className="w-full h-full object-cover" />
        ) : (
          <Icon size={24} strokeWidth={1.5} />
        )}
      </div>
      <div className="p-3">
        <p className="text-caption-md text-text-primary truncate">{item.name}</p>
        <p className="text-[11px] text-text-secondary mt-0.5 truncate">
          {item.merchant ?? (item.purchaseDate ? format(item.purchaseDate, 'd MMM yyyy') : '—')}
        </p>
        <span
          className={cn(
            'inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            hasWarranty ? 'bg-accent-green-bg text-accent-green-fg' : 'bg-badge-bg text-text-secondary',
          )}
        >
          {hasWarranty ? 'Warranty Active' : 'No Warranty'}
        </span>
      </div>
    </button>
  );
});
