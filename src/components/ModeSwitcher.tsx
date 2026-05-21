import { useUIStore } from '../stores';
import { useOverviewStore } from '../stores/overviewStore';
import type { SystemMode } from '../stores';

export default function ModeSwitcher() {
  const systemMode = useUIStore((s) => s.systemMode);
  const setSystemMode = useUIStore((s) => s.setSystemMode);
  const clearActiveAlert = useOverviewStore((s) => s.clearActiveAlert);

  const modes: { id: SystemMode; label: string }[] = [
    { id: 'overview', label: '总览监测' },
    { id: 'command', label: '指挥处置' },
    { id: 'analysis', label: '统计分析' },
    // v2.2: 已收敛到三大模式（与建设方案一致）
    // 港口模式已废弃；应急模式已合并到指挥处置；AI 分析/AI 策略将作为指挥模式子视图
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 2,
      padding: 3,
      borderRadius: 6,
      background: '#1E293B'
    }}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          aria-label={`切换到${mode.label}`}
          onClick={() => {
            (window as any).__lastManualModeSwitch = Date.now();
            // Clear alert popup when switching away from overview mode
            if (systemMode === 'overview' && mode.id !== 'overview') {
              clearActiveAlert();
            }
            setSystemMode(mode.id);
          }}
          style={{
            padding: '6px 14px',
            borderRadius: 4,
            border: 'none',
            fontSize: 12,
            fontWeight: systemMode === mode.id ? 600 : 400,
            color: systemMode === mode.id ? '#00D0E9' : '#64748B',
            background: systemMode === mode.id ? 'rgba(0, 208, 233, 0.15)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: systemMode === mode.id ? '1px solid rgba(0, 208, 233, 0.4)' : 'none'
          }}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
