import { useDashboardStore } from '../../store/dashboardStore';
import { getPlanById } from '../../data/emergencyPlans';
import { PHASE_ORDER, PHASE_LABELS } from '../../utils/emergencyEngine';

const PHASE_COLORS = ['#F5A623', '#FF6B35', '#FF4757', '#00D0E9', '#2ED573'];

export default function EmergencyPlanPanel() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const setActiveModal = useDashboardStore((s) => s.setActiveModal);
  const { activePlan, tasks } = emergency;

  if (!activePlan) {
    return (
      <div className="card" style={{ padding: 14, flex: '25 0 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748B' }}>未启动预案</div>
        <button
          onClick={() => setActiveModal('plan-library')}
          style={{
            fontSize: 11, padding: '6px 16px', borderRadius: 5,
            background: 'rgba(0,208,233,0.15)', border: '1px solid rgba(0,208,233,0.4)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >选择预案</button>
      </div>
    );
  }

  const plan = getPlanById(activePlan.planId);
  const currentPhaseIdx = PHASE_ORDER.indexOf(activePlan.currentPhase);

  // Task completion rate across all plan steps
  const planTaskIds = new Set(activePlan.generatedTaskIds);
  const planTasks = tasks.filter((t) => planTaskIds.has(t.id));
  const doneTasks = planTasks.filter((t) => t.status === 'done').length;
  const totalTasks = planTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="card" style={{ padding: 14, flex: '25 0 0', minHeight: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>G. 应急预案执行</div>
        <button
          onClick={() => setActiveModal('emergency-report')}
          style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.3)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >查看报告</button>
      </div>

      {/* Plan name */}
      <div style={{ fontSize: 12, color: '#CBD5E1', marginBottom: 10, fontWeight: 600 }}>
        《{plan?.name ?? activePlan.planId}》
      </div>

      {/* 5-segment phase progress bar */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {PHASE_ORDER.map((phase, idx) => {
          const isCurrent = idx === currentPhaseIdx;
          const isPast = idx < currentPhaseIdx;
          const color = PHASE_COLORS[idx];
          return (
            <div
              key={phase}
              style={{
                flex: 1, height: 8, borderRadius: 3,
                background: isPast ? `${color}99` : isCurrent ? color : 'rgba(255,255,255,0.08)',
                boxShadow: isCurrent ? `0 0 6px ${color}` : 'none',
                transition: 'background 0.3s',
              }}
            />
          );
        })}
      </div>

      {/* Current phase label */}
      <div style={{ fontSize: 11, color: PHASE_COLORS[currentPhaseIdx], fontWeight: 600, marginBottom: 10 }}>
        {PHASE_LABELS[activePlan.currentPhase]}
      </div>

      {/* Task completion rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: `${completionPct}%`, height: '100%', borderRadius: 3, background: '#2ED573', transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontSize: 11, color: '#2ED573', flexShrink: 0 }}>{doneTasks}/{totalTasks} 任务完成</span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setActiveModal('plan-detail')}
          style={{
            flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 4,
            background: 'rgba(0,208,233,0.12)', border: '1px solid rgba(0,208,233,0.3)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >查看详情</button>
        <button
          onClick={() => setActiveModal('plan-library')}
          style={{
            flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 4,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#94A3B8', cursor: 'pointer', fontWeight: 600,
          }}
        >切换预案</button>
      </div>
    </div>
  );
}
