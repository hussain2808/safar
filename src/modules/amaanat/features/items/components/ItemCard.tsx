import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { categoryIcon, categoryLabel } from '@/modules/amaanat/lib/categories';
import { WarrantyBadge } from '@/modules/amaanat/features/items/components/WarrantyBadge';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface ItemCardProps {
  item: ItemWithStatus;
}

export const ItemCard = memo(function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(item.category);

  return (
    <button
      onClick={() => navigate(`/amaanat/item/${item.id}`)}
      className="w-full text-left bg-card-bg rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform duration-100"
    >
      <div className="relative w-11 h-11 rounded-icon bg-icon-bg flex items-center justify-center flex-shrink-0 text-text-secondary">
        <Icon size={18} strokeWidth={1.5} />
        {item.pendingSync && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-card-bg" aria-label="Not yet synced" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-text-primary truncate">{item.name}</p>
        <p className="text-caption text-text-secondary mt-0.5">
          {categoryLabel(item.category)}
          {item.purchaseDate ? ` · ${format(item.purchaseDate, 'd MMM yyyy')}` : ''}
        </p>
        <WarrantyBadge status={item.warrantyStatus} className="mt-1.5" />
      </div>
      <svg className="w-3.5 h-3.5 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
});
