import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Legend } from 'recharts';
import { Activity, Clock, Route, TrendingUp } from 'lucide-react';
import Modal from './Modal';
import { useUIStore, useOverviewStore } from '../stores';

export default function CongestionPredictionModal() {
  const selectedRoad = useUIStore((s) => s.selectedRoad);
  const roadCongestions = useOverviewStore((s) => s.roadCongestions);
  const predictions = useOverviewStore((s) => s.predictions);

  const currentCongestion = roadCongestions.find(r => r.road === selectedRoad) || roadCongestions[0];

  const getCongestionColor = (index: number) => {
    if (index <= 2) return '#2ED573';
    if (index <= 4) return '#F5A623';
    if (index <= 6) return '#FF6B35';
    return '#FF4757';
  };

  const getLevelLabel = (index: number) => {
    if (index <= 2) return '畅通';
    if (index <= 4) return '轻度拥堵';
    if (index <= 6) return '中度拥堵';
    if (index <= 8) return '重度拥堵';
    return '严重拥堵';
  };

  // Prepare chart data - combine actual and predicted
  const chartData = predictions.map((p) => ({
    time: p.time,
    index: p.index,
    isPredicted: p.isPredicted
  }));

  return (
    <Modal id="congestionPrediction" title="拥堵预测详情" width={720}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Road info */}
        <div style={{
          padding: 16,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          border: '1px solid rgba(0, 208, 233, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Activity size={18} color="#00D0E9" />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
                  {currentCongestion.road}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#A0A8B4', marginLeft: 26 }}>
                {currentCongestion.direction === 'inbound' ? '进港方向' : '出港方向'}
              </div>
            </div>
            <div style={{
              padding: '6px 12px',
              background: `${getCongestionColor(currentCongestion.index)}20`,
              border: `1px solid ${getCongestionColor(currentCongestion.index)}40`,
              borderRadius: 6
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: getCongestionColor(currentCongestion.index) }}>
                {getLevelLabel(currentCongestion.index)}
              </span>
            </div>
          </div>
        </div>

        {/* Current metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{
            padding: 14,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <TrendingUp size={14} color="#A0A8B4" />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>当前指数</span>
            </div>
            <div style={{
              fontFamily: 'DIN, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              color: getCongestionColor(currentCongestion.index)
            }}>
              {currentCongestion.index.toFixed(1)}
            </div>
          </div>

          <div style={{
            padding: 14,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <Clock size={14} color="#A0A8B4" />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>拥堵时间</span>
            </div>
            <div style={{
              fontFamily: 'DIN, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              color: currentCongestion.time > 0 ? '#F5A623' : '#2ED573'
            }}>
              {currentCongestion.time > 0 ? `${currentCongestion.time}分钟` : '无'}
            </div>
          </div>

          <div style={{
            padding: 14,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <Route size={14} color="#A0A8B4" />
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>拥堵距离</span>
            </div>
            <div style={{
              fontFamily: 'DIN, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              color: currentCongestion.distance > 0 ? '#F5A623' : '#2ED573'
            }}>
              {currentCongestion.distance > 0
                ? currentCongestion.distance >= 1000
                  ? `${(currentCongestion.distance / 1000).toFixed(1)}km`
                  : `${currentCongestion.distance}m`
                : '无'}
            </div>
          </div>
        </div>

        {/* Prediction chart */}
        <div style={{
          padding: 16,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', marginBottom: 16 }}>
            未来30分钟拥堵指数预测
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#A0A8B4', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 8]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#A0A8B4', fontSize: 11 }}
                  ticks={[0, 2, 4, 6, 8]}
                />
                <ReferenceLine y={2} stroke="#2ED573" strokeDasharray="3 3" strokeOpacity={0.4} />
                <ReferenceLine y={4} stroke="#F5A623" strokeDasharray="3 3" strokeOpacity={0.4} />
                <ReferenceLine y={6} stroke="#FF6B35" strokeDasharray="3 3" strokeOpacity={0.4} />
                <Line
                  type="monotone"
                  dataKey="index"
                  stroke="#00D0E9"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={props.key}
                        cx={cx}
                        cy={cy}
                        r={payload.isPredicted ? 3 : 5}
                        fill={payload.isPredicted ? 'rgba(0, 208, 233, 0.5)' : '#00D0E9'}
                        stroke={payload.isPredicted ? '#00D0E9' : '#fff'}
                        strokeWidth={2}
                      />
                    );
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(18, 26, 38, 0.95)',
                    border: '1px solid rgba(0, 208, 233, 0.3)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                  formatter={(value: number) => [value.toFixed(1), '拥堵指数']}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: '#A0A8B4', fontSize: 11 }}>
                      {value === 'actual' ? '实测值' : '预测值'}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#A0A8B4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#2ED573', borderRadius: 2 }} />
            <span>畅通 (0-2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#F5A623', borderRadius: 2 }} />
            <span>轻度拥堵 (2-4)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#FF6B35', borderRadius: 2 }} />
            <span>中度拥堵 (4-6)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#FF4757', borderRadius: 2 }} />
            <span>严重拥堵 (&gt;6)</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
