import { CheckCircle2, FileText, ArrowLeft, Brain } from 'lucide-react';
import { useCommandStore } from '../../../stores/commandStore';
import { useUIStore } from '../../../stores/uiStore';
import CollapsibleCard from '../../common/CollapsibleCard';

const INITIAL_INDEX = 6.5;

export default function CompletedPhasePanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const exitCommandMode = useCommandStore((s) => s.exitCommandMode);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  const completedStrategy = cmd.strategies.find((s) => s.status === 'done');
  const activeExecution = cmd.activeExecutionId
    ? cmd.executionRecords.find((record) => record.id === cmd.activeExecutionId)
    : null;

  if (!completedStrategy) return null;

  const targetDrop = INITIAL_INDEX - cmd.predictedIndex;
  const actualDrop = INITIAL_INDEX - cmd.congestionIndex;
  const achievementRate = targetDrop > 0 ? Math.round((actualDrop / targetDrop) * 100) : 100;
  const durationMinutes = activeExecution?.endTime && activeExecution.startTime
    ? Math.max(1, Math.round((activeExecution.endTime - activeExecution.startTime) / 60000))
    : completedStrategy.historicalData?.avgReliefMinutes ?? 25;

  const indexDelta = Number((INITIAL_INDEX - cmd.congestionIndex).toFixed(1));
  const aiLearningSummary = activeExecution?.aiLearnings?.[0]
    ? `${activeExecution.aiLearnings[0].newFactor} 已纳入学习，相关策略预测准确率由 ${Math.round(activeExecution.aiLearnings[0].accuracyChange.before * 100)}% 提升至 ${Math.round(activeExecution.aiLearnings[0].accuracyChange.after * 100)}%。`
    : `本次处置验证了“${cmd.causes[0]?.label ?? '当前归因'}”对 ${completedStrategy.name} 的适用性，后续将继续优化匹配阈值。`;

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '100%' }}>
      <CollapsibleCard
        title="执行结果"
        icon={<CheckCircle2 size={12} style={{ color: '#2ED573' }} />}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            {completedStrategy.id} {completedStrategy.name} · <span style={{ color: '#2ED573' }}>已完成</span>
          </div>
        }
        defaultExpanded={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>
            {completedStrategy.id} {completedStrategy.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>执行时长</span>
            <span style={{ color: '#E2E8F0', fontFamily: 'DIN, sans-serif' }}>{durationMinutes} min</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>指数变化</span>
            <span style={{ color: '#2ED573', fontFamily: 'DIN, sans-serif' }}>
              {INITIAL_INDEX.toFixed(1)} → {cmd.congestionIndex.toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>改善幅度</span>
            <span style={{ color: '#2ED573', fontFamily: 'DIN, sans-serif' }}>↓ {indexDelta}</span>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="达成率"
        icon={<CheckCircle2 size={12} style={{ color: '#4da6ff' }} />}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            目标达成 <span style={{ color: achievementRate >= 100 ? '#2ED573' : '#F5A623' }}>{achievementRate}%</span>
          </div>
        }
        defaultExpanded={true}
      >
        <div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
            <div
              style={{
                width: `${Math.min(achievementRate, 100)}%`,
                height: '100%',
                background: achievementRate >= 100
                  ? 'linear-gradient(90deg, #2ED573, #6EE7B7)'
                  : 'linear-gradient(90deg, #F5A623, #FCD34D)',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
            目标指数 {cmd.predictedIndex.toFixed(1)}，实际指数 {cmd.congestionIndex.toFixed(1)}。
            {achievementRate >= 100 ? ' 本次执行达到或超过预期效果。' : ' 本次执行接近预期，建议结合复盘继续优化。'}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="AI 学习摘要"
        icon={<Brain size={12} style={{ color: '#4da6ff' }} />}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            已沉淀本次执行经验
          </div>
        }
        defaultExpanded={true}
      >
        <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>
          {aiLearningSummary}
        </div>
      </CollapsibleCard>

      <button
        onClick={() => setActiveModal('command-report')}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
          background: 'rgba(46,213,115,0.1)',
          color: '#2ED573',
          border: '1px solid rgba(46,213,115,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <FileText size={14} />
        查看复盘报告
      </button>

      <button
        onClick={exitCommandMode}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
          background: 'rgba(0,208,233,0.1)',
          color: '#00D0E9',
          border: '1px solid rgba(0,208,233,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <ArrowLeft size={14} />
        返回总览模式
      </button>
    </div>
  );
}
