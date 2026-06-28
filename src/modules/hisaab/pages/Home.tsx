import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ListFilter, Search, Settings, BookOpen, Upload } from 'lucide-react';
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
      <header className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button onClick={() => navigate('/')} className="w-9 h-9 -ml-1.5 mt-0.5 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors flex-shrink-0" aria-label="Back to Safar">
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-caption text-hisaabText-secondary">{getGreeting()},</p>
            <h1 className="font-serif text-page-title text-hisaabText-primary mt-0.5 leading-tight flex items-center gap-2">
              {firstName} <span className="text-[22px]">🌿</span>
            </h1>
            <p className="text-caption text-hisaabText-secondary mt-1">Here's your books 🤎</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors disabled:opacity-50" aria-label="Import CSV">
            <Upload size={16} />
          </button>
          <button onClick={() => navigate('/hisaab/search')} className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors" aria-label="Search">
            <Search size={17} />
          </button>
          <button onClick={() => navigate('/hisaab/settings')} className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors" aria-label="Settings">
            <Settings size={17} />
          </button>
        </div>
      </header>
      {books.length > 0 && (
        <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-body text-hisaabText-primary">My Books</h2>
            <p className="text-caption text-hisaabText-secondary mt-0.5">All your accounts and categories in one place.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="rounded-full bg-bg-card shadow-card px-3 py-1.5 text-caption text-hisaabText-secondary flex items-center gap-1" aria-label="Filter books">
              All Books <ChevronDown size={14} />
            </button>
            <button className="w-8 h-8 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary" aria-label="Sort books">
              <ListFilter size={15} />
            </button>
          </div>
        </div>
      )}
      <main className="flex-1 px-4 pb-32 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BookCardSkeleton key={i} />)
        ) : books.length === 0 ? (
          <EmptyState title="No books yet" description="Create your first book to start tracking money." />
        ) : (
          books.map((book, i) => <BookCard key={book.id} book={book} index={i} />)
        )}
      </main>
      <div className="fixed bottom-20 inset-x-4">
        <button onClick={() => setCreateOpen(true)} className="w-full bg-bg-card shadow-card rounded-card pl-3 pr-2 py-2 flex items-center gap-2 text-left active:scale-[0.98] transition-transform duration-100">
          <div className="w-10 h-10 rounded-icon bg-bg-icon flex items-center justify-center flex-shrink-0 text-hisaabText-secondary">
            <BookOpen size={18} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body text-hisaabText-primary truncate">Create a new book</p>
            <p className="text-caption text-hisaabText-secondary mt-0.5 truncate">Track an account or category</p>
          </div>
          <span className="bg-hisaabAccent-button text-hisaabAccent-buttonText rounded-button px-3 py-2.5 text-caption-md whitespace-nowrap flex-shrink-0">
            {importing ? 'Importing…' : '+ New Book'}
          </span>
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
      <CreateBookSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
