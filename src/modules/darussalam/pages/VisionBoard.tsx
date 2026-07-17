import { Sparkles, Palette, X } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { TagEditor } from '@/modules/darussalam/shared/components/TagEditor';
import {
  useVisionBoard, updateVisionBoard, addVisionTag, removeVisionTag,
  addVisionColor, removeVisionColor, addVisionMaterial, removeVisionMaterial,
} from '@/modules/darussalam/features/vision/useVisionBoard';

export default function DarussalamVisionBoard() {
  const board = useVisionBoard();

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Vision Board</h1>
        <p className="text-sm text-text-secondary mt-1">The overall feel of Darussalam, in a few words and colors.</p>
      </div>

      <div className="px-5 mt-5 space-y-4">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
            <Sparkles size={14} className="text-text-secondary" /> Style
          </div>
          <input
            key={board?.styleName ?? 'style'}
            defaultValue={board?.styleName ?? ''}
            onBlur={(e) => updateVisionBoard({ styleName: e.target.value })}
            placeholder="e.g. Tropical Modern, Islamic Minimalism"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
            <Sparkles size={14} className="text-text-secondary" /> Words that describe our home
          </div>
          <TagEditor
            tags={board?.tags ?? []}
            onAdd={addVisionTag}
            onRemove={removeVisionTag}
            placeholder="e.g. Courtyard, Rain-friendly, Open"
          />
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
            <Palette size={14} className="text-text-secondary" /> Color Palette
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {(board?.colorPalette ?? []).map((hex) => (
              <button key={hex} onClick={() => removeVisionColor(hex)} className="w-9 h-9 rounded-full border border-card-border relative" style={{ background: hex }}>
                <X size={11} className="absolute inset-0 m-auto text-white drop-shadow" />
              </button>
            ))}
            <input
              type="color"
              onChange={(e) => addVisionColor(e.target.value)}
              className="w-9 h-9 rounded-full border border-dashed border-text-muted cursor-pointer bg-transparent"
            />
          </div>
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
            <Palette size={14} className="text-text-secondary" /> Signature Materials
          </div>
          <TagEditor
            tags={board?.materials ?? []}
            onAdd={addVisionMaterial}
            onRemove={removeVisionMaterial}
            placeholder="e.g. Wood, Rattan, Terracotta"
          />
        </div>
      </div>
    </div>
  );
}
