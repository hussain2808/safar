import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/nazara' || pathname === '/nazara/';
  const isTimeline = pathname === '/nazara/timeline';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderTop: '1px solid #F0E6D9',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: 76,
          paddingBottom: 16,
        }}
      >
        <Link to="/nazara" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={isHome ? '#A67C52' : '#8C7B6B'} />
            <polyline points="9,22 9,12 15,12 15,22" stroke={isHome ? '#A67C52' : '#8C7B6B'} />
          </svg>
          <span style={{ fontSize: 11, color: isHome ? '#A67C52' : '#8C7B6B', fontWeight: isHome ? 600 : 400 }}>
            Home
          </span>
          {isHome && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#A67C52', marginTop: 2 }} />
          )}
        </Link>

        <Link
          to="/nazara/add"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#A67C52',
            boxShadow: '0 4px 16px rgba(166,124,82,0.35)',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>

        <Link to="/nazara/timeline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" stroke={isTimeline ? '#A67C52' : '#8C7B6B'} />
            <circle cx="8" cy="6" r="1.5" fill={isTimeline ? '#A67C52' : '#8C7B6B'} stroke="none" />
            <line x1="4" y1="12" x2="20" y2="12" stroke={isTimeline ? '#A67C52' : '#8C7B6B'} />
            <circle cx="16" cy="12" r="1.5" fill={isTimeline ? '#A67C52' : '#8C7B6B'} stroke="none" />
            <line x1="4" y1="18" x2="20" y2="18" stroke={isTimeline ? '#A67C52' : '#8C7B6B'} />
            <circle cx="12" cy="18" r="1.5" fill={isTimeline ? '#A67C52' : '#8C7B6B'} stroke="none" />
          </svg>
          <span style={{ fontSize: 11, color: isTimeline ? '#A67C52' : '#8C7B6B', fontWeight: isTimeline ? 600 : 400 }}>
            Timeline
          </span>
          {isTimeline && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#A67C52', marginTop: 2 }} />
          )}
        </Link>
      </div>
    </nav>
  );
}
