import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useMemories, getPeople } from '@/modules/nazara/features/memories/hooks/useMemories';
import { createMemory } from '@/modules/nazara/db/memories';
import { savePhoto } from '@/modules/nazara/db/photos';
import type { CategoryType } from '@/modules/nazara/types';

const CATEGORIES: { value: CategoryType; icon: string; label: string }[] = [
  { value: 'graduation', icon: '🎓', label: 'Education' },
  { value: 'plant', icon: '🌱', label: 'Nature' },
  { value: 'car', icon: '🚗', label: 'Vehicle' },
  { value: 'home', icon: '🏠', label: 'Home' },
  { value: 'travel', icon: '✈️', label: 'Travel' },
  { value: 'birthday', icon: '🎂', label: 'Birthday' },
  { value: 'wedding', icon: '💍', label: 'Wedding' },
  { value: 'baby', icon: '👶', label: 'Baby' },
  { value: 'work', icon: '💼', label: 'Work' },
  { value: 'camping', icon: '⛺', label: 'Camping' },
  { value: 'family', icon: '👨‍👩‍👧', label: 'Family' },
  { value: 'other', icon: '⭐', label: 'Other' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#FEFCF9',
  border: '1px solid #F0E6D9',
  borderRadius: 12,
  color: '#3D2E1F',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
};

export default function AddMemory() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { memories } = useMemories();
  const existingPeople = useMemo(() => getPeople(memories), [memories]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'memory' | 'recurring'>('memory');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState('');
  const [category, setCategory] = useState<CategoryType>('other');
  const [notifyYearly, setNotifyYearly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - photos.length;
    const next = Array.from(files).slice(0, remaining);
    setPhotos((p) => [...p, ...next]);
    next.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
    setPhotoPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const addPerson = () => {
    const name = personInput.trim();
    if (name && !people.includes(name)) setPeople((p) => [...p, name]);
    setPersonInput('');
  };

  const removePerson = (name: string) => {
    setPeople((p) => p.filter((n) => n !== name));
  };

  const handleSubmit = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);

    try {
      const photoIds: string[] = [];
      for (const file of photos) {
        const result = await savePhoto(file);
        if (!result.ok) throw new Error(`Photo upload failed: ${result.error}`);
        photoIds.push(result.data.id);
      }

      const result = await createMemory({
        title: title.trim(),
        date: new Date(date).getTime(),
        type,
        notes: notes.trim() || undefined,
        photoIds,
        people,
        category,
        notifyYearly: type === 'recurring' ? true : notifyYearly,
        isFavorite: false,
      });
      if (!result.ok) throw new Error(`Save failed: ${result.error}`);

      navigate('/nazara');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDF8F3', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D2E1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <h1 className="nazara-serif" style={{ fontSize: 17, fontWeight: 700, color: '#3D2E1F' }}>New Memory</h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', backgroundColor: '#F3EBE0', borderRadius: 999, padding: 4 }}>
          {(['memory', 'recurring'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); if (t === 'recurring') setNotifyYearly(true); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                backgroundColor: type === t ? '#A67C52' : 'transparent',
                color: type === t ? '#fff' : '#8C7B6B',
              }}
            >
              {t === 'memory' ? 'Memory' : 'Recurring'}
            </button>
          ))}
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 6, display: 'block' }}>Title</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What happened?" required />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 6, display: 'block' }}>Date</label>
          <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 6, display: 'block' }}>Notes</label>
          <textarea
            style={{ ...inputStyle, resize: 'none' }}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note about this memory..."
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 8, display: 'block' }}>Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                  border: category === c.value ? '1.5px solid #A67C52' : '1px solid #F0E6D9',
                  backgroundColor: category === c.value ? 'rgba(166,124,82,0.08)' : '#FEFCF9',
                }}
              >
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontSize: 10, color: '#8C7B6B' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 8, display: 'block' }}>Photos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {photoPreviews.map((src, idx) => (
              <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%',
                    border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 80, height: 80, borderRadius: 12, border: '1.5px dashed #D8CBBA',
                  backgroundColor: '#FEFCF9', color: '#A67C52', fontSize: 24, cursor: 'pointer',
                }}
              >
                +
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8C7B6B', marginBottom: 8, display: 'block' }}>People</label>
          {people.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {people.map((p) => (
                <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: '#F3EBE0', borderRadius: 999, fontSize: 12, color: '#3D2E1F' }}>
                  {p}
                  <button onClick={() => removePerson(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C7B6B', fontSize: 13 }}>×</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={inputStyle}
              list="existing-people"
              value={personInput}
              onChange={(e) => setPersonInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } }}
              placeholder="Add a person"
            />
            <datalist id="existing-people">
              {existingPeople.map((p) => <option key={p} value={p} />)}
            </datalist>
            <button
              onClick={addPerson}
              style={{ padding: '0 18px', borderRadius: 12, border: '1px solid #F0E6D9', backgroundColor: '#FEFCF9', color: '#A67C52', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#3D2E1F' }}>Notify me yearly</span>
          <button
            onClick={() => setNotifyYearly((v) => !v)}
            disabled={type === 'recurring'}
            style={{
              width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
              backgroundColor: notifyYearly ? '#A67C52' : '#E8DDD2', position: 'relative',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff',
              position: 'absolute', top: 3, left: notifyYearly ? 21 : 3, transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FDECEC', border: '1px solid #F5C6C6', borderRadius: 12, color: '#D94545', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving || !title.trim()}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 999, border: 'none', cursor: saving || !title.trim() ? 'default' : 'pointer',
            backgroundColor: '#A67C52', color: '#fff', fontSize: 15, fontWeight: 600,
            opacity: saving || !title.trim() ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Memory'}
        </button>
      </div>
    </div>
  );
}
