import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useMemories } from '@/modules/nazara/features/memories/hooks/useMemories';
import { getGreeting, isSameMonthDay, getYearsAgo } from '@/modules/nazara/lib/utils';
import BottomNav from '@/modules/nazara/shared/components/BottomNav';
import MemoryOfTheDay from '@/modules/nazara/features/home/MemoryOfTheDay';
import UpcomingList from '@/modules/nazara/features/home/UpcomingList';
import CategoryIcon from '@/modules/nazara/shared/components/CategoryIcon';
import type { MemoryRecord } from '@/modules/nazara/types';

function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { memories, isLoading: dataLoading } = useMemories();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const in30Days = new Date(); in30Days.setDate(today.getDate() + 30);

  const todayMemories = memories.filter((m) => isSameMonthDay(new Date(m.date), viewDate));
  const upcoming = memories
    .filter((m) => m.notifyYearly || m.type === 'recurring')
    .map((m) => {
      const next = new Date(today.getFullYear(), new Date(m.date).getMonth(), new Date(m.date).getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return { ...m, _nextDate: next };
    })
    .filter((m) => m._nextDate >= today && m._nextDate <= in30Days)
    .sort((a, b) => a._nextDate.getTime() - b._nextDate.getTime()) as (MemoryRecord & { _nextDate: Date })[];
  const nearbyYesterday = memories.filter((m) => isSameMonthDay(new Date(m.date), yesterday));
  const nearbyTomorrow = memories.filter((m) => isSameMonthDay(new Date(m.date), tomorrow));

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  if (!user) return null;

  const greeting = getGreeting();
  const nameParts = user.displayName?.split(' ') || [];
  const firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0] || 'there';
  const isToday = viewDate.toDateString() === new Date().toDateString();

  const goYesterday = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d);
  };

  const goTomorrow = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    setViewDate(d);
  };

  const goToday = () => setViewDate(new Date());

  return (
    <div style={{ paddingBottom: 100, position: 'relative' }}>
      <button
        onClick={() => navigate('/')}
        aria-label="Back to Safar"
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid #E8DDD2', backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#A67C52', cursor: 'pointer',
        }}
      >
        <ChevronLeft size={18} />
      </button>
      <div style={{ padding: '56px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#8C7B6B', fontSize: 13 }}>{greeting},</p>
            <h1 className="nazara-serif" style={{ fontSize: 30, fontWeight: 700, color: '#3D2E1F', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              {firstName} <span style={{ fontSize: 22 }}>🌿</span>
            </h1>
            <p style={{ color: '#8C7B6B', fontSize: 13, marginTop: 4 }}>Here&apos;s your day in memories 🤎</p>
          </div>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                border: '2px solid #F0E6D9', backgroundColor: '#F3EBE0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#8C7B6B', fontSize: 18, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {firstName.charAt(0)}
            </button>
            {showMenu && (
              <div
                style={{
                  position: 'absolute', top: 50, right: 0, minWidth: 160,
                  backgroundColor: '#fff', border: '1px solid #F0E6D9',
                  borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden', zIndex: 50,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0E6D9' }}>
                  <p style={{ fontSize: 13, color: '#3D2E1F', fontWeight: 500 }}>{user.displayName}</p>
                  <p style={{ fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
        <button
          onClick={goYesterday}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1.5px solid #E8DDD2',
            backgroundColor: '#fff', cursor: 'pointer', color: '#A67C52',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ‹
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ height: 1, width: 28, backgroundColor: 'rgba(201,168,130,0.3)' }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <button
              onClick={isToday ? undefined : goToday}
              style={{
                color: '#A67C52', fontSize: 17, fontWeight: 600,
                border: 'none', backgroundColor: 'transparent',
                cursor: isToday ? 'default' : 'pointer', padding: 0,
                letterSpacing: 0.2,
              }}
            >
              {formatHeaderDate(viewDate)}
            </button>
            <div style={{ height: 1, width: 28, backgroundColor: 'rgba(201,168,130,0.3)' }} />
          </div>
        </div>

        <button
          onClick={goTomorrow}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1.5px solid #E8DDD2',
            backgroundColor: '#fff', cursor: 'pointer', color: '#A67C52',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ›
        </button>
      </div>

      {!isToday && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            onClick={goToday}
            style={{
              padding: '4px 14px', borderRadius: 999, border: '1px solid #F0E6D9',
              backgroundColor: '#FEFCF9', color: '#A67C52', fontSize: 12,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Back to Today
          </button>
        </div>
      )}

      <div style={{ padding: '20px 24px 0' }}>
        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F3EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>🌿</span>
            </div>
            <div style={{ width: 20, height: 20, border: '2px solid #F0E6D9', borderTopColor: '#A67C52', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p className="nazara-serif" style={{ color: '#8C7B6B', fontSize: 13, fontStyle: 'italic' }}>Gathering your moments...</p>
          </div>
        ) : todayMemories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {Object.entries(
              todayMemories.reduce<Record<number, typeof todayMemories>>((acc, m) => {
                const yr = new Date(m.date).getFullYear();
                (acc[yr] = acc[yr] || []).push(m);
                return acc;
              }, {}),
            )
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([yr, group]) => {
                const years = viewDate.getFullYear() - Number(yr);
                return (
                  <div key={yr}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: '#8C7B6B',
                        backgroundColor: '#EDE5DA',
                        borderRadius: 999,
                        padding: '6px 16px',
                      }}>
                        {years === 0 ? 'This year' : `${years} year${years !== 1 ? 's' : ''} ago today`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {group.map((m) => (
                        <MemoryOfTheDay key={m.id} memory={m} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 16px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📝</p>
            <p style={{ color: '#8C7B6B', fontSize: 14 }}>No memories on this day yet.</p>
            <p style={{ color: '#B0A090', fontSize: 12, marginTop: 6 }}>Start adding memories to see them here on their anniversaries.</p>
          </div>
        )}

        {isToday && todayMemories.length === 0 && (nearbyYesterday.length > 0 || nearbyTomorrow.length > 0) && (
          <div style={{ marginTop: 8 }}>
            {nearbyYesterday.length > 0 && (
              <button
                onClick={goYesterday}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', marginBottom: 8,
                  backgroundColor: '#FEFCF9', border: '1px solid #F0E6D9',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <CategoryIcon category={nearbyYesterday[0].category} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: '#A67C52', fontWeight: 500 }}>Yesterday</p>
                  <p style={{ fontSize: 14, color: '#3D2E1F', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nearbyYesterday[0].title}
                  </p>
                  <p style={{ fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>
                    {getYearsAgo(new Date(nearbyYesterday[0].date))} year{getYearsAgo(new Date(nearbyYesterday[0].date)) !== 1 ? 's' : ''} ago
                  </p>
                </div>
                <span style={{ color: '#A67C52', fontSize: 16 }}>‹</span>
              </button>
            )}

            {nearbyTomorrow.length > 0 && (
              <button
                onClick={goTomorrow}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  backgroundColor: '#FEFCF9', border: '1px solid #F0E6D9',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <CategoryIcon category={nearbyTomorrow[0].category} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: '#A67C52', fontWeight: 500 }}>Tomorrow</p>
                  <p style={{ fontSize: 14, color: '#3D2E1F', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nearbyTomorrow[0].title}
                  </p>
                  <p style={{ fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>
                    {getYearsAgo(new Date(nearbyTomorrow[0].date))} year{getYearsAgo(new Date(nearbyTomorrow[0].date)) !== 1 ? 's' : ''} ago
                  </p>
                </div>
                <span style={{ color: '#A67C52', fontSize: 16 }}>›</span>
              </button>
            )}
          </div>
        )}
      </div>

      <UpcomingList events={upcoming} />

      <BottomNav />
    </div>
  );
}
