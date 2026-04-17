import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface PredictionCurveChartProps {
  currentIndex: number;
  predictedIndex: number;
  height?: number;
}

const baselineData = [
  { time: '15:00', noAction: 3.2, withAction: 3.2 },
  { time: '15:30', noAction: 4.5, withAction: 4.5 },
  { time: '16:00', noAction: 5.8, withAction: 5.5 },
  { time: '16:30', noAction: 6.5, withAction: 5.8 },
  { time: '16:45', noAction: 7.2, withAction: 5.2 },
  { time: '17:00', noAction: 7.5, withAction: 4.5 },
  { time: '17:15', noAction: 7.3, withAction: 3.8 },
  { time: '17:30', noAction: 6.8, withAction: 3.2 },
  { time: '17:45', noAction: 6.2, withAction: 2.8 },
  { time: '18:00', noAction: 5.5, withAction: 2.5 },
];

// Custom tooltip matching dark theme
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'rgba(13,27,42,0.9)', border: '1px solid rgba(0,208,233,0.12)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600, fontFamily: 'Fira Code, monospace' }}>{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

// Vertical "当前" label
function CurrentTimeLabel({ viewBox }: { viewBox?: any }) {
  if (!viewBox?.x) return null;
  return (
    <text x={viewBox.x} y={10} textAnchor="middle" fill="#F5A623" fontSize={11} fontFamily="sans-serif">
      当前
    </text>
  );
}

export default function PredictionCurveChart({ height = 140 }: PredictionCurveChartProps) {
  return (
    <div style={{ width: '100%', height, marginBottom: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={baselineData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            interval={1}
          />
          <YAxis
            domain={[0, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Shaded improvement zone between the two curves */}
          <Area
            type="monotone"
            dataKey="noAction"
            stroke="none"
            fill="rgba(0,208,233,0.08)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="withAction"
            stroke="none"
            fill="#0A0F19"
            fillOpacity={1}
          />

          {/* 畅通阈值 reference line */}
          <ReferenceLine y={3} stroke="#2ED573" strokeDasharray="5 3" strokeOpacity={0.6} />

          {/* 当前时间 vertical marker at 16:30 */}
          <ReferenceLine
            x="16:30"
            stroke="#F5A623"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            label={<CurrentTimeLabel />}
          />

          {/* 不干预 baseline - solid red */}
          <Line
            type="monotone"
            dataKey="noAction"
            name="不干预"
            stroke="#FF4757"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#FF4757', stroke: '#0A0F19', strokeWidth: 1 }}
          />

          {/* 策略干预 prediction - dashed cyan */}
          <Line
            type="monotone"
            dataKey="withAction"
            name="策略干预"
            stroke="#00D0E9"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: '#00D0E9', stroke: '#0A0F19', strokeWidth: 1 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 2, background: '#FF4757' }} />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>不干预</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 2, background: '#00D0E9', borderTop: '1px dashed #00D0E9' }} />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>策略干预</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 2, background: '#2ED573', opacity: 0.6 }} />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>畅通阈值</span>
        </div>
      </div>
    </div>
  );
}
