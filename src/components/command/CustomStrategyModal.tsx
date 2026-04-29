import { useState } from 'react';
import { X, CheckCircle2, Plus, Library } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useCommandStore } from '../../stores/commandStore';
import type { CommandStrategy } from '../../stores/commandStore';

// 15 standard strategies from project docs
const STANDARD_STRATEGIES: Array<{
  id: string;
  name: string;
  description: string;
  permission: 'auto' | 'confirm' | 'approve';
  permissionLabel: string;
}> = [
  { id: 'S-01', name: '应急车道借用', description: '借用应急车道增加通行能力', permission: 'approve', permissionLabel: '🔴 需审批' },
  { id: 'S-02', name: 'S376省道分流', description: '引导车辆经S376省道绕行', permission: 'confirm', permissionLabel: '🟡 需确认' },
  { id: 'S-03', name: 'G207国道分流', description: '引导车辆经G207国道绕行', permission: 'confirm', permissionLabel: '🟡 需确认' },
  { id: 'S-04', name: '信号灯配时优化', description: '调整关键路口信号灯配时', permission: 'confirm', permissionLabel: '🟡 需确认' },
  { id: 'S-05', name: '港口增开班次', description: '通知港口方增加航班', permission: 'auto', permissionLabel: '🟢 通知' },
  { id: 'S-06', name: '限流入港', description: '分批放行控制入港车流', permission: 'approve', permissionLabel: '🔴 需审批' },
  { id: 'S-07', name: '事故快速处置', description: '调度拖车警力快速清障', permission: 'confirm', permissionLabel: '🟡 需确认' },
  { id: 'S-08', name: '临时停车区启用', description: '启用临时停车场分流等待车辆', permission: 'confirm', permissionLabel: '🟡 跨部门' },
  { id: 'S-09', name: '诱导屏信息发布', description: '更新诱导屏显示分流信息', permission: 'auto', permissionLabel: '🟢 自动' },
  { id: 'S-10', name: '海安新港分流', description: '引导部分车辆到海安新港', permission: 'auto', permissionLabel: '🟢 通知' },
  { id: 'S-11', name: '货客分时通行', description: '高峰期货车限行客车优先', permission: 'approve', permissionLabel: '🔴 需审批' },
  { id: 'S-12', name: '特殊车辆优先通道', description: '冷链危化品车辆优先放行', permission: 'auto', permissionLabel: '🟢 通知' },
  { id: 'S-13', name: '潮汐车道借用', description: '借用对向车道增加通行能力', permission: 'approve', permissionLabel: '🔴 需审批' },
  { id: 'S-14', name: '交警增援部署', description: '增派交警到关键路口疏导', permission: 'confirm', permissionLabel: '🟡 需确认' },
  { id: 'S-15', name: '预约通行引导', description: '引导车辆预约时段通行', permission: 'auto', permissionLabel: '🟢 自动' },
];

