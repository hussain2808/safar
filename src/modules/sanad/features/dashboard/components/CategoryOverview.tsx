import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/modules/sanad/lib/categories';
import { cn } from '@/modules/sanad/lib/utils';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface CategoryOverviewProps {
  documents: DocumentWithStatus[];
}

export function CategoryOverview({ documents }: CategoryOverviewProps) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-body font-semibold text-text-primary">By Category</h2>
        <button onClick={() => navigate('/sanad/documents')} className="text-caption-md text-indigo font-semibold">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {CATEGORIES.map(({ id, label, icon: Icon, bg, fg }) => {
          const count = documents.filter((d) => d.category === id).length;
          return (
            <button
              key={id}
              onClick={() => navigate(`/sanad/documents?category=${id}`)}
              className="flex-shrink-0 w-[92px] bg-card-bg rounded-card shadow-card p-3 flex flex-col items-center text-center active:scale-[0.98] transition-transform duration-100"
            >
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center mb-2', bg, fg)}>
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
