import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { useUIStore, useOverviewStore } from '../stores';

export default function CongestionPredictionChart() {
  const predictions = useOverviewStore((s) => s.predictions);
  const selectedDirection = useUIStore((s) => s.selectedDirection);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setSelectedRoad = useUIStore((s) => s.setSelectedRoad);

  const getCongestionLevel = (index: number) => {
    if (index <= 2) return { color: '#2ED573', label: '畅通' };
    if (index <= 4) return { color: '#F5A623', label: '拥堵' };
    if (index <= 6) return { color: '#FF6B35', label: '严重拥堵' };
    return { color: '#FF4757', label: '极度拥堵' };
  };

  const currentLevel = getCongestionLevel(predictions[0]?.index || 0);

  const handleChartClick = () => {
    const road = selectedDirection === 'inbound'
      ? '进港大道（进港方向）'
      : '海安大道（出港方向）';
    setSelectedRoad(road);
    setActiveModal('congestionPrediction');
  };

  return (
    <div className="module-card animate-in" style={{ animationDelay: '0.15s' }}>
      <div className="module-header">
        <span className="module-title">拥堵预测</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: `${currentLevel.color}20`,
            border: `1px solid ${currentLevel.color}40`,
            borderRadius: 6
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: currentLevel.color
            }} />
            <span style={{ fontSize: 12, color: currentLevel.color, fontWeight: 500 }}>
              {currentLevel.label}
            </span>
          </div>
          <div className="module-icon">
            <Activity size={16} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: '#A0A8B4' }}>
        未来30分钟拥堵指数趋势
        <span style={{ color: '#00D0E9', marginLeft: 6 }}>↑ 点击查看详情</span>
      </div>

      <div style={{ height: 140, cursor: 'pointer' }} onClick={handleChartClick}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={predictions} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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

            {/* Reference lines for congestion levels */}
            <ReferenceLine y={2} stroke="#2ED573" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={4} stroke="#F5A623" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={6} stroke="#FF6B35" strokeDasharray="3 3" strokeOpacity={0.3} />

            {/* Actual value */}
            <Line
              type="monotone"
              dataKey="index"
              stroke="#00D0E9"
              strokeWidth={3}
              dot={{ fill: '#00D0E9', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#00D0E9', stroke: '#fff', strokeWidth: 2 }}
              onClick={handleChartClick}
            />

            <Tooltip
              contentStyle={{
                background: 'rgba(18, 26, 38, 0.95)',
                border: '1px solid rgba(0, 208, 233, 0.3)',
                borderRadius: 6,
                fontSize: 11
              }}
              formatter={(value: number) => [
                value.toFixed(1),
                '拥堵指数'
              ]}
              labelFormatter={(label) => `时间: ${label}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 10,
        padding: '8px 10px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 6
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 1 }}>当前</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: currentLevel.color }}>
            {predictions[0]?.index.toFixed(1)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 1 }}>30分钟后</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: getCongestionLevel(predictions[6]?.index || 0).color }}>
            {predictions[6]?.index.toFixed(1)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 1 }}>趋势</div>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: predictions[6].index > predictions[0].index ? '#FF4757' : '#2ED573'
          }}>
            {predictions[6].index > predictions[0].index ? '↑' : '↓'}
            {Math.abs(predictions[6].index - predictions[0].index).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
