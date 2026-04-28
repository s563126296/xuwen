import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

const levelColors: Record<string, string> = {
  none: '#2ED573',
  yellow: '#F5A623',
  orange: '#F97316',
  red: '#FF4757',
};

const phaseLabels = ['策略确认', '指令下发', '现场执行', '效果验证'];

export default function DeviationMonitorPanel() {
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const executionSteps = useCommandStore((s) => s.commandState.executionSteps);
  const [showVersions, setShowVersions] = useState(false);

  if (!monitorState.isMonitoring && monitorState.curveData.length === 0) return null;

  const { curveData, deviationLevel, deviationPercent, expectationVersions } = monitorState;
  const borderColor = deviationLevel === 'red' ? '#FF4757' : deviationLevel === 'orange' ? '#F97316' : 'rgba(0, 208, 233, 0.25)';
  const latestVersion = expectationVersions[expectationVersions.length - 1];
  const elapsedMin = monitorState.isMonitoring
    ? Math.round((Date.now() - monitorState.monitorStartTime) / 60000)
    : '--';

  return (
    <div style={{
      background: 'rgba(13, 17, 55, 0.95)',
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: '16px 20px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      animation: deviationLevel === 'red' ? 'pulse 1.5s infinite' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#00D0E9" />
          <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>策略执行监控</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>已执行 {elapsedMin} min</span>
          <span style={{
            fontSize: 16, fontWeight: 700,
            color: levelColors[deviationLevel],
            textShadow: deviationLevel === 'red' ? '0 0 8px rgba(255,71,87,0.5)' : 'none',
          }}>
            偏差 {deviationPercent}%
          </span>
        </div>
      </div>

      {/* Execution phase progress (replaces StrategyFlowBar) */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {phaseLabels.map((label, i) => {
          const step = executionSteps[i];
          const isDone = step?.status === 'done';
          const isActive = step?.status === 'active';
          const color = isDone ? '#2ED573' : isActive ? '#00D0E9' : '#334155';
          return (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                height: 3, width: '100%', borderRadius: 2,
                background: color,
                opacity: isDone || isActive ? 1 : 0.4,
              }} />
              <span style={{ fontSize: 9, color: isDone ? '#2ED573' : isActive ? '#00D0E9' : '#64748B' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {curveData.length > 1 ? (
        <div style={{ height: 200, marginBottom: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="deviationFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4757" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FF4757" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="minutesAfter"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(v) => `${Math.round(v)}m`}
                axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                tickLine={false}
                domain={['auto', 'auto']}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(13,17,55,0.95)',
                  border: '1px solid rgba(0,208,233,0.3)',
                  borderRadius: 6, fontSize: 12, padding: '8px 12px',
                }}
                formatter={(value: number, name: string) => [
                  value.toFixed(1),
                  name === 'expected' ? '预期' : '实际',
                ]}
                labelFormatter={(v) => `${Math.round(Number(v))} 分钟`}
              />
              {[30, 60, 90, 120].map((m) => (
                <ReferenceLine key={m} x={m} stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
              ))}
              <Area
                type="monotone" dataKey="expected"
                stroke="#00D0E9" strokeDasharray="6 4"
                fill="none" strokeWidth={2}
              />
              <Area
                type="monotone" dataKey="actual"
                stroke="#FFFFFF" fill="url(#deviationFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#64748B', fontSize: 13, marginBottom: 10,
          border: '1px dashed rgba(148,163,184,0.15)', borderRadius: 8,
        }}>
          等待数据采集中...
        </div>
      )}

      {/* Legend + Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 2, background: '#00D0E9', borderRadius: 1, opacity: 0.8 }} />
            <span style={{ fontSize: 10, color: '#94A3B8' }}>预期</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 2, background: '#FFFFFF', borderRadius: 1 }} />
            <span style={{ fontSize: 10, color: '#94A3B8' }}>实际</span>
          </div>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>
            AI 置信度：<span style={{ color: '#00D0E9' }}>{latestVersion ? `${85 - (expectationVersions.length - 1) * 3}%` : '85%'}</span>
          </span>
        </div>
        <button
          onClick={() => setShowVersions(!showVersions)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: '#94A3B8',
          }}
        >
          v{latestVersion?.version ?? 1} 预期
          {showVersions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Version history */}
      {showVersions && expectationVersions.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: '#94A3B8' }}>
          {expectationVersions.map((v) => (
            <div key={v.version} style={{ padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
              <span style={{ color: '#00D0E9' }}>v{v.version}</span>
              {' '}{v.reason}
              {' · '}检查点：{v.checkpoints.map((cp) => `${cp.minutesAfter}min→${cp.expected}`).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
