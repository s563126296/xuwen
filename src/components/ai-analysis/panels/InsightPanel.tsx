import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAIAnalysisStore } from '../../../stores';

export default function InsightPanel() {
  const predictionCurve = useAIAnalysisStore((s) => s.predictionCurve);
  const heatmapData = useAIAnalysisStore((s) => s.heatmapData);
  const selectTimeCell = useAIAnalysisStore((s) => s.selectTimeCell);
  const selectedTimeCell = useAIAnalysisStore((s) => s.selectedTimeCell);

  const chartData = predictionCurve.slice(0, 24).map((point) => ({
    time: point.time,
    current: point.current || null,
    predicted: point.predicted,
  }));

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <TrendingUp size={15} />
        <h3>深度洞察与预测</h3>
        <span className="ai-panel__badge">象限A</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 预测曲线 */}
        <div className="insight-chart">
          <div className="insight-chart__title">
            <span>24小时拥堵指数预测</span>
            <em>置信度 85%</em>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4DA6FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4DA6FF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(180,200,220,0.06)" strokeDasharray="3 5" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 10 }}
                interval={3}
              />
              <YAxis
                domain={[0, 3]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6, 13, 26, 0.96)',
                  border: '1px solid rgba(77, 166, 255, 0.28)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#34D399"
                strokeWidth={2}
                fill="none"
                name="实际值"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#4DA6FF"
                strokeWidth={2}
                fill="url(#predictionGradient)"
                name="预测值"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 热力矩阵（简化版，只显示一周） */}
        <div className="insight-heatmap">
          <div className="insight-heatmap__title">
            <span>一周拥堵热力矩阵</span>
          </div>
          <div className="heatmap-grid">
            {heatmapData.map((dayData, dayIndex) => (
              <div key={dayIndex} className="heatmap-row">
                {dayData.filter((_, hour) => hour % 3 === 0).map((cell) => (
                  <div
                    key={`${cell.day}-${cell.hour}`}
                    className={`heatmap-cell ${
                      selectedTimeCell?.day === cell.day && selectedTimeCell?.hour === cell.hour
                        ? 'selected'
                        : ''
                    }`}
                    style={{
                      background: `rgba(${cell.value > 2 ? '248,113,113' : cell.value > 1.5 ? '251,146,60' : '52,211,153'}, ${Math.min(0.8, cell.value / 3)})`,
                    }}
                    onClick={() => selectTimeCell({ day: cell.day, hour: cell.hour })}
                    title={`${cell.label}: ${cell.value.toFixed(2)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
