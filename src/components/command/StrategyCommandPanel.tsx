import { Plus } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import ExecutionResourcePanel from './ExecutionResourcePanel';
import HistoryStatsPanel from './HistoryStatsPanel';
import { cornerStyles, getLinkedCamera, getLatestFieldFeedback } from './strategy/strategyConstants';
import SectionHeader from './strategy/SectionHeader';
import ActiveStrategyCard from './strategy/ActiveStrategyCard';
import AltStrategyCard from './strategy/AltStrategyCard';
import CustomStrategyGrid from './strategy/CustomStrategyGrid';
import HistoryEffectsSection from './strategy/HistoryEffectsSection';

export default function StrategyCommandPanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);
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
        <div className="module-card cmd-panel-section" style={{ padding: 14 }}>
          <SectionHeader title="当前执行策略" />
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
        </div>
      )}

      {/* B. Alternative Strategies */}
      {altStrategies.length > 0 && (
        <div className="module-card cmd-panel-section" style={{ padding: 14 }}>
          <SectionHeader title="备选策略" />
          {altStrategies.map((s, idx) => (
            <AltStrategyCard
              key={s.id}
              strategy={s}
              hasExecuting={hasExecuting}
              isFirst={idx === 0}
            />
          ))}
        </div>
      )}

      {/* History Effects */}
      <HistoryEffectsSection historyEffects={cmd.historyEffects} />

      {/* C. Custom Strategy Templates */}
      <div className="module-card cmd-panel-section" style={{ padding: 14 }}>
        <SectionHeader title="自定义策略" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <Plus size={12} color="#64748B" />
          <span style={{ fontSize: 11, color: '#64748B' }}>选择模板快速创建</span>
        </div>
        <CustomStrategyGrid />
      </div>

      {/* E4. Execution Resources */}
      <ExecutionResourcePanel />

      {/* I. History Stats */}
      <HistoryStatsPanel />
    </div>
  );
}
