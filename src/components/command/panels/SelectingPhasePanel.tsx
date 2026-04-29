import { ListChecks, Plus, Package } from 'lucide-react';
import { useCommandStore } from '../../../stores/commandStore';
import CollapsibleCard from '../../common/CollapsibleCard';
import EnhancedStrategyCard from '../strategy/EnhancedStrategyCard';

export default function SelectingPhasePanel() {
  const cmd = useCommandStore((s) => s.commandState);
  const resources = useCommandStore((s) => s.commandState.resources);
  const executionResources = useCommandStore((s) => s.commandState.executionResources);

  const recommendedStrategy = cmd.strategies.find((s) => s.recommended && s.status === 'idle');
  const alternativeStrategies = cmd.strategies.filter((s) => !s.recommended && s.status === 'idle').slice(0, 3);

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '100%' }}>
      {/* AI Recommended Strategy */}
      {recommendedStrategy && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#00D0E9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 3, height: 12, background: '#00D0E9', borderRadius: 2 }} />
            AI 推荐策略
          </div>
          <EnhancedStrategyCard
            strategy={recommendedStrategy}
            commandState={cmd}
            isFirst={true}
            hasExecuting={false}
          />
        </div>
      )}

      {/* Alternative Strategies */}
      {alternativeStrategies.length > 0 && (
        <CollapsibleCard
          title="备选策略"
          icon={<ListChecks size={12} style={{ color: '#4da6ff' }} />}
          summary={
            <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
              {alternativeStrategies.length} 个备选方案
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
                isFirst={false}
                hasExecuting={false}
              />
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Custom Strategy Entry (Placeholder) */}
      <button
        onClick={() => alert('自定义策略功能开发中')}
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
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(13,27,42,0.95)';
          e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)';
          e.currentTarget.style.color = '#E2E8F0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(13,27,42,0.8)';
          e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)';
          e.currentTarget.style.color = '#94A3B8';
        }}
      >
        <Plus size={14} />
        自定义策略
      </button>

      {/* Available Resources Summary */}
      <CollapsibleCard
        title="当前可用资源"
        icon={<Package size={12} style={{ color: '#4da6ff' }} />}
        summary={
          <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
            交警 <span style={{ color: '#2ED573' }}>{resources.policeAvailable}</span> 人 · 拖车 <span style={{ color: '#2ED573' }}>{resources.towTrucksAvailable}</span> 台
          </div>
        }
        defaultExpanded={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>在岗交警</span>
            <span style={{ color: '#E2E8F0', fontFamily: 'DIN, sans-serif' }}>
              {resources.policeAvailable} / {resources.policeOnDuty} 人
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>可用拖车</span>
            <span style={{ color: '#E2E8F0', fontFamily: 'DIN, sans-serif' }}>
              {resources.towTrucksAvailable} 台
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#94A3B8' }}>可用无人机</span>
            <span style={{ color: '#E2E8F0', fontFamily: 'DIN, sans-serif' }}>
              {resources.dronesAvailable} 架
            </span>
          </div>
          {executionResources.materials.map((mat, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: '#94A3B8' }}>{mat.name}</span>
              <span style={{ color: '#E2E8F0', fontFamily: 'DIN, sans-serif' }}>
                {mat.ready} / {mat.total} {mat.unit}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
