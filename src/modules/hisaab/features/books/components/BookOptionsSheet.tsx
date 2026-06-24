import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Download, Pencil, Tag, Trash2 } from 'lucide-react';
import { BottomSheet } from '@/modules/hisaab/shared/components/BottomSheet';
import { ConfirmSheet } from '@/modules/hisaab/shared/components/ConfirmSheet';
import { CategoryManagerSheet } from '@/modules/hisaab/features/categories/components/CategoryManagerSheet';
import { updateBook, deleteBook } from '@/modules/hisaab/db/books';
import { db } from '@/modules/hisaab/db';
import { exportBookToCsv } from '@/modules/hisaab/lib/exportCsv';
import type { Book } from '@/modules/hisaab/types';

interface BookOptionsSheetProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

export function BookOptionsSheet({ book, open, onClose }: BookOptionsSheetProps) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(book.name);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setRenaming(false); setName(book.name); }
  }, [open, book.name]);

  useEffect(() => {
    if (renaming) setTimeout(() => inputRef.current?.focus(), 50);
  }, [renaming]);

  async function handleRenameSave() {
    if (!name.trim() || busy) return;
    setBusy(true);
    await updateBook(book.id, { name: name.trim() });
    setBusy(false);
    onClose();
  }

  async function handleArchive() {
    if (busy) return;
    setBusy(true);
    await updateBook(book.id, { archived: true });
    setBusy(false);
    onClose();
    navigate('/hisaab');
  }

  async function handleExport() {
    const transactions = await db.transactions.where('bookId').equals(book.id).toArray();
    exportBookToCsv(book, transactions);
    onClose();
  }

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    await deleteBook(book.id);
    setBusy(false);
    onClose();
    navigate('/hisaab');
  }

  return (
    <>
    <BottomSheet open={open} onClose={onClose} title={renaming ? 'Rename Book' : 'Book Options'}>
      {renaming ? (
        <div className="px-5 pt-4 pb-8 space-y-5">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
            className="w-full bg-bg-primary rounded-button px-4 py-3 text-body text-hisaabText-primary outline-none border border-hisaabBorder-light focus:border-hisaabText-secondary transition-colors"
          />
          <button
            onClick={handleRenameSave}
            disabled={!name.trim() || busy}
            className="w-full bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button disabled:opacity-40 active:scale-[0.98] transition-transform duration-100"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="px-2 pt-2 pb-8">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
          >
            <Download size={18} className="text-hisaabText-secondary" />
            Export CSV
          </button>
          <button
            onClick={() => setRenaming(true)}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
          >
            <Pencil size={18} className="text-hisaabText-secondary" />
            Rename
          </button>
          <button
            onClick={() => { onClose(); setCategoriesOpen(true); }}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
          >
            <Tag size={18} className="text-hisaabText-secondary" />
            Manage Categories
          </button>
          <button
            onClick={handleArchive}
            disabled={busy}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-body text-hisaabText-primary active:bg-bg-hover rounded-icon transition-colors"
          >
            <Archive size={18} className="text-hisaabText-secondary" />
            Archive
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-body text-hisaabAccent-negative active:bg-bg-hover rounded-icon transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      )}
    </BottomSheet>

    <CategoryManagerSheet bookId={book.id} open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />

    <ConfirmSheet
      open={confirmDelete}
      onClose={() => setConfirmDelete(false)}
      onConfirm={handleDelete}
      title={`Delete "${book.name}"?`}
      description="All entries in this book will be permanently deleted. This cannot be undone."
      confirmLabel="Delete Book"
      variant="danger"
    />
    </>
  );
}
