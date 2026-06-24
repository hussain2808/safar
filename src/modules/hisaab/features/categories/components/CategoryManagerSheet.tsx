import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { ConfirmSheet } from '@/modules/hisaab/shared/components/ConfirmSheet';
import { createCategory, updateCategory, deleteCategory } from '@/modules/hisaab/db/categories';
import { useCategories } from '@/modules/hisaab/features/categories/hooks/useCategories';
import { CATEGORY_ICON_IDS, CategoryIcon } from '@/modules/hisaab/lib/categoryIcons';
import { cn } from '@/modules/hisaab/lib/utils';
import type { Category } from '@/modules/hisaab/types';

interface CategoryManagerSheetProps {
  bookId: string;
  open: boolean;
  onClose: () => void;
  startAdding?: boolean;
  onCreated?: (category: Category) => void;
}

export function CategoryManagerSheet({ bookId, open, onClose, startAdding, onCreated }: CategoryManagerSheetProps) {
  const { categories } = useCategories(bookId);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICON_IDS[0]);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (open && startAdding) {
      setLabel('');
      setIcon(CATEGORY_ICON_IDS[0]);
      setAdding(true);
    } else if (!open) {
      setEditing(null);
      setAdding(false);
      setDeleteError(null);
    }
  }, [open, startAdding]);

  function startAdd() {
    setLabel('');
    setIcon(CATEGORY_ICON_IDS[0]);
    setAdding(true);
  }

  function startEdit(category: Category) {
    setLabel(category.label);
    setIcon(category.icon);
    setEditing(category);
  }

  async function handleSave() {
    if (!label.trim() || busy) return;
    setBusy(true);
    if (editing) {
      const result = await updateCategory(editing.id, { label: label.trim(), icon });
      setBusy(false);
      if (result.ok) { setAdding(false); setEditing(null); }
      return;
    }
    const result = await createCategory(bookId, label.trim(), icon);
    setBusy(false);
    if (result.ok) {
      setAdding(false);
      onCreated?.(result.data);
    }
  }

  async function handleDelete() {
    if (!pendingDelete || busy) return;
    setBusy(true);
    const result = await deleteCategory(pendingDelete.id);
    setBusy(false);
    setPendingDelete(null);
    setDeleteError(result.ok ? null : result.error);
  }

  const formOpen = adding || editing !== null;

  return (
    <>
    <BottomSheet open={open} onClose={onClose} title={formOpen ? (editing ? 'Edit Category' : 'New Category') : 'Manage Categories'}>
      {formOpen ? (
        <div className="px-5 pt-4 pb-8 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <p className="text-caption text-hisaabText-secondary mb-3 uppercase tracking-wide">Icon</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setIcon(id)}
                  className={cn(
                    'w-11 h-11 rounded-icon flex items-center justify-center transition-colors',
                    icon === id ? 'bg-hisaabAccent-button text-hisaabAccent-buttonText' : 'bg-bg-icon text-hisaabText-secondary active:bg-bg-hover',
                  )}
                >
                  <CategoryIcon iconId={id} size={18} />
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Fuel"
            className="w-full bg-bg-primary rounded-button px-4 py-3 text-body text-hisaabText-primary placeholder:text-hisaabText-placeholder outline-none border border-hisaabBorder-light focus:border-hisaabText-secondary transition-colors"
          />

          <button
            onClick={handleSave}
            disabled={!label.trim() || busy}
            className="w-full bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button disabled:opacity-40 transition-opacity active:scale-[0.98] transition-transform duration-100"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="px-2 pt-2 pb-8 max-h-[70vh] overflow-y-auto">
          {deleteError && (
            <p className="text-caption text-hisaabAccent-negative px-5 py-2">{deleteError}</p>
          )}
          {categories.length === 0 ? (
            <p className="text-caption text-hisaabText-secondary px-5 py-4">No categories yet. Add your first one below.</p>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="w-full flex items-center gap-3 px-3 py-3 rounded-icon">
                <span className="w-8 h-8 rounded-icon bg-bg-icon flex items-center justify-center flex-shrink-0 text-hisaabText-secondary">
                  <CategoryIcon iconId={c.icon} size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-hisaabText-primary truncate">{c.label}</p>
                </div>
                <button onClick={() => startEdit(c)} className="w-9 h-9 flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover rounded-icon transition-colors" aria-label="Edit category">
                  <Pencil size={16} />
                </button>
                <button onClick={() => { setDeleteError(null); setPendingDelete(c); }} className="w-9 h-9 flex items-center justify-center text-hisaabAccent-negative active:bg-bg-hover rounded-icon transition-colors" aria-label="Delete category">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          <button
            onClick={startAdd}
            className="w-full flex items-center gap-3 px-3 py-3.5 mt-1 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
          >
            <Plus size={18} className="text-hisaabText-secondary" />
            Add Category
          </button>
        </div>
      )}
    </BottomSheet>

    <ConfirmSheet
      open={pendingDelete !== null}
      onClose={() => setPendingDelete(null)}
      onConfirm={handleDelete}
      title={pendingDelete ? `Delete "${pendingDelete.label}"?` : ''}
      description="This category will be permanently removed."
      confirmLabel="Delete"
      variant="danger"
    />
    </>
  );
}
