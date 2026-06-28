import { useRef, useState } from 'react';
import { useMemories } from '@/modules/nazara/features/memories/hooks/useMemories';
import { groupByYear } from '@/modules/nazara/lib/utils';
import BottomNav from '@/modules/nazara/shared/components/BottomNav';
import YearDivider from '@/modules/nazara/shared/components/YearDivider';
import TimelineCard from '@/modules/nazara/features/timeline/TimelineCard';

const PULL_THRESHOLD = 72;

export default function Timeline() {
  const { memories, isLoading: dataLoading } = useMemories();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const el = containerRef.current;
    if (el && el.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.45, PULL_THRESHOLD + 20));
  };

  const handleTouchEnd = async () => {
    if (pullY >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullY(0);
      await new Promise((r) => setTimeout(r, 600));
      setRefreshing(false);
    } else {
      setPullY(0);
    }
    touchStartY.current = null;
  };

  const filtered = search.trim()
    ? memories.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.notes?.toLowerCase().includes(search.toLowerCase()),
      )
    : memories;

  const grouped = groupByYear(filtered.map((m) => ({ ...m, date: new Date(m.date) })));
  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <main
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100vh', paddingBottom: 96, backgroundColor: '#FDF8F3', overflowY: 'auto' }}
    >
      <div style={{
        height: refreshing ? 56 : pullY > 0 ? pullY : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: pullY === 0 ? 'height 0.3s ease' : 'none',
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid #F0E6D9',
          borderTopColor: '#A67C52',
          opacity: refreshing ? 1 : pullProgress,
          transform: `rotate(${refreshing ? 0 : pullProgress * 180}deg)`,
          animation: refreshing ? 'spin 0.9s linear infinite' : 'none',
          transition: refreshing ? 'none' : 'opacity 0.1s, transform 0.1s',
        }} />
      </div>

      <div style={{ padding: '48px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: '#3D2E1F' }}>Timeline</h1>
          <button
            onClick={() => { setSearchOpen((o) => !o); if (searchOpen) setSearch(''); }}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: 'none',
              backgroundColor: searchOpen ? '#F3EBE0' : 'transparent',
              cursor: 'pointer', transition: 'background-color 0.2s',
            }}
          >
            {searchOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            )}
          </button>
        </div>
        <p style={{ color: '#8C7B6B', fontSize: 14, marginBottom: searchOpen ? 12 : 16 }}>Your life, beautifully remembered.</p>

        {searchOpen && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#C4A882" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '11px 40px 11px 38px',
                borderRadius: 999, border: '1.5px solid #F0E6D9',
                backgroundColor: '#FEFCF9', fontSize: 14, color: '#3D2E1F',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#C4A882', fontSize: 16, lineHeight: 1, padding: 2,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F3EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s ease-in-out infinite' }}>
              <span style={{ fontSize: 24 }}>🌿</span>
            </div>
            <div style={{ width: 20, height: 20, border: '2px solid #F0E6D9', borderTopColor: '#A67C52', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p className="font-serif" style={{ color: '#8C7B6B', fontSize: 13, fontStyle: 'italic' }}>Flipping through the pages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>{search ? '🔍' : '📸'}</p>
            <p style={{ color: '#8C7B6B' }}>{search ? `No memories matching "${search}"` : 'No memories yet.'}</p>
            {!search && <p style={{ color: '#B0A090', fontSize: 12, marginTop: 4 }}>Tap + to add your first memory.</p>}
          </div>
        ) : (
          years.map((year) => (
            <div key={year}>
              <YearDivider year={year} count={grouped[year].length} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {grouped[year].map((memory, idx) => (
                  <div key={memory.id}>
                    <TimelineCard
                      memory={{ ...memory, date: memory.date.getTime() }}
                      position={idx % 2 === 0 ? 'left' : 'right'}
                    />
                    {idx < grouped[year].length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 20 }}>
                        <div style={{ width: 1, flex: 1, borderLeft: '1.5px dashed rgba(201,168,130,0.35)' }} />
                        <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C9A882', flexShrink: 0, boxShadow: '0 0 4px 1px rgba(201,168,130,0.3)' }} />
                        <div style={{ width: 1, flex: 1, borderLeft: '1.5px dashed rgba(201,168,130,0.35)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </main>
  );
}
