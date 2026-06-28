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
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
};

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function TitleField({ value, onChange }: Props) {
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const improve = async () => {
    if (!value.trim() || improving || !auth.currentUser) return;
    setImproving(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(functionsUrl('improveTitle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: value }),
      });
      let data: { text?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error('Failed to improve title');
      }
      if (!res.ok || !data.text) throw new Error(data.error || 'Failed to improve title');
      onChange(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to improve title');
    } finally {
      setImproving(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Title *"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        required
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
        {error && <span style={{ fontSize: 11, color: '#D94545' }}>{error}</span>}
        <button
          type="button"
          onClick={improve}
          disabled={!value.trim() || improving}
          style={{
            border: 'none',
            background: 'transparent',
            color: !value.trim() || improving ? '#C9A882' : '#A67C52',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: !value.trim() || improving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 2px',
          }}
        >
          {improving ? (
            <>
              <span style={{ width: 12, height: 12, border: '2px solid #F0E6D9', borderTopColor: '#A67C52', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Improving...
            </>
          ) : (
            '✨ Improve title'
          )}
        </button>
      </div>
    </div>
  );
}
