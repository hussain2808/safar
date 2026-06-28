import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { functionsUrl } from '@/modules/nazara/shared/lib/functionsUrl';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#FEFCF9',
  border: '1px solid #F0E6D9',
  borderRadius: 12,
  color: '#3D2E1F',
  fontSize: 16,
  outline: 'none',
  fontFamily: 'inherit',
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

export default function NotesField({ value, onChange, title }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!title.trim() || generating || !auth.currentUser) return;
    setGenerating(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(functionsUrl('generateNote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
      let data: { text?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error('Failed to generate note');
      }
      if (!res.ok || !data.text) throw new Error(data.error || 'Failed to generate note');
      onChange(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate note');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Notes (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'none' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
        {error && <span style={{ fontSize: 11, color: '#D94545' }}>{error}</span>}
        <button
          type="button"
          onClick={generate}
          disabled={!title.trim() || generating}
          style={{
            border: 'none',
            background: 'transparent',
            color: !title.trim() || generating ? '#C9A882' : '#A67C52',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: !title.trim() || generating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 2px',
          }}
        >
          {generating ? (
            <>
              <span style={{ width: 12, height: 12, border: '2px solid #F0E6D9', borderTopColor: '#A67C52', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Generating...
            </>
          ) : (
            '✨ Generate notes'
          )}
        </button>
      </div>
    </div>
  );
}
