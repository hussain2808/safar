import { cn } from '@/modules/dua/lib/utils';
import { CATEGORIES } from '@/modules/dua/lib/categories';
import { ContentBlockEditor } from '@/modules/dua/features/duas/components/ContentBlockEditor';
import type { Dua, DuaCategory, ContentBlock } from '@/modules/dua/types';

export interface DuaDraft {
  title: string;
  category: DuaCategory;
  contentBlocks: ContentBlock[];
  notes: string;
}

export function draftFromDua(dua: Dua | null): DuaDraft {
  return {
    title: dua?.title ?? '',
    category: dua?.category ?? 'personal',
    contentBlocks: dua?.contentBlocks ?? [],
    notes: dua?.notes ?? '',
  };
}

interface DuaFormProps {
  draft: DuaDraft;
  onChange: (draft: DuaDraft) => void;
}

const inputClass = 'w-full bg-cream rounded-button px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none border border-card-border focus:border-text-secondary transition-colors';
const labelClass = 'text-caption text-text-secondary mb-2 uppercase tracking-wide block';

export function DuaForm({ draft, onChange }: DuaFormProps) {
  function set<K extends keyof DuaDraft>(key: K, value: DuaDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Dua for Parents"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => set('category', id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-icon text-caption transition-colors',
                draft.category === id ? 'bg-brown text-cream' : 'bg-icon-bg text-text-secondary',
              )}
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Content</label>
        <ContentBlockEditor blocks={draft.contentBlocks} onChange={(contentBlocks) => set('contentBlocks', contentBlocks)} />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={draft.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          placeholder="Personal notes — when to read this, why it matters to you…"
          className={cn(inputClass, 'resize-none')}
        />
      </div>
    </div>
  );
}
