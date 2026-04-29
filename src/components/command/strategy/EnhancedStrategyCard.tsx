import { Play, TrendingUp, Clock, Package } from 'lucide-react';
import type { CommandStrategy, CommandState } from '../../../stores/commandStore';
import { playClickSound } from '../../../utils/soundEffects';
import { useUIStore } from '../../../stores/uiStore';
import PermissionBadge from './PermissionBadge';
import {
  generateRecommendationReason,
  calculateMatchRate,
  calculateConfidence,
  generateEffectCheckpoints,
} from '../../../utils/strategyReasonGenerator';

interface EnhancedStrategyCardProps {
  strategy: CommandStrategy;
  commandState: CommandState;
  isFirst?: boolean;
  hasExecuting?: boolean;
}

export default function EnhancedStrategyCard({
  strategy,
  commandState,
  isFirst = false,
  hasExecuting = false,
}: EnhancedStrategyCardProps) {
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setPendingStrategy = useUIStore((s) => s.setPendingStrategy);

  const reason = generateRecommendationReason(strategy, commandState);
  const matchRate = calculateMatchRate(strategy, commandState.causes);
  const confidence = calculateConfidence(strategy, commandState.causes, commandState);
  const checkpoints = generateEffectCheckpoints(strategy, commandState.congestionIndex);

  const historicalData = strategy.historicalData ?? {
    executionCount: 0,
    successRate: 0,
    avgReliefMinutes: 0,
  };

  const requiredResources = strategy.requiredResources ?? [];
  const maxArrival = requiredResources.length > 0
    ? Math.max(...requiredResources.map((r) => r.estimatedArrivalMin))
    : 0;

  const allResourcesSatisfied = requiredResources.every((req) => {
    switch (req.type) {
      case 'police':
        return commandState.resources.policeAvailable >= req.quantity;
      case 'tow_truck':
        return commandState.resources.towTrucksAvailable >= req.quantity;
      case 'cone': {
        const cone = commandState.executionResources.materials.find((m) => m.name === '锥桶');
        return (cone?.ready ?? 0) >= req.quantity;
      }
      case 'led_screen': {
        const led = commandState.executionResources.materials.find((m) => m.name === '诱导屏');
        return (led?.ready ?? 0) >= req.quantity;
      }
      default:
        return true;
    }
  });

  const stars = '★'.repeat(strategy.difficulty) + '☆'.repeat(Math.max(0, 5 - strategy.difficulty));

  const handleExecute = () => {
    playClickSound();
    setPendingStrategy(strategy.id);
    setActiveModal('strategy-confirm');
  };

  return (
    <div
      style={{
        padding: 12,
        background: isFirst ? 'rgba(0,208,233,0.08)' : 'rgba(13,27,42,0.9)',
        border: isFirst ? '1px solid rgba(0,208,233,0.35)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        backdropFilter: 'blur(10px)',
        boxShadow: isFirst ? '0 0 16px rgba(0,208,233,0.12)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isFirst && (
            <span
              style={{
                padding: '2px 6px',
                fontSize: 10,
                borderRadius: 3,
                background: 'rgba(0,208,233,0.2)',
                color: '#00D0E9',
                fontWeight: 600,
              }}
            >
              AI 推荐
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
            {strategy.id} {strategy.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PermissionBadge permission={strategy.permission} />
          <span style={{ fontSize: 11, color: '#F5A623', letterSpacing: 1 }}>{stars}</span>
        </div>
      </div>

      {/* Recommendation reason */}
      <div
        style={{
          fontSize: 11,
          color: '#94A3B8',
          lineHeight: 1.5,
          marginBottom: 10,
          padding: 8,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 4,
          borderLeft: '2px solid rgba(0,208,233,0.4)',
        }}
      >
        {reason}
      </div>

      {/* Historical evidence */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <TrendingUp size={12} color="#64748B" />
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>历史依据</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            执行次数：
            <span style={{ color: '#00D0E9', fontFamily: 'DIN, sans-serif', fontWeight: 600 }}>
              {historicalData.executionCount}
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            成功率：
            <span style={{ color: '#2ED573', fontFamily: 'DIN, sans-serif', fontWeight: 600 }}>
              {Math.round(historicalData.successRate * 100)}%
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            匹配度：
            <span style={{ color: '#00D0E9', fontFamily: 'DIN, sans-serif', fontWeight: 600 }}>
              {matchRate}%
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            置信度：
            <span style={{ color: '#00D0E9', fontFamily: 'DIN, sans-serif', fontWeight: 600 }}>
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Expected effect timeline */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <Clock size={12} color="#64748B" />
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>预期效果</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {checkpoints.map((cp, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#94A3B8',
              }}
            >
              <span>
                {cp.label}（{cp.minutesAfter}min）
              </span>
              <span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9' }}>
                {cp.expectedIndex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource requirements summary */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <Package size={12} color="#64748B" />
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>所需资源</span>
        </div>
        {requiredResources.length > 0 ? (
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            {requiredResources.map((req, idx) => {
              const labels: Record<typeof req.type, string> = {
                police: '交警',
                tow_truck: '拖车',
                cone: '锥桶',
                led_screen: '诱导屏',
              };
              return (
                <span key={idx}>
                  {labels[req.type]} {req.quantity}
                  {idx < requiredResources.length - 1 ? ' · ' : ''}
                </span>
              );
            })}
            {' '}
            <span style={{ color: allResourcesSatisfied ? '#2ED573' : '#F5A623' }}>
              {allResourcesSatisfied ? '✓ 全部满足' : '⚠ 部分不足'}
            </span>
            {' · '}
            预计 <span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9' }}>{maxArrival}</span> min 到位
          </div>
        ) : (
          <div style={{ fontSize: 10, color: '#94A3B8' }}>无需额外资源</div>
        )}
      </div>

      {/* Execute button */}
      <button
        onClick={handleExecute}
        style={{
          width: '100%',
          padding: '8px 0',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 4,
          background: isFirst
            ? 'linear-gradient(135deg, rgba(0,208,233,0.2), rgba(0,208,233,0.15))'
            : 'transparent',
          color: '#00D0E9',
          border: isFirst ? '1px solid rgba(0,208,233,0.5)' : '1px solid rgba(0,208,233,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,208,233,0.25)';
          e.currentTarget.style.borderColor = 'rgba(0,208,233,0.6)';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(0,208,233,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isFirst
            ? 'linear-gradient(135deg, rgba(0,208,233,0.2), rgba(0,208,233,0.15))'
            : 'transparent';
          e.currentTarget.style.borderColor = isFirst ? 'rgba(0,208,233,0.5)' : 'rgba(0,208,233,0.3)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Play size={14} />
        {hasExecuting ? '追加执行' : '执行此方案'}
      </button>
    </div>
  );
}
