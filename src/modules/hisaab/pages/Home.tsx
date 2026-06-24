import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Upload } from 'lucide-react';
import { BookCard } from '@/modules/hisaab/features/books/components/BookCard';
import { CreateBookSheet } from '@/modules/hisaab/features/books/components/CreateBookSheet';
import { BookCardSkeleton } from '@/modules/hisaab/shared/components/Skeleton';
import { EmptyState } from '@/modules/hisaab/shared/components/EmptyState';
import { useBooks } from '@/modules/hisaab/features/books/hooks/useBooks';
import { useAuthStore } from '@/store/auth';
import { parseCashbookCsv } from '@/modules/hisaab/lib/importCsv';
import { importBookWithTransactions } from '@/modules/hisaab/db/import';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home() {
  const navigate = useNavigate();
  const { books, isLoading } = useBooks();
  const user = useAuthStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameParts = user?.displayName?.split(' ') ?? [];
  const firstName = (nameParts.length > 1 ? nameParts[1] : nameParts[0]) || 'there';

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    try {
      const text = await file.text();
      const { book, transactions, categories } = parseCashbookCsv(text, file.name);
      await importBookWithTransactions(book, transactions, categories);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="px-5 pt-14 pb-4 flex items-start justify-between">
        <div>
          <p className="text-caption text-hisaabText-secondary">{getGreeting()},</p>
          <h1 className="font-serif text-[30px] font-bold text-hisaabText-primary mt-0.5 leading-tight flex items-center gap-2">
            {firstName} <span className="text-[22px]">🌿</span>
          </h1>
          <p className="text-caption text-hisaabText-secondary mt-1">Here's your books 🤎</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => navigate('/hisaab/search')} className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors" aria-label="Search">
            <Search size={17} />
          </button>
          <button onClick={() => navigate('/hisaab/settings')} className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors" aria-label="Settings">
            <Settings size={17} />
          </button>
        </div>
      </header>
      <main className="flex-1 px-4 pb-32 space-y-3 pt-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BookCardSkeleton key={i} />)
        ) : books.length === 0 ? (
          <EmptyState title="No books yet" description="Create your first book to start tracking money." />
        ) : (
          books.map((book) => <BookCard key={book.id} book={book} />)
        )}
      </main>
      <div className="fixed bottom-8 inset-x-4 flex gap-3">
        <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="w-12 h-12 shrink-0 bg-bg-card shadow-card rounded-button flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors disabled:opacity-50" aria-label="Import CSV">
          <Upload size={18} />
        </button>
        <button onClick={() => setCreateOpen(true)} className="flex-1 bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100">
          {importing ? 'Importing…' : '+ New Book'}
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
      <CreateBookSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
