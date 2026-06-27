import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft, Plus, Cake } from 'lucide-react';
import { usePeople } from '@/family/hooks/usePeople';
import { PersonSheet } from '@/family/components/PersonSheet';
import { relationshipLabel } from '@/family/lib/relationships';
import { initials, avatarColors } from '@/family/lib/avatar';
import type { Person } from '@/family/types';

export default function Settings() {
  const navigate = useNavigate();
  const { people, isLoading } = usePeople();
  const [editing, setEditing] = useState<Person | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-2 pt-12 pb-4 flex items-center gap-2">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary">Settings</h1>
      </header>

      <main className="px-4 pb-12">
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-body text-text-primary">Family</h2>
              <p className="text-caption text-text-secondary mt-0.5">Who your documents and items belong to.</p>
            </div>
            <button onClick={() => setAdding(true)} className="w-9 h-9 rounded-full bg-indigo text-cream flex items-center justify-center flex-shrink-0" aria-label="Add family member">
              <Plus size={16} />
            </button>
          </div>

          {!isLoading && (
            <div className="space-y-2">
              {people.map((person) => {
                const colors = avatarColors(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => setEditing(person)}
                    className="w-full bg-card-bg rounded-card shadow-card p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform duration-100"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-caption-md font-semibold flex-shrink-0 ${colors.bg} ${colors.fg}`}>
                      {initials(person.name) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption-md text-text-primary truncate">{person.name}</p>
                      <p className="text-caption text-text-secondary">{relationshipLabel(person.relationship)}</p>
                    </div>
                    {person.dob && (
                      <div className="flex items-center gap-1 text-caption text-text-secondary flex-shrink-0">
                        <Cake size={12} />
                        {format(person.dob, 'd MMM')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {(adding || editing) && (
        <PersonSheet
          person={adding ? null : editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
