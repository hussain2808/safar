import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  borderRadius?: number;
}

export default function MemoryImage({ src, alt, style, borderRadius = 0 }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius, overflow: 'hidden' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes img-reveal {
          from { opacity: 0; transform: scale(1.03); filter: blur(4px); }
          to   { opacity: 1; transform: scale(1);    filter: blur(0px); }
        }
        @keyframes glow-fade {
          0%   { opacity: 1; box-shadow: 0 0 0 0 rgba(201,168,130,0); }
          40%  { box-shadow: 0 0 18px 4px rgba(201,168,130,0.35); }
          100% { opacity: 0; box-shadow: 0 0 0 0 rgba(201,168,130,0); }
        }
      `}</style>

      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(90deg, #F3EBE0 25%, #EDE0D0 50%, #F3EBE0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
          borderRadius,
        }} />
      )}

      {loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          borderRadius, pointerEvents: 'none',
          animation: 'glow-fade 0.9s ease-out forwards',
        }} />
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius,
          animation: loaded ? 'img-reveal 0.5s ease-out both' : undefined,
          opacity: loaded ? 1 : 0,
          ...style,
        }}
      />
    </div>
  );
}
