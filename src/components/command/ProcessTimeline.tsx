import { useRef, useEffect, useMemo } from 'react';
import { useCommandStore } from '../../stores/commandStore';
import {
  AlertTriangle, Bot, CheckCircle, Target,
  Truck, Activity, CircleDot,
  type LucideIcon,
} from 'lucide-react';

// Milestone type definition
interface Milestone {
  id: string;
  time: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  lines: string[];
  status: 'past' | 'current' | 'future';
}

// Build milestones from store data
function useMilestones(): Milestone[] {
  const causes = useCommandStore((s) => s.commandState.causes);
  const congestionIndex = useCommandStore((s) => s.commandState.congestionIndex);
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const strategyTimeline = useCommandStore((s) => s.commandState.strategyTimeline);
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const executionResources = useCommandStore((s) => s.commandState.executionResources);

  return useMemo(() => {
    const milestones: Milestone[] = [];
    const executingStrategy = strategies.find((s) => s.status === 'executing' || s.status === 'done');
    const hasExecution = !!executingStrategy;
    const isCompleted = executingStrategy?.status === 'done';

    // 1. Congestion triggered
    const triggerFeed = commandFeed.find((f) =>
      f.type === 'system' && (f.content.includes('拥堵指数') || f.content.includes('切换指挥'))
    );
    const triggerTime = triggerFeed?.time ?? '14:30';
    const primaryCause = causes[0];
    milestones.push({
      id: 'trigger',
      time: triggerTime,
      title: '拥堵触发',
      icon: AlertTriangle,
      iconColor: '#FF4757',
      lines: [
        `拥堵指数 ${congestionIndex.toFixed(1)}`,
        primaryCause ? `${primaryCause.label} ${primaryCause.confidence}%` : '多因素叠加',
      ],
      status: 'past',
    });

    // 2. AI recommended
    const aiFeed = commandFeed.find((f) => f.type === 'ai' && f.content.includes('建议'));
    const aiTime = aiFeed?.time ?? '14:31';
    const recommendedStrategy = strategies.find((s) => s.recommended) ?? strategies[0];
    if (recommendedStrategy) {
      milestones.push({
        id: 'ai-recommend',
        time: aiTime,
        title: `AI推荐 ${recommendedStrategy.id}`,
        icon: Bot,
        iconColor: '#A78BFA',
        lines: [
          `预期 ${recommendedStrategy.effect}`,
          strategyTimeline
            ? `置信度 ${Math.round((strategyTimeline.checkpoints[0]?.expected ?? 5.2) * 10)}%`
            : `${recommendedStrategy.time}生效`,
        ],
        status: 'past',
      });
    }

    // 3. Execution confirmed
    if (hasExecution) {
      const confirmFeed = commandFeed.find((f) =>
        f.type === 'command' && f.content.includes('确认执行')
      );
      const confirmTime = confirmFeed?.time ?? '14:33';
      const assignedPersonnel = executionResources.personnel
        .filter((p) => p.status === 'executing')
        .slice(0, 2)
        .map((p) => p.name);
      milestones.push({
        id: 'confirmed',
        time: confirmTime,
        title: '确认执行',
        icon: CheckCircle,
        iconColor: '#2ED573',
        lines: [
          assignedPersonnel.length > 0
            ? `${assignedPersonnel.join('、')}已派出`
            : '人员已派出',
          `执行 ${executingStrategy!.name}`,
        ],
        status: 'past',
      });
    }

    // 4. Resources arrived
    if (hasExecution) {
      const arrivalFeed = commandFeed.find((f) =>
        f.type === 'field' && (f.content.includes('已到达') || f.content.includes('开始执行'))
      );
      const arrivalTime = arrivalFeed?.time ?? '14:35';
      const readyMaterials = executionResources.materials
        .filter((m) => m.ready > 0)
        .slice(0, 2)
        .map((m) => m.name);
      milestones.push({
        id: 'resources-arrived',
        time: arrivalTime,
        title: '资源到位',
        icon: Truck,
        iconColor: '#F59E0B',
        lines: [
          readyMaterials.length > 0 ? `${readyMaterials.join('、')}已就绪` : '人员物资就绪',
          '分流开始',
        ],
        status: 'past',
      });
    }

    // 5. Current status (if monitoring)
    if (hasExecution && monitorState.isMonitoring) {
      const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const deviationPercent = monitorState.deviationPercent;
      const actualIndex = congestionIndex;
      const expectedIndex = strategyTimeline?.checkpoints.find((c) => c.status === 'on-track' || c.status === 'off-track')?.expected ?? 5.5;
      milestones.push({
        id: 'current',
        time: currentTime,
        title: `偏差 ${deviationPercent.toFixed(0)}%`,
        icon: Activity,
        iconColor: deviationPercent > 10 ? '#FF4757' : '#00D0E9',
        lines: [
          `实际 ${actualIndex.toFixed(1)} vs 预期 ${expectedIndex.toFixed(1)}`,
          deviationPercent <= 10 ? '可接受范围内' : '需要关注',
        ],
        status: 'current',
      });
    } else if (hasExecution && !isCompleted) {
      // Fallback: show current without monitoring
      const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      milestones.push({
        id: 'current',
        time: currentTime,
        title: '执行中',
        icon: CircleDot,
        iconColor: '#00D0E9',
        lines: [
          `当前指数 ${congestionIndex.toFixed(1)}`,
          '策略生效中',
        ],
        status: 'current',
      });
    }

    // 6. Target achieved (future or completed)
    if (hasExecution) {
      const targetIndex = strategyTimeline?.checkpoints[strategyTimeline.checkpoints.length - 1]?.expected ?? 4.0;
      const lastCheckpoint = strategyTimeline?.checkpoints[strategyTimeline.checkpoints.length - 1];
      const targetTime = lastCheckpoint?.time ?? '15:30';
      milestones.push({
        id: 'target',
        time: targetTime,
        title: isCompleted ? '已达标' : '预计达标',
        icon: Target,
        iconColor: '#10B981',
        lines: [
          `目标 ${targetIndex.toFixed(1)}`,
          isCompleted ? '拥堵已缓解' : `预计 ${targetTime}`,
        ],
        status: isCompleted ? 'past' : 'future',
      });
    }

    return milestones;
  }, [causes, congestionIndex, strategies, strategyTimeline, monitorState, commandFeed, executionResources]);
}

