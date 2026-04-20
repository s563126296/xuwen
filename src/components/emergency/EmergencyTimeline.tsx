import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip } from 'recharts';
import { useEmergencyStore } from '../../stores/emergencyStore';
import type { EmergencyTimelinePoint } from '../../stores/emergencyStore';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? payload[1]?.value;
  const isPredicted = payload[0]?.payload?.isPredicted;
  return (
    <div style={{ background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
      <div style={{ color: '#94A3B8', marginBottom: 2 }}>{label}{isPredicted ? ' (预测)' : ''}</div>
      <div style={{ color: '#FF6B35', fontWeight: 700 }}>{value?.toLocaleString()} 辆</div>
    </div>
  );
}

export default function EmergencyTimeline() {
  const timeline = useEmergencyStore((s) => s.emergencyState.timeline);
  const peak = useEmergencyStore((s) => s.emergencyState.forecast.peakStrandedVehicles);

  const currentPoint = timeline.find((p: EmergencyTimelinePoint) => p.isCurrent);
  const currentTime = currentPoint?.time;

  // Build two series: historical fills value, predicted fills predictedValue
  const chartData = timeline.map((p: EmergencyTimelinePoint) => ({
    time: p.time,
    isCurrent: p.isCurrent,
    isPredicted: p.isPredicted,
    historical: p.isPredicted ? undefined : p.value,
    predicted: p.isPredicted || p.isCurrent ? p.value : undefined,
  }));

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 12,
        height: 120,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>I. 滞留趋势时间轴</div>
      <div style={{ width: '100%', height: 70 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="emergencyFillHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="emergencyFillPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={peak} stroke="#FF4757" strokeDasharray="4 4" />
            {currentTime && (
              <ReferenceLine x={currentTime} stroke="#00D0E9" strokeDasharray="3 3" label={{ value: '当前', fill: '#00D0E9', fontSize: 10, position: 'top' }} />
            )}
            <Area type="monotone" dataKey="historical" stroke="#FF6B35" strokeWidth={2} fill="url(#emergencyFillHist)" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="predicted" stroke="#FF6B35" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#emergencyFillPred)" strokeOpacity={0.6} connectNulls={false} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
