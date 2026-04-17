import { useDashboardStore } from '../../store/dashboardStore';

const levelColorMap = {
  I: '#FF4757',
  II: '#FF6B35',
  III: '#F5A623',
  IV: '#00D0E9',
} as const;

export default function EmergencyPlanPanel() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const color = levelColorMap[emergency.emergencyLevel];

  return (
    <div className="card" style={{ padding: 14, minHeight: 200 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>G. 应急预案与响应等级</div>
      <div style={{ padding: 12, borderRadius: 6, background: `${color}11`, border: `1px solid ${color}33` }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>当前响应等级</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{emergency.emergencyLevel}级</div>
        <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 8 }}>
          {emergency.emergencyLevel === 'I' && '特别重大突发事件，需省级以上统筹'}
          {emergency.emergencyLevel === 'II' && '重大突发事件，需市级统筹'}
          {emergency.emergencyLevel === 'III' && '较大突发事件，县级统筹'}
          {emergency.emergencyLevel === 'IV' && '一般突发事件，县级响应'}
        </div>
      </div>
      <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', border: '1px solid rgba(0,208,233,0.12)' }}>
        <div style={{ fontSize: 11, color: '#00D0E9', fontWeight: 600 }}>已启动预案</div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#E2E8F0' }}>《徐闻港停航应急预案》</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>启动时间：{emergency.forecast.estimatedResumeTime.split(' ')[0]} 14:30</div>
      </div>
    </div>
  );
}
