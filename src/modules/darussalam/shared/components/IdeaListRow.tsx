import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { IdeaThumb } from '@/modules/darussalam/shared/components/IdeaThumb';
import { deleteIdea } from '@/modules/darussalam/features/ideas/hooks/useIdeas';

export function IdeaListRow({
  ideaId, title, subtitle, trailing, onOpen,
}: { ideaId: string; title: string; subtitle?: ReactNode; trailing?: ReactNode; onOpen: () => void }) {
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm('Delete this idea? This can\'t be undone.')) {
      await deleteIdea(ideaId);
    }
  }

  return (
    <div className="w-full flex items-center gap-3 py-3">
      <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-darussalam-tile flex items-center justify-center flex-shrink-0">
          <IdeaThumb ideaId={ideaId} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary line-clamp-1">{title}</h3>
          {subtitle}
        </div>
      </button>
      {trailing}
      <button onClick={handleDelete} aria-label="Delete idea" className="text-text-muted flex-shrink-0 p-1">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
