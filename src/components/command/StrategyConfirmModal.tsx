import Modal from '../Modal';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import type { StrategyPermission } from '../../stores/commandStore';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { checkConflicts } from '../../utils/strategyConflicts';

function PermissionBadge({ permission }: { permission: StrategyPermission }) {
  if (permission === 'approve') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(255,71,87,0.15)', color: '#FF4757',
      }}>
        <ShieldAlert size={12} color="#FF4757" />需审批
      </span>
    );
  }
  if (permission === 'confirm') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(245,158,11,0.15)', color: '#F5A623',
      }}>
        <ShieldCheck size={12} color="#F5A623" />需确认
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 9999, fontSize: 10,
      background: 'rgba(46,213,115,0.15)', color: '#2ED573',
    }}>
      直接执行
    </span>
  );
}

export default function StrategyConfirmModal() {
  const pendingStrategyId = useUIStore((s) => s.pendingStrategyId);
  const commandState = useCommandStore((s) => s.commandState);
  const executeStrategy = useCommandStore((s) => s.executeStrategy);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setPendingStrategy = useUIStore((s) => s.setPendingStrategy);

  if (!pendingStrategyId) return null;

  const strategy = commandState.strategies.find(s => s.id === pendingStrategyId);
  if (!strategy) return null;

  const executingIds = commandState.strategies
    .filter(s => s.status === 'executing')
    .map(s => s.id);
  const conflicts = checkConflicts(executingIds, pendingStrategyId);

  const handleConfirm = () => {
    executeStrategy(pendingStrategyId);
    setPendingStrategy(null);
    setActiveModal(null);
  };

  const handleCancel = () => {
    setPendingStrategy(null);
    setActiveModal(null);
  };

  const stars = '★'.repeat(strategy.difficulty) + '☆'.repeat(Math.max(0, 5 - strategy.difficulty));

  return (
    <Modal id="strategy-confirm" title="确认执行策略" width={500}>
      <div style={{
        background: 'rgba(13,27,42,0.9)',
        border: '1px solid rgba(0,208,233,0.25)',
        borderRadius: 6,
        padding: 16,
        backdropFilter: 'blur(10px)',
      }}>
        {/* Strategy ID + Name */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
            {strategy.id} {strategy.name}
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Effect */}
          <div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>预计效果</div>
            <div style={{ fontSize: 13, color: '#E2E8F0' }}>{strategy.effect}</div>
          </div>

          {/* Time + Reduce */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>执行时长</div>
              <div style={{ fontSize: 13, color: '#E2E8F0' }}>{strategy.effectTime}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>预计减少车辆</div>
              <div style={{ fontSize: 13, color: '#2ED573', fontWeight: 600 }}>{strategy.reduce}</div>
            </div>
          </div>

          {/* Permission + Difficulty */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>权限要求</div>
              <PermissionBadge permission={strategy.permission} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>难度等级</div>
              <div style={{ fontSize: 13, color: '#F5A623', letterSpacing: 1 }}>{stars}</div>
            </div>
          </div>

          {/* Risk */}
          {strategy.risk && (
            <div style={{
              padding: 10,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 4,
            }}>
              <div style={{ fontSize: 11, color: '#F5A623', marginBottom: 4, fontWeight: 600 }}>⚠️ 风险提示</div>
              <div style={{ fontSize: 12, color: '#FCD34D' }}>{strategy.risk}</div>
            </div>
          )}

          {/* Conflict detection */}
          {conflicts.length > 0 && (
            <div style={{
              padding: 10,
              background: conflicts.some(c => c.type === 'exclusive') ? 'rgba(255,71,87,0.1)' : 'rgba(245,166,35,0.1)',
              border: `1px solid ${conflicts.some(c => c.type === 'exclusive') ? 'rgba(255,71,87,0.3)' : 'rgba(245,166,35,0.3)'}`,
              borderRadius: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={14} color={conflicts.some(c => c.type === 'exclusive') ? '#FF4757' : '#F5A623'} />
                <span style={{ fontSize: 11, fontWeight: 600, color: conflicts.some(c => c.type === 'exclusive') ? '#FF4757' : '#F5A623' }}>
                  策略冲突检测
                </span>
              </div>
              {conflicts.map((c, i) => (
                <div key={i} style={{ marginBottom: i < conflicts.length - 1 ? 8 : 0 }}>
                  <div style={{ fontSize: 11, color: '#E2E8F0', marginBottom: 2 }}>
                    <span style={{ color: c.type === 'exclusive' ? '#FF4757' : '#F5A623', fontWeight: 600 }}>
                      {c.type === 'exclusive' ? '互斥' : c.type === 'constraint' ? '约束' : '联动'}
                    </span>
                    {' '}{c.strategyA} ↔ {c.strategyB}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{c.description}</div>
                  {c.suggestion && (
                    <div style={{ fontSize: 10, color: '#00D0E9', marginTop: 2 }}>建议：{c.suggestion}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(100,116,139,0.15)',
              border: '1px solid rgba(100,116,139,0.3)',
              color: '#94A3B8',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100,116,139,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(100,116,139,0.15)';
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(0,208,233,0.15)',
              border: '1px solid rgba(0,208,233,0.4)',
              color: '#00D0E9',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.25)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(0,208,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            确认执行
          </button>
        </div>
      </div>
    </Modal>
  );
}
