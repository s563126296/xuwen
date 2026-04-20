import { useUIStore } from '../../../stores/uiStore';
import type { CommandStrategy } from '../../../stores/commandStore';
import { playClickSound } from '../../../utils/soundEffects';
import PermissionBadge from './PermissionBadge';

export default function AltStrategyCard({
  strategy,
  hasExecuting,
  isFirst,
}: {
  strategy: CommandStrategy;
  hasExecuting: boolean;
  isFirst: boolean;
}) {
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setPendingStrategy = useUIStore((s) => s.setPendingStrategy);
  const stars = '★'.repeat(strategy.difficulty) + '☆'.repeat(Math.max(0, 5 - strategy.difficulty));

  return (
    <div style={{
      padding: 10,
      background: 'rgba(13,27,42,0.8)',
      border: isFirst ? '1px solid rgba(0,208,233,0.2)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6,
      backdropFilter: 'blur(10px)',
      marginBottom: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {isFirst && (
          <span style={{
            padding: '1px 5px', fontSize: 10, borderRadius: 3,
            background: 'rgba(0,208,233,0.15)', color: '#00D0E9', fontWeight: 500,
          }}>🤖 AI 推荐</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', flex: 1 }}>
          {strategy.id} {strategy.name}
        </span>
      </div>

      {/* Effect description */}
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>{strategy.effect}</div>

      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <PermissionBadge permission={strategy.permission} />
        <span style={{ fontSize: 11, color: '#F5A623', letterSpacing: 1 }}>{stars}</span>
      </div>

      {/* Effect time */}
      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>
        生效时间：<span style={{ color: '#94A3B8' }}>{strategy.effectTime}</span>
      </div>

      {/* Execute button */}
      <button
        onClick={() => {
          playClickSound();
          setPendingStrategy(strategy.id);
          setActiveModal('strategy-confirm');
        }}
        className="cmd-alt-btn"
        style={{
          width: '100%', padding: '5px 0', fontSize: 11, borderRadius: 4,
          background: 'transparent', color: '#00D0E9',
          border: '1px solid rgba(0,208,233,0.25)', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {hasExecuting ? '追加执行' : '执行此方案'}
      </button>
    </div>
  );
}
