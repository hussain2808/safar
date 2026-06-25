import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/modules/amaanat/lib/categories';
import type { ItemWithStatus } from '@/modules/amaanat/features/items/hooks/useItems';

interface CategoryOverviewProps {
  items: ItemWithStatus[];
}

export function CategoryOverview({ items }: CategoryOverviewProps) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-body text-text-primary">By Category</h2>
        <button onClick={() => navigate('/amaanat/items')} className="text-caption-md text-brown font-semibold">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const count = items.filter((i) => i.category === id).length;
          return (
            <button
              key={id}
              onClick={() => navigate(`/amaanat/items?category=${id}`)}
              className="flex-shrink-0 w-[88px] bg-card-bg rounded-card shadow-card p-3 flex flex-col items-center text-center active:scale-[0.98] transition-transform duration-100"
            >
              <div className="w-9 h-9 rounded-full bg-icon-bg flex items-center justify-center text-text-secondary mb-2">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <p className="text-[12.5px] text-text-primary leading-tight">{label}</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
