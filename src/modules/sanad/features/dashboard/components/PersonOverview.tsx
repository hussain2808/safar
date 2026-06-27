import { useNavigate } from 'react-router-dom';
import { usePeople } from '@/family/hooks/usePeople';
import { relationshipLabel } from '@/family/lib/relationships';
import { initials, avatarColors } from '@/family/lib/avatar';
import type { DocumentWithStatus } from '@/modules/sanad/features/documents/hooks/useDocuments';

interface PersonOverviewProps {
  documents: DocumentWithStatus[];
}

export function PersonOverview({ documents }: PersonOverviewProps) {
  const navigate = useNavigate();
  const { people } = usePeople();

  if (people.length <= 1) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-body font-semibold text-text-primary">By Person</h2>
        <button onClick={() => navigate('/sanad/documents')} className="text-caption-md text-indigo font-semibold">
          View All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {people.map((person) => {
          const count = documents.filter((d) => d.personId === person.id).length;
          const colors = avatarColors(person.id);
          return (
            <button
              key={person.id}
              onClick={() => navigate(`/sanad/documents?person=${person.id}`)}
              className="flex-shrink-0 w-[92px] bg-card-bg rounded-card shadow-card p-3 flex flex-col items-center text-center active:scale-[0.98] transition-transform duration-100"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 text-caption-md font-semibold ${colors.bg} ${colors.fg}`}>
                {initials(person.name) || '?'}
              </div>
              <p className="text-[12.5px] text-text-primary leading-tight truncate w-full">
                {person.relationship === 'self' ? relationshipLabel('self') : person.name}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
