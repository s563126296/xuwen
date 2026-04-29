import { AlertTriangle, ListChecks, Plus } from 'lucide-react';
import { useCommandStore } from '../../../stores/commandStore';
import { useUIStore } from '../../../stores/uiStore';
import CollapsibleCard from '../../common/CollapsibleCard';
import ResourceDecisionPanel from '../ResourceDecisionPanel';
import ActiveStrategyCard from '../strategy/ActiveStrategyCard';
import EnhancedStrategyCard from '../strategy/EnhancedStrategyCard';
import { getLatestFieldFeedback, getLinkedCamera } from '../strategy/strategyConstants';

export default function ExecutingPhasePanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const startCall = useCommandStore((s) => s.startCall);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  const activeStrategy = cmd.strategies.find((s) => s.status === 'executing' || s.status === 'done');
  const alternativeStrategies = cmd.strategies.filter((s) => s.status === 'idle').slice(0, 2);
  const activeStepLabel = cmd.executionSteps.find((s) => s.status === 'active')?.label ?? '';
  const hasIncomingCall = cmd.commandFeed.some((f) => f.icon === 'phone' && f.type === 'field');
  const hasUnreadPhoto = cmd.commandFeed.some((f) => f.icon === 'photo' && f.type === 'field');
  const latestFeedback = getLatestFieldFeedback(cmd.commandFeed);

  const handleAcceptCall = () => {
    const phoneMsg = cmd.commandFeed.find((f) => f.icon === 'phone');
    if (!phoneMsg) return;

    const person = cmd.fieldPersons.find((p) => p.name === phoneMsg.source);
    if (person) {
      startCall(person.id);
    }
  };

  const handleViewPhoto = () => {
    setActiveModal('photo-viewer');
  };

  if (!activeStrategy) return null;

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '100%' }}>
      <CollapsibleCard
        title="当前执行策略"
        icon={undefined}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            {activeStrategy.id} {activeStrategy.name} · <span style={{ color: '#00D0E9' }}>执行中</span>
          </div>
        }
        defaultExpanded={true}
      >
        <ActiveStrategyCard
          strategy={activeStrategy}
          currentStep={cmd.currentStep}
          congestionIndex={cmd.congestionIndex}
          predictedIndex={cmd.predictedIndex}
          activeStepLabel={activeStepLabel}
          hasIncomingCall={hasIncomingCall}
          hasUnreadPhoto={hasUnreadPhoto}
          linkedCamera={getLinkedCamera(activeStrategy.id)}
          latestFeedback={latestFeedback}
          onAcceptCall={handleAcceptCall}
          onViewPhoto={handleViewPhoto}
        />
      </CollapsibleCard>

      {activeStrategy.requiredResources && activeStrategy.requiredResources.length > 0 && (
        <ResourceDecisionPanel
          strategy={activeStrategy}
          resources={cmd.resources}
          executionResources={cmd.executionResources}
        />
      )}

      <CollapsibleCard
        title="偏差摘要"
        icon={<AlertTriangle size={12} style={{ color: '#4da6ff' }} />}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            偏差 <span style={{ color: cmd.monitorState.deviationPercent > 0 ? '#F5A623' : '#2ED573' }}>{cmd.monitorState.deviationPercent}%</span>
          </div>
        }
        defaultExpanded={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>
            当前等级：
            <span style={{ color: cmd.monitorState.deviationLevel === 'none' ? '#2ED573' : '#F5A623' }}>
              {cmd.monitorState.deviationLevel === 'none' ? '正常' : cmd.monitorState.deviationLevel.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
            {cmd.monitorState.activeInquiry?.question ?? '左下角偏差监控面板持续跟踪效果曲线，目前未发现需要升级处理的异常。'}
          </div>
        </div>
      </CollapsibleCard>

      {alternativeStrategies.length > 0 && (
        <CollapsibleCard
          title="备选/追加策略"
          icon={<ListChecks size={12} style={{ color: '#4da6ff' }} />}
          summary={
            <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
              {alternativeStrategies.length} 个可追加方案
            </div>
          }
          defaultExpanded={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alternativeStrategies.map((strategy) => (
              <EnhancedStrategyCard
                key={strategy.id}
                strategy={strategy}
                commandState={cmd}
                hasExecuting={true}
              />
            ))}
          </div>
        </CollapsibleCard>
      )}

      <button
        onClick={() => setActiveModal('custom-strategy')}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 6,
          background: 'rgba(13,27,42,0.8)',
          color: '#94A3B8',
          border: '1px dashed rgba(148,163,184,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Plus size={14} />
        自定义策略
      </button>
    </div>
  );
}
