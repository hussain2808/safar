import { useNavigate } from 'react-router-dom';
import { RecentItemCard } from '@/modules/amaanat/features/dashboard/components/RecentItemCard';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface RecentlyAddedProps {
  items: ItemWithStatus[];
}

export function RecentlyAdded({ items }: RecentlyAddedProps) {
  const navigate = useNavigate();
  const recent = items.slice(0, 6);

  if (!recent.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-home-section-heading text-text-primary">Recently Added</h2>
        <button onClick={() => navigate('/amaanat/items')} className="text-caption-md text-brown font-semibold">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {recent.map((item) => <RecentItemCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
