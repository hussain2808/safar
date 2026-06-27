import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { categoryIcon } from '@/modules/amaanat/lib/categories';
import { WarrantyBadge } from '@/modules/amaanat/features/items/components/WarrantyBadge';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface ItemRowProps {
  item: ItemWithStatus;
}

export const ItemRow = memo(function ItemRow({ item }: ItemRowProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(item.category);

  return (
    <button
      onClick={() => navigate(`/amaanat/item/${item.id}`)}
      className="w-full flex items-center gap-3 py-4 px-4 bg-card-bg border-b border-card-border active:bg-icon-bg transition-colors duration-100 text-left"
    >
      <div className="w-9 h-9 rounded-icon bg-icon-bg flex items-center justify-center flex-shrink-0 text-text-secondary">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-text-primary truncate">{item.name}</p>
        <p className="text-caption text-text-secondary mt-0.5">
          {item.purchaseDate ? format(item.purchaseDate, 'd MMM yyyy') : 'No date'}
        </p>
      </div>
      <WarrantyBadge status={item.warrantyStatus} />
    </button>
  );
});
