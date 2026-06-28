export default function HeartDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '8px 0' }}>
      <div style={{ height: 1, width: 48, backgroundColor: 'rgba(201,168,130,0.4)' }} />
      <span style={{ color: '#A67C52', fontSize: 14 }}>♥</span>
      <div style={{ height: 1, width: 48, backgroundColor: 'rgba(201,168,130,0.4)' }} />
    </div>
  );
}
