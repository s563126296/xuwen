import { useUIStore } from '../stores';
import type { SystemMode } from '../stores';

export default function ModeSwitcher() {
  const systemMode = useUIStore((s) => s.systemMode);
  const setSystemMode = useUIStore((s) => s.setSystemMode);

  const modes: { id: SystemMode; label: string }[] = [
    { id: 'overview', label: '总览' },
    { id: 'port', label: '港口' },
    { id: 'command', label: '指挥' },
    { id: 'emergency', label: '应急' },
    { id: 'analysis', label: '统计分析' },
    { id: 'ai-decision', label: 'AI决策' },
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
          onClick={() => setSystemMode(mode.id)}
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
