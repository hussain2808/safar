import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useMemories, getRelatedMemories } from '@/modules/nazara/features/memories/hooks/useMemories';
import { toggleFavorite, deleteMemory } from '@/modules/nazara/db/memories';
import { usePhotoUrl, usePhotoUrls } from '@/modules/nazara/shared/hooks/usePhotoUrl';
import CategoryIcon from '@/modules/nazara/shared/components/CategoryIcon';
import HeartDivider from '@/modules/nazara/shared/components/HeartDivider';
import Badge from '@/modules/nazara/shared/components/Badge';
import LoadingScreen from '@/modules/nazara/shared/components/LoadingScreen';
import {
  formatDateLong,
  formatDate,
  getYearsAgo,
  getTimeSince,
  getNextAnniversaryDate,
  getDaysUntilNextAnniversary,
} from '@/modules/nazara/lib/utils';

function RelatedThumb({ photoId, title }: { photoId: string | undefined; title: string }) {
  const url = usePhotoUrl(photoId, true);
  if (!url) return null;
  return <img src={url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { memories, isLoading } = useMemories();
  const memory = memories.find((m) => m.id === id);
  const related = useMemo(() => (memory ? getRelatedMemories(memories, memory) : []), [memories, memory]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const coverUrl = usePhotoUrl(memory?.photoIds[0]);
  const photoUrls = usePhotoUrls(memory?.photoIds ?? []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (isLoading) return <LoadingScreen />;
  if (!memory || !user) return null;

  const date = new Date(memory.date);
  const yearsAgo = getYearsAgo(date);
  const timeSince = getTimeSince(date);
  const nextAnniversary = getNextAnniversaryDate(date);
  const daysUntil = getDaysUntilNextAnniversary(date);

  const handleShare = async () => {
    const text = `${memory.title} — ${formatDateLong(date)}${memory.notes ? `\n"${memory.notes}"` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    toggleFavorite(memory.id);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteMemory(memory.id);
    navigate('/nazara');
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

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3D2E1F">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 48, right: 0, minWidth: 170,
              backgroundColor: '#fff', border: '1px solid #F0E6D9', borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', zIndex: 50,
            }}>
              <Link
                to={`/nazara/edit/${memory.id}`}
                style={{ display: 'block', padding: '12px 16px', fontSize: 14, color: '#3D2E1F', textDecoration: 'none', borderBottom: '1px solid #F0E6D9' }}
              >
                Edit Memory
              </Link>
              <button
                onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 14, color: '#D94545', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Delete Memory
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px 16px' }}>
        <CategoryIcon category={memory.category} size="lg" showHeart={memory.isFavorite} />
        <h1 className="nazara-serif" style={{ fontSize: 24, fontWeight: 700, color: '#3D2E1F', marginTop: 16 }}>
          {memory.title}
        </h1>
        <HeartDivider />
        <p style={{ color: '#8C7B6B', fontSize: 14 }}>{formatDateLong(date)}</p>
        {yearsAgo > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <Badge text={`${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`} />
          </div>
        )}
      </div>

      {coverUrl && (
        <div
          onClick={() => setLightboxIndex(0)}
          style={{ width: '100%', aspectRatio: '4/3', cursor: 'pointer', overflow: 'hidden' }}
        >
          <img src={coverUrl} alt={memory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {memory.photoIds.length > 1 && (
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px' }}>
          {memory.photoIds.slice(1).map((pid, idx) => {
            const url = photoUrls[idx + 1];
            if (!url) return null;
            return (
              <div
                key={pid}
                onClick={() => setLightboxIndex(idx + 1)}
                style={{ width: 110, height: 110, flexShrink: 0, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
              >
                <img src={url} alt={memory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '16px 24px 0' }}>
        {memory.notes && (
          <div style={{
            backgroundColor: '#FEFCF9', border: '1px solid #F0E6D9', borderRadius: 16,
            padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16,
          }}>
            <p className="nazara-serif" style={{ flex: 1, fontStyle: 'italic', color: '#3D2E1F', fontSize: 15, lineHeight: 1.6 }}>
              &ldquo;{memory.notes}&rdquo;
            </p>
            <button
              onClick={handleFavorite}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: memory.isFavorite ? '#A67C52' : '#D8CBBA', flexShrink: 0 }}
            >
              {memory.isFavorite ? '♥' : '♡'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #F0E6D9' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <div>
            <p style={{ fontSize: 12, color: '#8C7B6B' }}>Time Since</p>
            <p style={{ fontSize: 14, color: '#3D2E1F', fontWeight: 500 }}>
              {timeSince.years} year{timeSince.years !== 1 ? 's' : ''}, {timeSince.months} month{timeSince.months !== 1 ? 's' : ''}, {timeSince.days} day{timeSince.days !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #F0E6D9' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <p style={{ fontSize: 12, color: '#8C7B6B' }}>Next Anniversary</p>
            <p style={{ fontSize: 14, color: '#3D2E1F', fontWeight: 500 }}>
              {formatDate(nextAnniversary)} · In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {memory.people.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 0' }}>
            {memory.people.map((p) => (
              <span key={p} style={{ padding: '6px 14px', backgroundColor: '#F3EBE0', color: '#8C7B6B', fontSize: 12, borderRadius: 999 }}>
                {p}
              </span>
            ))}
          </div>
        )}

        {(memory.tags ?? []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 0' }}>
            {(memory.tags ?? []).map((t) => (
              <Link
                key={t}
                to={`/nazara/timeline?tag=${encodeURIComponent(t)}`}
                style={{ padding: '6px 14px', backgroundColor: '#F3EBE0', color: '#A67C52', fontSize: 12, borderRadius: 999, textDecoration: 'none' }}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3D2E1F', marginBottom: 12 }}>Related Memories</h3>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/nazara/memory/${r.id}`}
                  style={{ width: 144, flexShrink: 0, textDecoration: 'none' }}
                >
                  <div style={{ width: 144, height: 108, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.photoIds[0] ? (
                      <RelatedThumb photoId={r.photoIds[0]} title={r.title} />
                    ) : (
                      <CategoryIcon category={r.category} size="md" />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#3D2E1F', fontWeight: 500, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>{formatDate(new Date(r.date))}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              backgroundColor: 'transparent', color: '#A67C52', border: '1.5px solid #A67C52',
            }}
          >
            Share
          </button>
          <button
            onClick={handleFavorite}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              backgroundColor: '#A67C52', color: '#fff', border: 'none',
            }}
          >
            {memory.isFavorite ? '♥ This Memory Matters' : '♡ This Memory Matters'}
          </button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <span style={{ color: '#fff', fontSize: 13 }}>{lightboxIndex + 1} / {memory.photoIds.length}</span>
            <button
              onClick={() => setLightboxIndex(null)}
              style={{ border: 'none', background: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div
            className="hide-scrollbar"
            style={{ display: 'flex', flex: 1, overflowX: 'auto', scrollSnapType: 'x mandatory' }}
          >
            {memory.photoIds.map((pid, idx) => {
              const url = photoUrls[idx];
              return (
                <div key={pid} style={{ width: '100vw', flexShrink: 0, scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {url && <img src={url} alt={memory.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 16 }}>
            {memory.photoIds.map((pid, idx) => (
              <div
                key={pid}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: idx === lightboxIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, maxWidth: 320, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🗑️</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#3D2E1F', marginBottom: 8 }}>Delete this memory?</h3>
            <p style={{ fontSize: 13, color: '#8C7B6B', marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{ flex: 1, padding: '10px 0', borderRadius: 999, border: '1.5px solid #E8DDD2', backgroundColor: '#fff', color: '#3D2E1F', fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '10px 0', borderRadius: 999, border: 'none', backgroundColor: '#D94545', color: '#fff', fontSize: 14, cursor: 'pointer' }}
              >
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
