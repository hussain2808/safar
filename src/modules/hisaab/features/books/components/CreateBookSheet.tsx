import { useState, useRef, useEffect } from 'react';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { createBook } from '@/modules/hisaab/db/books';
import { cn } from '@/modules/hisaab/lib/utils';
import { BOOK_ICON_MAP } from '@/modules/hisaab/lib/bookIcons';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/modules/hisaab/lib/currencies';

const ICONS = Object.entries(BOOK_ICON_MAP).map(([id, Icon]) => ({ id, Icon }));

interface CreateBookSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBookSheet({ open, onClose }: CreateBookSheetProps) {
  const [name, setName] = useState('');
  const [iconId, setIconId] = useState('wallet');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
    else { setName(''); setIconId('wallet'); setCurrency(DEFAULT_CURRENCY); }
  }, [open]);

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const result = await createBook(name.trim(), iconId, currency);
    setSaving(false);
    if (result.ok) onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="New Book">
      <div className="px-5 pt-4 pb-8 space-y-5">
        {/* Icon picker */}
        <div>
          <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Icon</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setIconId(id)}
                className={cn(
                  'w-11 h-11 rounded-icon flex items-center justify-center transition-colors',
                  iconId === id ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText' : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div>
          <p className="text-caption text-hisaabText-secondary mb-2 uppercase tracking-wide">Name</p>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Home Construction"
            className="w-full bg-bg-primary rounded-button px-4 py-3 text-body text-hisaabText-primary placeholder:text-hisaabText-placeholder outline-none border border-hisaabBorder-light focus:border-hisaabText-secondary transition-colors"
          />
        </div>

        {/* Currency picker */}
        <div>
          <p className="text-caption text-hisaabText-secondary mb-2 uppercase tracking-wide">Currency</p>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-icon text-caption transition-colors',
                  currency === c.code
                    ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText'
                    : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                )}
              >
                <span className="font-sans">{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button disabled:opacity-40 active:scale-[0.98] transition-transform duration-100"
        >
          {saving ? 'Creating…' : 'Create Book'}
        </button>
      </div>
    </BottomSheet>
  );
}
