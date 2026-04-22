import { FileText } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { getPlanById } from '../../data/emergencyPlans';
import { PHASE_ORDER, PHASE_LABELS } from '../../utils/emergencyEngine';
import CollapsibleCard from '../common/CollapsibleCard';

const PHASE_COLORS = ['#F5A623', '#FF6B35', '#FF4757', '#00D0E9', '#2ED573'];

export default function EmergencyPlanPanel() {
  const emergency = useEmergencyStore((s) => s.emergencyState);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const { activePlan, tasks } = emergency;

  if (!activePlan) {
    const summary = (
      <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
        未启动预案
      </div>
    );
    return (
      <CollapsibleCard
        title="应急预案执行"
        icon={<FileText size={12} style={{ color: '#4da6ff' }} />}
        summary={summary}
        defaultExpanded={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 0' }}>
          <div style={{ fontSize: 12, color: '#64748B' }}>未启动预案</div>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveModal('plan-library'); }}
            style={{
              fontSize: 11, padding: '6px 16px', borderRadius: 5,
              background: 'rgba(0,208,233,0.15)', border: '1px solid rgba(0,208,233,0.4)',
              color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
            }}
          >选择预案</button>
        </div>
      </CollapsibleCard>
    );
  }

  const plan = getPlanById(activePlan.planId);
  const currentPhaseIdx = PHASE_ORDER.indexOf(activePlan.currentPhase);

  const planTaskIds = new Set(activePlan.generatedTaskIds);
  const planTasks = tasks.filter((t) => planTaskIds.has(t.id));
  const doneTasks = planTasks.filter((t) => t.status === 'done').length;
  const totalTasks = planTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const planName = plan?.name ?? activePlan.planId;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      {planName} · 阶段 <span style={{ color: PHASE_COLORS[currentPhaseIdx], fontWeight: 600 }}>{currentPhaseIdx + 1}/5</span> · 完成 <span style={{ color: '#2ED573', fontWeight: 600 }}>{completionPct}%</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="应急预案执行"
      icon={<FileText size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={true}
    >
      {/* Report button moved inside children */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 600 }}>
          《{planName}》
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveModal('emergency-report'); }}
          style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.3)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >查看报告</button>
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
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: `${completionPct}%`, height: '100%', borderRadius: 3, background: '#2ED573', transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontSize: 11, color: '#2ED573', flexShrink: 0, fontFamily: 'DIN, sans-serif' }}>{doneTasks}/{totalTasks} 任务完成</span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveModal('plan-detail'); }}
          style={{
            flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 4,
            background: 'rgba(0,208,233,0.12)', border: '1px solid rgba(0,208,233,0.3)',
            color: '#00D0E9', cursor: 'pointer', fontWeight: 600,
          }}
        >查看详情</button>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveModal('plan-library'); }}
          style={{
            flex: 1, fontSize: 11, padding: '5px 0', borderRadius: 4,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#94A3B8', cursor: 'pointer', fontWeight: 600,
          }}
        >切换预案</button>
      </div>
    </CollapsibleCard>
  );
}
