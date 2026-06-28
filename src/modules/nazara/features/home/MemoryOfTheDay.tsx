import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@/modules/nazara/types';
import MemoryImage from '@/modules/nazara/shared/components/MemoryImage';
import { usePhotoUrl } from '@/modules/nazara/shared/hooks/usePhotoUrl';

interface Props {
  memory: MemoryRecord;
}

export default function MemoryOfTheDay({ memory }: Props) {
  const photo = usePhotoUrl(memory.photoIds[0]);

  return (
    <Link to={`/nazara/memory/${memory.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex',
          gap: 14,
          backgroundColor: '#fff',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ width: 110, height: 140, flexShrink: 0, position: 'relative' }}>
          {photo ? (
            <MemoryImage src={photo} alt={memory.title} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#F3EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              📝
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '14px 14px 14px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: 16, fontWeight: 500, color: '#3D2E1F', lineHeight: 1.3, marginBottom: 5 }}>
              {memory.title}
            </h3>
            {memory.notes && (
              <p style={{ fontSize: 12, color: '#B0A090', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>
                &ldquo;{memory.notes.length > 65 ? memory.notes.slice(0, 65) + '...' : memory.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
