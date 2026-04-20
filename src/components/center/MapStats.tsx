export default function MapStats() {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      display: 'flex',
      gap: 12
    }}>
      <div style={{
        padding: '8px 14px',
        background: 'rgba(18, 26, 38, 0.95)',
        borderRadius: 6,
        border: '1px solid rgba(0, 208, 233, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 11, color: '#A0A8B4' }}>拥堵路段</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#F5A623' }}>2</div>
      </div>
      <div style={{
        padding: '8px 14px',
        background: 'rgba(18, 26, 38, 0.95)',
        borderRadius: 6,
        border: '1px solid rgba(46, 213, 115, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 11, color: '#A0A8B4' }}>畅通路段</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#2ED573' }}>8</div>
      </div>
    </div>
  );
}
