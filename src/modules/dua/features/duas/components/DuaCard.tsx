import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { categoryIcon, categoryColors } from '@/modules/dua/lib/categories';
import { cn } from '@/modules/dua/lib/utils';
import { toggleFavorite } from '@/modules/dua/db/duas';
import type { Dua } from '@/modules/dua/types';

interface DuaCardProps {
  dua: Dua;
  meta?: string;
}

export const DuaCard = memo(function DuaCard({ dua, meta }: DuaCardProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon(dua.category);
  const colors = categoryColors(dua.category);

  return (
    <button
      onClick={() => navigate(`/dua/dua/${dua.id}`)}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-card-bg active:bg-icon-bg/60 transition-colors text-left"
    >
      <div className={cn('w-9 h-9 rounded-icon flex items-center justify-center flex-shrink-0', colors.bg, colors.fg)}>
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption-md text-text-primary truncate">{dua.title}</p>
        {meta && <p className="text-[11px] text-text-secondary mt-0.5">{meta}</p>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorite(dua.id, !dua.favorite); }}
        aria-label={dua.favorite ? 'Remove from favorites' : 'Add to favorites'}
        className="flex-shrink-0 p-1"
      >
        <Star size={18} className={dua.favorite ? 'fill-gold text-gold' : 'text-text-muted'} strokeWidth={1.5} />
      </button>
    </button>
  );
});
