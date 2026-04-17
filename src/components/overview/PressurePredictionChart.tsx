import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Tooltip,
} from 'recharts';

interface PredictionPoint {
  time: string;
  index: number;
  isPredicted: boolean;
  actual?: number;
  predicted?: number;
}

function generateMockData(): PredictionPoint[] {
  const now = new Date();
  const points: PredictionPoint[] = [];

  for (let i = 0; i < 24; i++) {
    const t = new Date(now.getTime() + i * 5 * 60 * 1000);
    const timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

    // Pattern: starts ~2.3, rises to ~5.8 around 60min mark, drops to ~3.5
    const minutesIn = i * 5;
    let index: number;
    if (minutesIn <= 60) {
      // Rising phase: 2.3 -> 5.8
      const progress = minutesIn / 60;
      index = 2.3 + 3.5 * Math.pow(progress, 1.4);
    } else {
      // Falling phase: 5.8 -> 3.5
      const progress = (minutesIn - 60) / 60;
      index = 5.8 - 2.3 * Math.pow(progress, 0.8);
    }
    // Add slight noise
    index += (Math.sin(i * 1.7) * 0.15);

    points.push({
      time: timeStr,
      index: Math.round(index * 100) / 100,
      isPredicted: i > 0,
      // Split into two series: actual (first point + overlap) and predicted (from overlap onward)
      actual: i <= 1 ? Math.round(index * 100) / 100 : undefined,
      predicted: i >= 1 ? Math.round(index * 100) / 100 : undefined,
    });
  }

  return points;
}

function CustomDot(props: { cx?: number; cy?: number; payload?: PredictionPoint }) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  if (!payload.isPredicted) {
    return (
      <circle cx={cx} cy={cy} r={4} fill="#00D0E9" stroke="#0A0F19" strokeWidth={2} />
    );
  }
  return null;
}

function ShipArrivalLabel(props: { viewBox?: { x?: number; y?: number } }) {
  const { viewBox } = props;
  if (!viewBox?.x) return null;
  return (
    <g>
      <text
        x={viewBox.x}
        y={12}
        textAnchor="middle"
        fill="#F5A623"
        fontSize={9}
        fontFamily="sans-serif"
      >
        船班到港
      </text>
    </g>
  );
}

// Custom Tooltip for pressure chart
function PressureTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PredictionPoint;
  const value = point.index;
  const levelText = value <= 2 ? '畅通' : value <= 4 ? '轻度拥堵' : value <= 6 ? '中度拥堵' : '严重拥堵';
  const levelColor = value <= 2 ? '#2ED573' : value <= 4 ? '#F5A623' : value <= 6 ? '#FF6B35' : '#FF4757';
  return (
    <div style={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(0,208,233,0.3)', borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
      <div style={{ color: '#A0A8B4', marginBottom: 2 }}>{label} {point.isPredicted ? '(预测)' : '(实时)'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#00D0E9', fontWeight: 600 }}>{value.toFixed(1)}</span>
        <span style={{ color: levelColor, fontSize: 10 }}>{levelText}</span>
      </div>
    </div>
  );
}

// Reference line threshold label
function ThresholdLabel({ viewBox, text, color }: { viewBox?: any; text: string; color: string }) {
  if (!viewBox) return null;
  return (
    <text x={viewBox.width + viewBox.x - 2} y={viewBox.y - 3} textAnchor="end" fill={color} fontSize={8} fontFamily="sans-serif" opacity={0.7}>
      {text}
    </text>
  );
}

interface PressurePredictionChartProps {
  compact?: boolean;
}

export default function PressurePredictionChart({ compact }: PressurePredictionChartProps) {
  const data = useMemo(() => generateMockData(), []);

  // Find the ~60min mark index for the ship arrival annotation
  const shipArrivalIndex = 12; // 12 * 5min = 60min

  const summaryTime = data.length > 0
    ? `${data[0].time}-${data[6]?.time ?? ''}`
    : '';

  return (
    <div className="module-card animate-in" style={{ animationDelay: '0.1s' }}>
      <div className="module-header">
        <span className="module-title">未来2h压力预测</span>
        <div className="module-icon">
          <TrendingUp size={compact ? 14 : 16} />
        </div>
      </div>

      <div style={{ height: compact ? 90 : 130, padding: '4px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D0E9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D0E9" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A0A8B4', fontSize: 11 }}
              interval={5}
            />
            <YAxis
              domain={[0, 8]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A0A8B4', fontSize: 11 }}
              ticks={[0, 2, 4, 6, 8]}
            />
            <Tooltip content={<PressureTooltip />} />
            <ReferenceLine y={2} stroke="rgba(46, 213, 115, 0.3)" strokeDasharray="4 4" label={<ThresholdLabel text="畅通" color="#2ED573" />} />
            <ReferenceLine y={4} stroke="rgba(245, 166, 35, 0.3)" strokeDasharray="4 4" label={<ThresholdLabel text="轻度拥堵" color="#F5A623" />} />
            <ReferenceLine y={6} stroke="rgba(220, 38, 38, 0.3)" strokeDasharray="4 4" label={<ThresholdLabel text="中度拥堵" color="#FF6B35" />} />
            <ReferenceLine
              x={data[shipArrivalIndex]?.time}
              stroke="#F5A623"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={<ShipArrivalLabel />}
            />
            {/* Actual data - solid line */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#00D0E9"
              strokeWidth={2}
              fill="url(#pressureGradient)"
              dot={<CustomDot />}
              activeDot={{ r: 3, fill: '#00D0E9', stroke: '#0A0F19', strokeWidth: 1 }}
              connectNulls={false}
            />
            {/* Predicted data - dashed line */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#00D0E9"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#pressureGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#00D0E9', stroke: '#0A0F19', strokeWidth: 1 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!compact && (
        <div style={{
          padding: '6px 12px',
          fontSize: 11,
          color: '#A0A8B4',
          lineHeight: 1.5,
          borderTop: '1px solid rgba(0, 208, 233, 0.08)',
        }}>
          <span style={{ color: '#F5A623' }}>{summaryTime}</span>
          {' '}预计中度拥堵（大船靠港叠加下班高峰），建议
          <span style={{ color: '#00D0E9' }}>14:45前启动S376分流</span>
        </div>
      )}
    </div>
  );
}
