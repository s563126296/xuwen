import { useDashboardStore } from '../../store/dashboardStore';

const typeColor = {
  system: '#00D0E9',
  department: '#2ED573',
  port: '#F5A623',
  alert: '#FF4757',
} as const;

export default function EmergencyCommPanel() {
  const communications = useDashboardStore((s) => s.emergencyState.communications);

  return (
    <div className="card" style={{ padding: 14, flex: '30 0 0', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12, flexShrink: 0 }}>H. 通信记录</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {communications.map((item) => (
          <div key={item.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', borderLeft: `3px solid ${typeColor[item.type]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 600 }}>{item.source}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>{item.time}</div>
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: item.urgent ? '#FCA5A5' : '#CBD5E1' }}>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
