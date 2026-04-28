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

export default function DeviationMonitorPanel() {
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const [showVersions, setShowVersions] = useState(false);

  if (!monitorState.isMonitoring && monitorState.curveData.length === 0) return null;

  const { curveData, deviationLevel, deviationPercent, expectationVersions } = monitorState;
  const borderColor = deviationLevel === 'red' ? '#FF4757' : deviationLevel === 'orange' ? '#F97316' : 'rgba(0, 208, 233, 0.2)';
  const latestVersion = expectationVersions[expectationVersions.length - 1];
  const elapsedMin = monitorState.isMonitoring
    ? Math.round((Date.now() - monitorState.monitorStartTime) / 60000)
    : '--';

  return (
    <div style={{
      background: '#0D1137',
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      padding: 16,
      width: '100%',
      animation: deviationLevel === 'red' ? 'pulse 1.5s infinite' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="#00D0E9" />
          <span style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}>执行偏差监控</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>已执行 {elapsedMin} min</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: levelColors[deviationLevel] }}>
            偏差 {deviationPercent}%
          </span>
        </div>
      </div>

      {curveData.length > 1 && (
        <div style={{ height: 140, marginBottom: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="minutesAfter" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${Math.round(v)}m`} axisLine={{ stroke: 'rgba(148,163,184,0.2)' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={{ stroke: 'rgba(148,163,184,0.2)' }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: 'rgba(13,17,55,0.95)', border: '1px solid rgba(0,208,233,0.3)', borderRadius: 6, fontSize: 11 }} formatter={(value: number, name: string) => [value.toFixed(1), name === 'expected' ? '预期' : '实际']} />
              <ReferenceLine y={0} stroke="rgba(148,163,184,0.1)" />
              <Area type="monotone" dataKey="expected" stroke="#00D0E9" strokeDasharray="5 3" fill="none" strokeWidth={1.5} />
              <Area type="monotone" dataKey="actual" stroke="#FFFFFF" fill="rgba(255,71,87,0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {curveData.length <= 1 && (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 12, marginBottom: 12 }}>
          等待数据采集中...
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.1)' }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          AI 置信度：<span style={{ color: '#00D0E9' }}>{latestVersion ? `${85 - (expectationVersions.length - 1) * 3}%` : '85%'}</span>
        </span>
        <button onClick={() => setShowVersions(!showVersions)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94A3B8' }}>
          v{latestVersion?.version ?? 1} 预期
          {showVersions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

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
