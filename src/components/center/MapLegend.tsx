export default function MapLegend() {
  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 12,
      display: 'flex',
      gap: 12,
      padding: '6px 12px',
      background: 'rgba(18, 26, 38, 0.95)',
      borderRadius: 6,
      border: '1px solid rgba(0, 208, 233, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 4, background: '#2ED573', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>畅通</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 4, background: '#00D0E9', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>正常</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 4, background: '#F5A623', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>拥堵</span>
      </div>
    </div>
  );
}
