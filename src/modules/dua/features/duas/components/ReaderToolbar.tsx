import { useState } from 'react';
import { List, Bookmark, Type, Settings2, X } from 'lucide-react';
import { cn } from '@/modules/dua/lib/utils';
import type { FontScale } from '@/modules/dua/features/duas/components/ContentBlockView';

interface VerseSummary {
  number: number;
  preview: string;
}

interface ReaderToolbarProps {
  verses: VerseSummary[];
  onJumpToVerse: (number: number) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  fontScale: FontScale;
  onCycleFontScale: () => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export function ReaderToolbar({
  verses,
  onJumpToVerse,
  favorite,
  onToggleFavorite,
  onCycleFontScale,
  showTransliteration,
  onToggleTransliteration,
  showTranslation,
  onToggleTranslation,
}: ReaderToolbarProps) {
  const [sheet, setSheet] = useState<'contents' | 'settings' | null>(null);

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 bg-card-bg border-t border-card-border px-6 py-3 flex items-center justify-between z-30">
        <ToolbarButton icon={List} label="Contents" onClick={() => setSheet('contents')} disabled={verses.length === 0} />
        <ToolbarButton icon={Bookmark} label="Bookmark" active={favorite} onClick={onToggleFavorite} />
        <ToolbarButton icon={Type} label="Aa" onClick={onCycleFontScale} />
        <ToolbarButton icon={Settings2} label="Settings" onClick={() => setSheet('settings')} />
      </div>

      {sheet && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end" onClick={() => setSheet(null)}>
          <div className="bg-card-bg rounded-t-card w-full max-h-[70vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-caption-md text-text-primary font-medium">
                {sheet === 'contents' ? 'Contents' : 'Reading Settings'}
              </h2>
              <button onClick={() => setSheet(null)} aria-label="Close" className="text-text-secondary">
                <X size={18} />
              </button>
            </div>

            {sheet === 'contents' ? (
              <div className="space-y-1">
                {verses.map((v) => (
                  <button
                    key={v.number}
                    onClick={() => { onJumpToVerse(v.number); setSheet(null); }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-icon text-left active:bg-icon-bg/60"
                  >
                    <span className="w-6 h-6 rounded-full bg-icon-bg text-text-secondary text-[11px] flex items-center justify-center flex-shrink-0">
                      {v.number}
                    </span>
                    <span className="text-caption-md text-text-primary truncate">{v.preview || `Verse ${v.number}`}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <SettingsRow label="Show transliteration" checked={showTransliteration} onToggle={onToggleTransliteration} />
                <SettingsRow label="Show translation" checked={showTranslation} onToggle={onToggleTranslation} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ToolbarButton({
  icon: Icon, label, onClick, active, disabled,
}: { icon: typeof List; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn('flex flex-col items-center gap-1 px-2 py-1 disabled:opacity-30', active ? 'text-brown' : 'text-text-secondary')}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function SettingsRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-2 py-2.5 rounded-icon active:bg-icon-bg/60">
      <span className="text-caption-md text-text-primary">{label}</span>
      <span className={cn('w-10 h-6 rounded-full flex items-center px-0.5 transition-colors', checked ? 'bg-brown justify-end' : 'bg-card-border justify-start')}>
        <span className="w-5 h-5 rounded-full bg-cream" />
      </span>
    </button>
  );
}
