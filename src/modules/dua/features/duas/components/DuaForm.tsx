import { useState } from 'react';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/firebase';
import { cn } from '@/modules/dua/lib/utils';
import { CATEGORIES } from '@/modules/dua/lib/categories';
import { ContentBlockEditor } from '@/modules/dua/features/duas/components/ContentBlockEditor';
import { functionsUrl } from '@/modules/dua/lib/functionsUrl';
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
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  function set<K extends keyof DuaDraft>(key: K, value: DuaDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  async function generateDua() {
    if (!draft.title.trim() || generating || !auth.currentUser) return;
    setGenerating(true);
    setGenError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(functionsUrl('generateDua'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: draft.title }),
      });
      let data: { arabic?: string; translation?: string; error?: string };
      try { data = await res.json(); } catch { throw new Error('Failed to generate dua'); }
      if (!res.ok || !data.arabic || !data.translation) throw new Error(data.error ?? 'Failed to generate dua');
      const otherBlocks = draft.contentBlocks.filter((b) => b.type !== 'arabic' && b.type !== 'translation');
      onChange({
        ...draft,
        contentBlocks: [
          { id: nanoid(), type: 'arabic', text: data.arabic },
          { id: nanoid(), type: 'translation', text: data.translation },
          ...otherBlocks,
        ],
      });
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate dua');
    } finally {
      setGenerating(false);
    }
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption text-text-secondary uppercase tracking-wide">Content</span>
          <div className="flex items-center gap-2">
            {genError && <span className="text-[11px] text-red-500">{genError}</span>}
            <button
              type="button"
              onClick={generateDua}
              disabled={!draft.title.trim() || generating}
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-brown disabled:text-brown/40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <span className="w-3 h-3 border-2 border-card-border border-t-brown rounded-full animate-spin inline-block" />
                  Generating...
                </>
              ) : (
                '✨ Generate Dua'
              )}
            </button>
          </div>
        </div>
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
