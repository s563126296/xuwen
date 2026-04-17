import { useDashboardStore } from '../../store/dashboardStore';

const levelColorMap = {
  I: '#FF4757',
  II: '#FF6B35',
  III: '#F5A623',
  IV: '#00D0E9',
} as const;

export default function EmergencyPlanPanel() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const setActiveModal = useDashboardStore((s) => s.setActiveModal);
  const color = levelColorMap[emergency.emergencyLevel];

  return (
    <div className="card" style={{ padding: 14, flex: '25 0 0', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>G. 应急预案与响应等级</div>
        <button
          onClick={() => setActiveModal('emergency-report')}
          style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.3)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >查看报告</button>
      </div>
      <div style={{ padding: 10, borderRadius: 6, background: `${color}11`, border: `1px solid ${color}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>当前响应等级</div>
          <div style={{ fontSize: 20, fontWeight: 700, color }}>{emergency.emergencyLevel}级</div>
        </div>
        <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
          {emergency.emergencyLevel === 'I' && '特别重大，需省级以上统筹'}
          {emergency.emergencyLevel === 'II' && '重大事件，需市级统筹'}
          {emergency.emergencyLevel === 'III' && '较大事件，县级统筹'}
          {emergency.emergencyLevel === 'IV' && '一般事件，县级响应'}
        </div>
      </div>
      <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'rgba(13,27,42,0.72)', border: '1px solid rgba(0,208,233,0.12)' }}>
        <div style={{ fontSize: 11, color: '#00D0E9', fontWeight: 600 }}>已启动预案</div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#E2E8F0' }}>《徐闻港停航应急预案》</div>
      </div>
    </div>
  );
}
