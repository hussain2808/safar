import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { DocumentRow } from '@/modules/sanad/features/documents/components/DocumentRow';
import { EmptyState } from '@/modules/sanad/shared/components/EmptyState';
import { DocumentRowSkeleton } from '@/modules/sanad/shared/components/Skeleton';
import { useDocuments } from '@/modules/sanad/features/documents/hooks/useDocuments';
import { categoryLabel } from '@/modules/sanad/lib/categories';
import { usePeople } from '@/family/hooks/usePeople';
import { relationshipLabel } from '@/family/lib/relationships';

export default function Search() {
  const navigate = useNavigate();
  const { documents, isLoading } = useDocuments();
  const { people } = usePeople();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const personLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const person of people) {
      map.set(person.id, person.relationship === 'self' ? relationshipLabel('self') : person.name);
    }
    return map;
  }, [people]);

  function personLabel(id: string): string {
    return personLabels.get(id) ?? '';
  }

  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return documents.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.documentNumber?.toLowerCase().includes(q) ||
      d.issuingAuthority?.toLowerCase().includes(q) ||
      categoryLabel(d.category).toLowerCase().includes(q) ||
      (personLabels.get(d.personId) ?? '').toLowerCase().includes(q),
    );
  }, [documents, query, personLabels]);

  const hasResults = results.length > 0;

  return (
    <div className="h-screen bg-cream flex flex-col">
      <header className="px-2 pt-12 pb-2 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 flex items-center bg-card-bg rounded-button px-4 py-2.5 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, categories, people…"
            className="flex-1 min-w-0 bg-transparent outline-none text-body text-text-primary placeholder:text-text-muted"
          />
          {hasQuery && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-text-secondary flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 space-y-2.5">
        {!hasQuery ? (
          <EmptyState title="Search your vault" description="Find documents by name, category, number, or person." />
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DocumentRowSkeleton key={i} />)
        ) : !hasResults ? (
          <EmptyState title="No results" description={`Nothing matches "${query.trim()}".`} />
        ) : (
          results.map((document) => (
            <DocumentRow key={document.id} document={document} personLabel={personLabel(document.personId)} />
          ))
        )}
      </div>
    </div>
  );
}
