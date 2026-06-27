import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/family/lib/utils';
import { RELATIONSHIPS, relationshipLabel } from '@/family/lib/relationships';
import { createPerson, updatePerson, deletePerson } from '@/family/db/people';
import { SELF_PERSON_ID } from '@/family/db';
import type { Person, Relationship } from '@/family/types';

interface PersonSheetProps {
  person: Person | null;
  onClose: () => void;
  onSaved?: (person: Person) => void;
}

const inputClass = 'w-full bg-cream rounded-button px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none border border-card-border focus:border-text-secondary transition-colors';
const labelClass = 'text-caption text-text-secondary mb-2 uppercase tracking-wide block';

export function PersonSheet({ person, onClose, onSaved }: PersonSheetProps) {
  const isSelf = person?.relationship === SELF_PERSON_ID || person?.id === SELF_PERSON_ID;
  const [name, setName] = useState(person?.name ?? '');
  const [dob, setDob] = useState(person?.dob ? new Date(person.dob).toISOString().slice(0, 10) : '');
  const [relationship, setRelationship] = useState<Relationship>(person?.relationship ?? 'spouse');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      relationship: isSelf ? ('self' as const) : relationship,
      dob: dob ? new Date(dob).getTime() : undefined,
    };

    if (person) {
      await updatePerson(person.id, payload);
      setSaving(false);
      onSaved?.({ ...person, ...payload });
    } else {
      const result = await createPerson(payload);
      setSaving(false);
      if (result.ok) onSaved?.(result.data);
    }
    onClose();
  }

  async function handleDelete() {
    if (!person) return;
    await deletePerson(person.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-card-bg rounded-t-card w-full max-w-md p-5 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-body font-semibold text-text-primary">{person ? 'Edit Family Member' : 'Add Family Member'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-icon-bg flex items-center justify-center text-text-secondary" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatima"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Relationship</label>
            {isSelf ? (
              <p className="text-body text-text-primary">{relationshipLabel('self')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setRelationship(id)}
                    className={cn(
                      'px-3 py-2 rounded-icon text-caption transition-colors',
                      relationship === id ? 'bg-indigo text-cream' : 'bg-icon-bg text-text-secondary',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full bg-indigo text-cream rounded-button py-4 text-body mt-6 shadow-button active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
        >
          {saving ? 'Saving…' : person ? 'Save Changes' : 'Add Family Member'}
        </button>

        {person && !isSelf && (
          <>
            {confirmingDelete ? (
              <div className="flex gap-2 mt-3">
                <button onClick={() => setConfirmingDelete(false)} className="flex-1 bg-icon-bg text-text-primary rounded-button py-2.5 text-caption-md">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 bg-accent-pink-bg text-accent-pink-fg rounded-button py-2.5 text-caption-md">
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="w-full text-accent-pink-fg text-caption-md mt-3 py-2">
                Remove family member
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
