import { nanoid } from 'nanoid';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { cn } from '@/modules/dua/lib/utils';
import type { ContentBlock, ContentBlockType } from '@/modules/dua/types';

const BLOCK_LABELS: Record<ContentBlockType, string> = {
  arabic: 'Arabic',
  transliteration: 'Transliteration',
  translation: 'Translation',
  reflection: 'Reflection',
  divider: 'Divider',
};

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  function addBlock(type: ContentBlockType) {
    onChange([...blocks, { id: nanoid(), type, text: type === 'divider' ? undefined : '' }]);
  }

  function updateBlock(id: string, text: string) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, text } : b)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="bg-icon-bg/60 rounded-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{BLOCK_LABELS[block.type]}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="Move up" className="p-1 text-text-secondary disabled:opacity-30">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label="Move down" className="p-1 text-text-secondary disabled:opacity-30">
                <ArrowDown size={14} />
              </button>
              <button onClick={() => removeBlock(block.id)} aria-label="Remove block" className="p-1 text-accent-pink-fg">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {block.type !== 'divider' && (
            <textarea
              value={block.text ?? ''}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder={
                block.type === 'arabic'
                  ? 'اكتب هنا…'
                  : block.type === 'transliteration'
                  ? 'Transliteration…'
                  : block.type === 'translation'
                  ? 'Translation…'
                  : 'A note to yourself…'
              }
              dir={block.type === 'arabic' ? 'rtl' : 'ltr'}
              rows={block.type === 'arabic' ? 2 : 2}
              className={cn(
                'w-full bg-card-bg rounded-icon px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted outline-none resize-none',
                block.type === 'arabic' && 'font-arabic text-xl text-right',
              )}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-1">
        {(Object.keys(BLOCK_LABELS) as ContentBlockType[]).map((type) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card-bg border border-card-border text-caption-md text-text-secondary"
          >
            <Plus size={13} />
            {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
