import { useMemo } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Generate 2h pressure prediction data
function generatePressureData() {
  const now = new Date();
  const points = [];
  for (let i = 0; i < 12; i++) {
    const t = new Date(now.getTime() + i * 10 * 60 * 1000);
    const timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    const minutesIn = i * 10;
    let index: number;
    if (minutesIn <= 60) {
      const progress = minutesIn / 60;
      index = 2.3 + 3.5 * Math.pow(progress, 1.4);
    } else {
      const progress = (minutesIn - 60) / 60;
      index = 5.8 - 2.3 * Math.pow(progress, 0.8);
    }
    index += Math.sin(i * 1.7) * 0.15;
    points.push({ time: timeStr, value: Math.round(index * 100) / 100 });
  }
  return points;
}

// Generate 24h traffic flow data
function generateFlowData() {
  const points = [];
  for (let h = 0; h < 24; h++) {
    const timeStr = `${String(h).padStart(2, '0')}:00`;
    let flow: number;
    if (h >= 6 && h <= 9) flow = 800 + Math.random() * 400;
    else if (h >= 17 && h <= 20) flow = 700 + Math.random() * 500;
    else if (h >= 0 && h <= 5) flow = 100 + Math.random() * 150;
    else flow = 300 + Math.random() * 300;
    points.push({ time: timeStr, flow: Math.round(flow) });
  }
  return points;
}

export default function BottomChartsBar() {
  const pressureData = useMemo(() => generatePressureData(), []);
  const flowData = useMemo(() => generateFlowData(), []);

  const maxPressure = Math.max(...pressureData.map(d => d.value));
  const avgPressure = (pressureData.reduce((s, d) => s + d.value, 0) / pressureData.length).toFixed(1);
  const peakFlow = Math.max(...flowData.map(d => d.flow));
  const totalFlow = flowData.reduce((s, d) => s + d.flow, 0);

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      height: 90,
    }}>
      {/* Pressure Prediction */}
      <div className="module-card" style={{
        flex: 1,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={12} color="var(--color-primary, #4da6ff)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>未来2h压力预测</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-tertiary)' }}>
            <span>峰值 <span style={{ fontFamily: 'var(--font-data)', color: '#f87171', fontWeight: 600 }}>{maxPressure}</span></span>
            <span>均值 <span style={{ fontFamily: 'var(--font-data)', color: '#fbbf24', fontWeight: 600 }}>{avgPressure}</span></span>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pressureData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4da6ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4da6ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                interval={2}
              />
              <YAxis
                domain={[0, 8]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                ticks={[0, 4, 8]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4da6ff"
                strokeWidth={1.5}
                fill="url(#pressureGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Flow */}
      <div className="module-card" style={{
        flex: 1,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={12} color="var(--color-accent, #f0b429)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>24h车流趋势</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-tertiary)' }}>
            <span>峰值 <span style={{ fontFamily: 'var(--font-data)', color: '#f0b429', fontWeight: 600 }}>{peakFlow}</span></span>
            <span>总量 <span style={{ fontFamily: 'var(--font-data)', color: '#34d399', fontWeight: 600 }}>{(totalFlow / 1000).toFixed(1)}k</span></span>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                interval={3}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                ticks={[0, 500, 1000]}
              />
              <Bar dataKey="flow" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {flowData.map((entry, index) => {
                  const hour = parseInt(entry.time.split(':')[0]);
                  let color = '#4b5563';
                  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
                    color = '#f0b429';
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
