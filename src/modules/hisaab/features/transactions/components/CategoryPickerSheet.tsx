import { Check, Plus } from 'lucide-react';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { CategoryIcon } from '@/modules/hisaab/lib/categoryIcons';
import type { Category } from '@/modules/hisaab/types';

interface CategoryPickerSheetProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  value?: string;
  onSelect: (categoryId: string | undefined) => void;
  onAddNew: () => void;
}

export function CategoryPickerSheet({ open, onClose, categories, value, onSelect, onAddNew }: CategoryPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Select Category">
      <div className="px-2 pt-2 pb-8 max-h-[70vh] overflow-y-auto">
        {categories.length === 0 ? (
          <p className="text-caption text-hisaabText-secondary px-5 py-4">No categories yet. Add your first one below.</p>
        ) : (
          categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-icon active:bg-bg-hover transition-colors"
            >
              <span className="w-9 h-9 rounded-icon bg-bg-icon flex items-center justify-center flex-shrink-0 text-hisaabText-secondary">
                <CategoryIcon iconId={c.icon} size={16} />
              </span>
              <span className="flex-1 text-body text-hisaabText-primary text-left truncate">{c.label}</span>
              {value === c.id && <Check size={18} className="text-hisaabAccent-button flex-shrink-0" />}
            </button>
          ))
        )}
        <button
          onClick={onAddNew}
          className="w-full flex items-center gap-3 px-3 py-3.5 mt-1 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
        >
          <Plus size={18} className="text-hisaabText-secondary" />
          New Category
        </button>
      </div>
    </BottomSheet>
  );
}