export default function ProcessTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const milestones = useMilestones();

  // Auto-scroll to current milestone
  useEffect(() => {
    if (!scrollRef.current) return;
    const currentEl = scrollRef.current.querySelector('[data-current="true"]');
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [milestones]);

  return (
    <div className="process-timeline-panel" style={{
      position: 'absolute',
      bottom: 12,
      left: 16,
      right: 16,
      height: 180,
      background: 'rgba(12, 25, 48, 0.92)',
      borderRadius: 12,
      border: '1px solid rgba(100, 180, 255, 0.12)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 24px rgba(77, 166, 255, 0.08)',
      backdropFilter: 'blur(40px) saturate(150%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,208,233,0.1)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 3, height: 14, borderRadius: 1,
            background: 'linear-gradient(180deg, #00D0E9, rgba(0,208,233,0.3))',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', letterSpacing: '0.5px' }}>
            执行进程
          </span>
          <span style={{ fontSize: 11, color: '#64748B' }}>{milestones.length} 个节点</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#2ED573',
              animation: 'timelinePulse 2s infinite',
            }} />
            <span style={{
              fontSize: 10, color: '#2ED573', fontWeight: 600,
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Timeline scroll area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowX: 'auto', overflowY: 'hidden',
        display: 'flex', alignItems: 'flex-start',
        padding: '12px 20px 8px',
        scrollBehavior: 'smooth',
        gap: 0,
      }}>
        {milestones.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}
            data-current={m.status === 'current' ? 'true' : undefined}
          >
            {/* Milestone node */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              width: 160, opacity: m.status === 'future' ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }}>
              {/* Dot */}
              <div style={{
                width: m.status === 'current' ? 32 : 24,
                height: m.status === 'current' ? 32 : 24,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.status === 'current'
                  ? `radial-gradient(circle, ${m.iconColor}33, ${m.iconColor}11)`
                  : m.status === 'past'
                    ? `${m.iconColor}22`
                    : 'rgba(100,116,139,0.15)',
                border: m.status === 'current'
                  ? `2px solid ${m.iconColor}`
                  : m.status === 'past'
                    ? `1.5px solid ${m.iconColor}88`
                    : '1.5px dashed rgba(100,116,139,0.4)',
                boxShadow: m.status === 'current'
                  ? `0 0 12px ${m.iconColor}44, 0 0 24px ${m.iconColor}22`
                  : 'none',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                <m.icon
                  size={m.status === 'current' ? 16 : 13}
                  color={m.status === 'future' ? '#64748B' : m.iconColor}
                />
              </div>

              {/* Time */}
              <span style={{
                fontSize: 11, marginTop: 6,
                color: m.status === 'current' ? '#00D0E9' : m.status === 'past' ? '#94A3B8' : '#475569',
                fontFamily: '"DIN Alternate", "DIN", "Consolas", monospace',
                fontWeight: m.status === 'current' ? 700 : 500,
                textShadow: m.status === 'current' ? '0 0 8px rgba(0,208,233,0.4)' : 'none',
              }}>
                {m.status === 'current' ? `[${m.time}]` : m.time}
              </span>

              {/* Title */}
              <span style={{
                fontSize: 12, marginTop: 2,
                color: m.status === 'current' ? '#F1F5F9' : m.status === 'past' ? '#CBD5E1' : '#64748B',
                fontWeight: m.status === 'current' ? 700 : 600,
              }}>
                {m.title}
              </span>

              {/* Key info lines */}
              <div style={{
                marginTop: 4, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 1,
              }}>
                {m.lines.map((line, li) => (
                  <span key={li} style={{
                    fontSize: 10, lineHeight: 1.4,
                    color: m.status === 'current' ? '#94A3B8' : m.status === 'past' ? '#64748B' : '#475569',
                    textAlign: 'center', maxWidth: 140,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {line}
                  </span>
                ))}
              </div>
            </div>

            {/* Connector line */}
            {i < milestones.length - 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', height: 24,
                marginTop: 0, flexShrink: 0,
              }}>
                <div style={{
                  width: 32, height: 2,
                  background: milestones[i + 1].status === 'future'
                    ? 'repeating-linear-gradient(90deg, rgba(100,116,139,0.3) 0 4px, transparent 4px 8px)'
                    : `linear-gradient(90deg, ${m.iconColor}66, ${milestones[i + 1].iconColor}66)`,
                  borderRadius: 1,
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .process-timeline-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(77, 166, 255, 0.35), transparent);
          z-index: 1;
          pointer-events: none;
        }
        @keyframes timelinePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46,213,115,0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 6px 3px rgba(46,213,115,0.3); }
        }
        @keyframes currentGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(0,208,233,0.3); }
          50% { box-shadow: 0 0 20px rgba(0,208,233,0.5); }
        }
      `}</style>
    </div>
  );
}
