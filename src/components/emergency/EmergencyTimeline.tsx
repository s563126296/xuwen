import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyTimeline() {
  const timeline = useDashboardStore((s) => s.emergencyState.timeline);
  const peak = useDashboardStore((s) => s.emergencyState.forecast.peakStrandedVehicles);

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 12,
        height: 160,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>I. 滞留趋势时间轴</div>
      <div style={{ width: '100%', height: 110 }}>
        <ResponsiveContainer>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="emergencyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <ReferenceLine y={peak} stroke="#FF4757" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2} fill="url(#emergencyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
