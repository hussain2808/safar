import { useNavigate } from 'react-router-dom';
import { RecentDocumentCard } from '@/modules/sanad/features/dashboard/components/RecentDocumentCard';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface RecentlyUpdatedProps {
  documents: DocumentWithStatus[];
}

export function RecentlyUpdated({ documents }: RecentlyUpdatedProps) {
  const navigate = useNavigate();
  const recent = documents.slice(0, 6);

  if (!recent.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-body text-text-primary">Recently Updated</h2>
        <button onClick={() => navigate('/sanad/documents')} className="text-caption-md text-indigo font-semibold">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {recent.map((document) => <RecentDocumentCard key={document.id} document={document} />)}
      </div>
    </section>
  );
}
