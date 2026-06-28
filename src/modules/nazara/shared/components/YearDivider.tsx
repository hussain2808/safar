interface Props {
  year: number;
  count?: number;
}

export default function YearDivider({ year, count }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 16px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        backgroundColor: '#F3EBE0', borderRadius: 999,
        padding: '5px 16px', flexShrink: 0,
      }}>
        <span className="nazara-serif" style={{ color: '#A67C52', fontWeight: 600, fontSize: 15 }}>{year}</span>
        {count !== undefined && (
          <>
            <span style={{ color: 'rgba(201,168,130,0.5)', fontSize: 12 }}>·</span>
            <span style={{ color: '#C4A882', fontSize: 12 }}>{count} {count === 1 ? 'memory' : 'memories'}</span>
          </>
        )}
      </div>
      <div style={{ height: 1, flex: 1, backgroundColor: 'rgba(201,168,130,0.2)' }} />
    </div>
  );
}
