import { Play, ListChecks } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import CollapsibleCard from '../common/CollapsibleCard';
import ExecutionResourcePanel from './ExecutionResourcePanel';
import ResourceDecisionPanel from './ResourceDecisionPanel';
import HistoryEffectsSection from './strategy/HistoryEffectsSection';
import { cornerStyles, getLinkedCamera, getLatestFieldFeedback } from './strategy/strategyConstants';
import ActiveStrategyCard from './strategy/ActiveStrategyCard';
import AltStrategyCard from './strategy/AltStrategyCard';

export default function StrategyCommandPanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);
  const resources = useCommandStore((s) => s.commandState.resources);
  const executionResources = useCommandStore((s) => s.commandState.executionResources);
  const startCall = useCommandStore((s) => s.startCall);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  const strategies = cmd.strategies;
  const activeStrategy = strategies.find((s) => s.status === 'executing' || s.status === 'done');
  const altStrategies = strategies.filter((s) => s.status === 'idle').slice(0, 3);
  const hasExecuting = strategies.some((s) => s.status === 'executing');

  const activeStepLabel = cmd.executionSteps.find((s) => s.status === 'active')?.label ?? '';

  const hasIncomingCall = commandFeed.some((f) => f.icon === 'phone' && f.type === 'field');
  const hasUnreadPhoto = commandFeed.some((f) => f.icon === 'photo' && f.type === 'field');

  const handleAcceptCall = () => {
    const phoneMsg = commandFeed.find((f) => f.icon === 'phone');
    if (phoneMsg) {
      const person = fieldPersons.find((p) => p.name === phoneMsg.source);
      if (person) {
        startCall(person.id);
      }
    }
  };

  const handleViewPhoto = () => {
    setActiveModal('photo-viewer');
  };

  const latestFeedback = getLatestFieldFeedback(commandFeed);

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '100%' }}>
      <style>{cornerStyles}</style>

      {/* A. Current Executing Strategy */}
      {activeStrategy && (
        <CollapsibleCard
          title="当前执行策略"
          icon={<Play size={12} style={{ color: '#4da6ff' }} />}
          summary={
            <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
              {activeStrategy.id} {activeStrategy.name} · <span style={{ color: activeStrategy.status === 'done' ? '#2ED573' : '#00D0E9' }}>{activeStrategy.status === 'done' ? '已完成' : '执行中'}</span>
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
      )}

      {/* Resource Decision Panel */}
      {activeStrategy && activeStrategy.requiredResources && activeStrategy.requiredResources.length > 0 && (
        <ResourceDecisionPanel
          strategy={activeStrategy}
          resources={resources}
          executionResources={executionResources}
        />
      )}

      {/* B. Alternative Strategies */}
      {altStrategies.length > 0 && (
        <CollapsibleCard
          title="备选策略"
          icon={<ListChecks size={12} style={{ color: '#4da6ff' }} />}
          summary={
            <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
              {altStrategies.length} 个备选方案
            </div>
          }
          defaultExpanded={true}
        >
          {altStrategies.map((s, idx) => (
            <AltStrategyCard
              key={s.id}
              strategy={s}
              hasExecuting={hasExecuting}
              isFirst={idx === 0}
            />
          ))}
        </CollapsibleCard>
      )}

      {/* History Effects */}
      <HistoryEffectsSection historyEffects={cmd.historyEffects} />

      {/* Execution Resources */}
      <ExecutionResourcePanel />
    </div>
  );
}
