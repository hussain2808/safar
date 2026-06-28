import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/modules/dua/lib/utils';
import type { DuaCategory } from '@/modules/dua/types';

interface CollectionCardProps {
  category: DuaCategory;
  label: string;
  description: string;
  icon: typeof ChevronRight;
  bg: string;
  fg: string;
  wide?: boolean;
}

export function CollectionCard({ category, label, description, icon: Icon, bg, fg, wide }: CollectionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/dua/duas?category=${category}`)}
      className={cn(
        'rounded-card p-4 text-left flex items-center gap-3 active:scale-[0.98] transition-transform duration-100',
        bg,
        wide ? 'w-full' : '',
      )}
    >
      <div className={cn('w-11 h-11 rounded-icon bg-card-bg flex items-center justify-center flex-shrink-0', fg)}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption-md font-semibold text-text-primary">{label}</p>
        <p className="text-[11px] text-text-secondary leading-snug mt-0.5">{description}</p>
      </div>
      {wide && <ChevronRight size={16} className="text-text-secondary flex-shrink-0" />}
    </button>
  );
}
