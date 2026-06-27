import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { DocumentRow } from '@/modules/sanad/features/documents/components/DocumentRow';
import { CategoryFilterChips } from '@/modules/sanad/features/documents/components/CategoryFilterChips';
import { DocumentRowSkeleton } from '@/modules/sanad/shared/components/Skeleton';
import { EmptyState } from '@/modules/sanad/shared/components/EmptyState';
import { useDocuments } from '@/modules/sanad/features/documents/hooks/useDocuments';
import { usePeople } from '@/family/hooks/usePeople';
import { relationshipLabel } from '@/family/lib/relationships';
import { cn } from '@/modules/sanad/lib/utils';
import type { DocumentCategory } from '@/modules/sanad/types';

export default function Documents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { documents, attentionDocuments, isLoading } = useDocuments();
  const { people } = usePeople();
  const [category, setCategory] = useState<DocumentCategory | 'all'>(
    (searchParams.get('category') as DocumentCategory | null) ?? 'all',
  );
  const [personId, setPersonId] = useState<string>(searchParams.get('person') ?? 'all');
  const attentionOnly = searchParams.get('filter') === 'attention';

  const filtered = useMemo(() => {
    const base = attentionOnly ? attentionDocuments : documents;
    return base
      .filter((d) => category === 'all' || d.category === category)
      .filter((d) => personId === 'all' || d.personId === personId);
  }, [documents, attentionDocuments, attentionOnly, category, personId]);

  function personLabel(id: string): string {
    const person = people.find((p) => p.id === id);
    if (!person) return '';
    return person.relationship === 'self' ? relationshipLabel('self') : person.name;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-5 pt-6 pb-4 flex items-start gap-2">
        <button onClick={() => navigate('/sanad')} className="w-9 h-9 -ml-1.5 mt-0.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Sanad">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-serif text-page-title text-text-primary leading-tight">
            {attentionOnly ? 'Needs Attention' : 'All Documents'}
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            {attentionOnly ? 'Documents that are expired or expiring soon' : 'Everything in your vault'}
          </p>
        </div>
      </header>

      {!attentionOnly && !!attentionDocuments.length && (
        <div className="px-4 mb-3">
          <div className="bg-accent-orange-bg rounded-card px-4 py-3 flex items-center gap-3">
            <AlertTriangle size={16} className="text-accent-orange-fg flex-shrink-0" />
            <p className="text-caption-md text-accent-orange-fg">
              {attentionDocuments.length} document{attentionDocuments.length === 1 ? '' : 's'} need{attentionDocuments.length === 1 ? 's' : ''} attention
            </p>
          </div>
        </div>
      )}

      <div className="mb-3">
        <CategoryFilterChips value={category} onChange={setCategory} />
      </div>

      {people.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1 mb-3">
          <button
            onClick={() => setPersonId('all')}
            className={cn(
              'px-3.5 py-2 rounded-full text-caption-md whitespace-nowrap transition-colors flex-shrink-0',
              personId === 'all' ? 'bg-indigo text-cream' : 'bg-card-bg text-text-secondary border border-card-border',
            )}
          >
            Everyone
          </button>
          {people.map((person) => (
            <button
              key={person.id}
              onClick={() => setPersonId(person.id)}
              className={cn(
                'px-3.5 py-2 rounded-full text-caption-md whitespace-nowrap transition-colors flex-shrink-0',
                personId === person.id ? 'bg-indigo text-cream' : 'bg-card-bg text-text-secondary border border-card-border',
              )}
            >
              {person.relationship === 'self' ? relationshipLabel('self') : person.name}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 px-4 pb-32 space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DocumentRowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState title="No documents found" description="Try a different filter, or add a new document." />
        ) : (
          filtered.map((document) => (
            <DocumentRow key={document.id} document={document} personLabel={personLabel(document.personId)} />
          ))
        )}
      </main>

      <div className="fixed bottom-8 inset-x-4">
        <button onClick={() => navigate('/sanad/document/new')} className="w-full bg-indigo text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100">
          + Add Document
        </button>
      </div>
    </div>
  );
}