export default function CustomStrategyModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setCommandState = useCommandStore((s) => s.setCommandState);
  const commandState = useCommandStore((s) => s.commandState);
  const executeStrategy = useCommandStore((s) => s.executeStrategy);

  if (activeModal !== 'custom-strategy') return null;

  const [activeTab, setActiveTab] = useState<'library' | 'manual'>('library');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Manual form state
  const [manualName, setManualName] = useState('');
  const [manualAction, setManualAction] = useState('');
  const [manualEffect, setManualEffect] = useState('');

  // Filter out strategies already in the command state
  const existingIds = new Set(commandState.strategies.map((s) => s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLibraryConfirm = () => {
    if (selectedIds.size === 0) return;

    const newStrategies: CommandStrategy[] = [];
    selectedIds.forEach((id) => {
      const std = STANDARD_STRATEGIES.find((s) => s.id === id);
      if (!std) return;
      newStrategies.push({
        id: std.id,
        name: std.name,
        recommended: false,
        permission: std.permission,
        permissionLabel: std.permissionLabel,
        effect: '--',
        time: '--',
        reduce: '--',
        difficulty: 1,
        effectTime: '--',
        risk: '--',
        triggerCondition: '手动选择',
        status: 'idle',
      });
    });

    setCommandState({
      strategies: [...commandState.strategies, ...newStrategies],
    });

    // Execute the first selected strategy
    if (newStrategies.length === 1) {
      executeStrategy(newStrategies[0].id);
    }

    setActiveModal(null);
  };

  const handleManualAdd = () => {
    if (!manualName.trim() || !manualAction.trim()) return;

    const customId = `C-${String(Date.now()).slice(-4)}`;
    const newStrategy: CommandStrategy = {
      id: customId,
      name: manualName.trim(),
      recommended: false,
      permission: 'confirm',
      permissionLabel: '自定义',
      effect: manualEffect.trim() || '--',
      time: '--',
      reduce: '--',
      difficulty: 1,
      effectTime: '--',
      risk: '--',
      triggerCondition: manualAction.trim(),
      status: 'idle',
    };

    setCommandState({
      strategies: [...commandState.strategies, newStrategy],
    });

    executeStrategy(customId);
    setActiveModal(null);
  };

  const handleClose = () => setActiveModal(null);

  // Permission badge color
  const getPermColor = (perm: string) => {
    if (perm === 'approve') return '#EF4444';
    if (perm === 'confirm') return '#F59E0B';
    return '#10B981';
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520, maxHeight: '80vh',
          background: 'linear-gradient(135deg, rgba(13,27,42,0.98), rgba(10,15,25,0.98))',
          border: '1px solid rgba(0,208,233,0.2)',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
            自定义策略
          </span>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748B', padding: 4, display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {(['library', 'manual'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === tab ? '#00D0E9' : '#64748B',
                borderBottom: activeTab === tab ? '2px solid #00D0E9' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {tab === 'library' ? <Library size={13} /> : <Plus size={13} />}
              {tab === 'library' ? '策略库选择' : '手动新增'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {activeTab === 'library' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STANDARD_STRATEGIES.map((std) => {
                const alreadyExists = existingIds.has(std.id);
                const isSelected = selectedIds.has(std.id);
                return (
                  <div
                    key={std.id}
                    onClick={() => !alreadyExists && toggleSelect(std.id)}
                    style={{
                      padding: 12, borderRadius: 6,
                      background: isSelected ? 'rgba(0,208,233,0.08)' : 'rgba(13,27,42,0.6)',
                      border: `1px solid ${isSelected ? 'rgba(0,208,233,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: alreadyExists ? 'not-allowed' : 'pointer',
                      opacity: alreadyExists ? 0.4 : 1,
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 3, marginTop: 2,
                      border: `2px solid ${isSelected ? '#00D0E9' : '#334155'}`,
                      background: isSelected ? '#00D0E9' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && <CheckCircle2 size={10} style={{ color: '#0A0F19' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>
                          {std.id} {std.name}
                        </span>
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 3,
                          background: `${getPermColor(std.permission)}15`,
                          color: getPermColor(std.permission),
                        }}>
                          {std.permissionLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                        {std.description}
                      </div>
                      {alreadyExists && (
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
                          已在策略列表中
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, display: 'block' }}>
                  策略名称 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="例如：临时交通管制"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12,
                    background: 'rgba(13,27,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6, color: '#E2E8F0', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, display: 'block' }}>
                  执行动作描述 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  placeholder="详细描述策略的执行步骤和具体措施"
                  rows={4}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12,
                    background: 'rgba(13,27,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6, color: '#E2E8F0', outline: 'none', resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, display: 'block' }}>
                  预期效果描述（可选）
                </label>
                <input
                  type="text"
                  value={manualEffect}
                  onChange={(e) => setManualEffect(e.target.value)}
                  placeholder="例如：预计缓解拥堵 30%"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12,
                    background: 'rgba(13,27,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6, color: '#E2E8F0', outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px', fontSize: 12, fontWeight: 500,
              background: 'rgba(100,116,139,0.1)', color: '#94A3B8',
              border: '1px solid rgba(100,116,139,0.2)', borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          {activeTab === 'library' ? (
            <button
              onClick={handleLibraryConfirm}
              disabled={selectedIds.size === 0}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600,
                background: selectedIds.size > 0 ? 'linear-gradient(135deg, #00D0E9, #0EA5E9)' : 'rgba(100,116,139,0.2)',
                color: selectedIds.size > 0 ? '#0A0F19' : '#64748B',
                border: 'none', borderRadius: 6,
                cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              确认执行 ({selectedIds.size})
            </button>
          ) : (
            <button
              onClick={handleManualAdd}
              disabled={!manualName.trim() || !manualAction.trim()}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600,
                background: (manualName.trim() && manualAction.trim())
                  ? 'linear-gradient(135deg, #00D0E9, #0EA5E9)'
                  : 'rgba(100,116,139,0.2)',
                color: (manualName.trim() && manualAction.trim()) ? '#0A0F19' : '#64748B',
                border: 'none', borderRadius: 6,
                cursor: (manualName.trim() && manualAction.trim()) ? 'pointer' : 'not-allowed',
              }}
            >
              添加并执行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
