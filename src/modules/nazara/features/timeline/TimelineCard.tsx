import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@/modules/nazara/types';
import CategoryIcon from '@/modules/nazara/shared/components/CategoryIcon';
import MemoryImage from '@/modules/nazara/shared/components/MemoryImage';
import { usePhotoUrl } from '@/modules/nazara/shared/hooks/usePhotoUrl';
import { formatDate } from '@/modules/nazara/lib/utils';

interface Props {
  memory: MemoryRecord;
  position: 'left' | 'right';
}

export default function TimelineCard({ memory, position }: Props) {
  const photo = usePhotoUrl(memory.photoIds[0]);
  const hasPhoto = !!photo;
  const isRight = position === 'right';

  return (
    <Link to={`/nazara/memory/${memory.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          borderRadius: 16,
          backgroundColor: '#FEFCF9',
          border: '1px solid #F0E6D9',
          padding: 12,
          flexDirection: isRight ? 'row-reverse' : 'row',
        }}
      >
        {hasPhoto && (
          <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <MemoryImage src={photo} alt={memory.title} borderRadius={12} />
          </div>
        )}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: isRight ? 'right' : 'left',
          }}
        >
          <p style={{ fontSize: 12, color: '#8C7B6B' }}>{formatDate(new Date(memory.date))}</p>
          <h3
            style={{
              fontWeight: 600,
              color: '#3D2E1F',
              fontSize: 14,
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {memory.title}
          </h3>
          {memory.notes && (
            <p
              style={{
                fontSize: 12,
                color: '#B0A090',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {memory.notes}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            order: isRight ? -1 : undefined,
          }}
        >
          <CategoryIcon category={memory.category} size="sm" />
        </div>
      </div>
    </Link>
  );
}
