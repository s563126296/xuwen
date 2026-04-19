import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { getPlanById } from '../../data/emergencyPlans';
import { PHASE_ORDER, PHASE_LABELS } from '../../utils/emergencyEngine';
import type { EmergencyPhase } from '../../store/dashboardStore';

interface Props {
  onClose: () => void;
}

const DEPT_COLORS: Record<string, string> = {
  '公安交警': '#00D0E9',
  '民政局': '#2ED573',
  '交通运输局': '#F5A623',
  '港口管理方': '#FF6B35',
  '城管局': '#A78BFA',
  '应急管理局': '#FF4757',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: '#64748B' },
  received: { label: '已接收', color: '#F5A623' },
  executing: { label: '执行中', color: '#00D0E9' },
  done: { label: '已完成', color: '#2ED573' },
};

export default function EmergencyPlanDetailModal({ onClose }: Props) {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const { activePlan, tasks } = emergency;

  const plan = activePlan ? getPlanById(activePlan.planId) : undefined;
  const defaultTab: EmergencyPhase = activePlan?.currentPhase ?? 'warning';
  const [selectedTab, setSelectedTab] = useState<EmergencyPhase>(defaultTab);

  if (!activePlan || !plan) return null;

  const currentPhaseIdx = PHASE_ORDER.indexOf(activePlan.currentPhase);
  const selectedPhaseIdx = PHASE_ORDER.indexOf(selectedTab);
  const isFuturePhase = selectedPhaseIdx > currentPhaseIdx;

  const stepsForTab = plan.steps
    .filter((s) => s.phase === selectedTab)
    .sort((a, b) => a.order - b.order);

  // Build a map of task id -> task for quick lookup
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: 700, maxHeight: '82vh',
        background: '#0D1B2A',
        border: '1px solid rgba(0,208,233,0.25)',
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>《{plan.name}》</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>预案详情 · 启动于 {activePlan.activatedAt}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748B', fontSize: 18, lineHeight: 1,
              padding: '4px 8px', borderRadius: 4,
            }}
          >✕</button>
        </div>

        {/* Phase tabs */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0, overflowX: 'auto',
        }}>
          {PHASE_ORDER.map((phase, idx) => {
            const isActive = phase === selectedTab;
            const isCurrent = phase === activePlan.currentPhase;
            const isPast = idx < currentPhaseIdx;
            return (
              <button
                key={phase}
                onClick={() => setSelectedTab(phase)}
                style={{
                  flex: 1, padding: '10px 8px', fontSize: 11, fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #00D0E9' : '2px solid transparent',
                  color: isActive ? '#00D0E9' : isCurrent ? '#F5A623' : isPast ? '#94A3B8' : '#475569',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}
              >
                {PHASE_LABELS[phase].replace(/^阶段\d：/, '')}
                {isCurrent && <span style={{ marginLeft: 4, fontSize: 9, color: '#F5A623' }}>●</span>}
              </button>
            );
          })}
        </div>

        {/* Steps list */}
        <div style={{ overflowY: 'auto', padding: '14px 26px 14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stepsForTab.length === 0 && (
            <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '20px 0' }}>
              该阶段暂无步骤
            </div>
          )}
          {stepsForTab.map((step) => {
            const task = taskMap.get(step.id);
            const deptColor = DEPT_COLORS[step.department] ?? '#94A3B8';
            const muted = isFuturePhase;

            return (
              <div
                key={step.id}
                style={{
                  padding: '12px 14px',
                  background: muted ? 'rgba(255,255,255,0.02)' : 'rgba(13,27,42,0.8)',
                  border: `1px solid ${muted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  opacity: muted ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    {/* Department badge + title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
                        background: `${deptColor}22`, color: deptColor, border: `1px solid ${deptColor}44`,
                        flexShrink: 0,
                      }}>{step.department}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: muted ? '#475569' : '#E2E8F0' }}>
                        {step.title}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#64748B' }}>
                      <span>负责人：{step.owner}</span>
                      <span>时限：{step.timeLimitMinutes} 分钟</span>
                    </div>

                    {/* Completion criteria */}
                    <div style={{ marginTop: 6, fontSize: 10, color: '#64748B' }}>
                      完成标准：{step.completionCriteria}
                    </div>
                  </div>

                  {/* Task status badge (if generated) */}
                  {task && (() => {
                    const s = STATUS_LABELS[task.status];
                    return (
                      <span style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600,
                        background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44`,
                        flexShrink: 0,
                      }}>{s.label}</span>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
