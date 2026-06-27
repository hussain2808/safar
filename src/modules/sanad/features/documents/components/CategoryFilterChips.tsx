import { cn } from '@/modules/sanad/lib/utils';
import { CATEGORIES } from '@/modules/sanad/lib/categories';
import type { DocumentCategory } from '@/modules/sanad/types';

interface CategoryFilterChipsProps {
  value: DocumentCategory | 'all';
  onChange: (value: DocumentCategory | 'all') => void;
}

export function CategoryFilterChips({ value, onChange }: CategoryFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
      <button
        onClick={() => onChange('all')}
        className={cn(
          'px-3.5 py-2 rounded-full text-caption-md whitespace-nowrap transition-colors flex-shrink-0',
          value === 'all' ? 'bg-indigo text-cream' : 'bg-card-bg text-text-secondary border border-card-border',
        )}
      >
        All
      </button>
      {CATEGORIES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-caption-md whitespace-nowrap transition-colors flex-shrink-0',
            value === id ? 'bg-indigo text-cream' : 'bg-card-bg text-text-secondary border border-card-border',
          )}
        >
          <Icon size={14} strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  );
}
