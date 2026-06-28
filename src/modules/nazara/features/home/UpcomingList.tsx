import { Link } from 'react-router-dom';
import type { MemoryRecord } from '@/modules/nazara/types';
import CategoryIcon from '@/modules/nazara/shared/components/CategoryIcon';
import { getDaysUntilNextAnniversary } from '@/modules/nazara/lib/utils';

interface Props {
  events: MemoryRecord[];
}

export default function UpcomingList({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div style={{ padding: '0 24px', marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#3D2E1F' }}>Upcoming</h3>
        <Link
          to="/nazara/timeline"
          style={{ color: '#8C7B6B', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          See all <span style={{ fontSize: 12 }}>›</span>
        </Link>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {events.slice(0, 5).map((event, index) => {
          const daysUntil = getDaysUntilNextAnniversary(new Date(event.date));
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + daysUntil);

          const daysLabel = daysUntil === 0 ? 'Today' : `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
          const daysColor = daysUntil <= 3 ? '#D94545' : daysUntil <= 7 ? '#A67C52' : '#5A9E72';

          return (
            <Link
              key={event.id}
              to={`/nazara/memory/${event.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderBottom: index < Math.min(events.length, 5) - 1 ? '1px solid #F0E6D9' : 'none',
                textDecoration: 'none',
              }}
            >
              <CategoryIcon category={event.category} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: '#3D2E1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.title}
                </p>
                <p style={{ fontSize: 12, color: '#8C7B6B', marginTop: 2 }}>
                  {nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: daysColor }}>{daysLabel}</span>
                <span style={{ fontSize: 13, color: daysColor }}>›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
