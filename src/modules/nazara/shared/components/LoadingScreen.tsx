import { useState, useEffect } from 'react';

const MESSAGES = [
  'Gathering your precious moments...',
  'Unwrapping your memories...',
  'Dusting off the photo album...',
  'Reliving the beautiful days...',
  'Your story is loading...',
];

interface Props {
  message?: string;
}

export default function LoadingScreen({ message }: Props) {
  const [mounted, setMounted] = useState(false);
  const [msgIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  useEffect(() => { setMounted(true); }, []);

  const displayMsg = message || (mounted ? MESSAGES[msgIndex] : '');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDF8F3',
        gap: 24,
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F3EBE0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <span style={{ fontSize: 36 }}>🌿</span>
      </div>

      <div style={{
        width: 24, height: 24,
        border: '2.5px solid #F0E6D9', borderTopColor: '#A67C52',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />

      <p className="nazara-serif" style={{
        color: '#8C7B6B', fontSize: 15, fontStyle: 'italic',
        textAlign: 'center', maxWidth: 240, lineHeight: 1.5,
      }}>
        {displayMsg}
      </p>
    </div>
  );
}
