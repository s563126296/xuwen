import { AlertTriangle, Clock } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAIAnalysisStore } from '../../../stores';

export default function AlertRadarPanel() {
  const riskScore = useAIAnalysisStore((s) => s.riskScore);
  const activeAlerts = useAIAnalysisStore((s) => s.activeAlerts);
  const alertHistory = useAIAnalysisStore((s) => s.alertHistory);
  const selectAlert = useAIAnalysisStore((s) => s.selectAlert);

  const levelConfig = {
    critical: { label: '严重', color: '#F87171' },
    high: { label: '高', color: '#FB923C' },
    medium: { label: '中', color: '#FBBF24' },
    low: { label: '低', color: '#94A3B8' },
  };

  const chartData = alertHistory.slice(0, 12).map((item) => ({
    time: item.time,
    count: item.count,
  }));

  return (
    <div className="ai-panel ai-panel--half" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <AlertTriangle size={15} />
        <h3>实时智能预警</h3>
        <span className="ai-panel__badge">象限B</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 风险仪表盘 */}
        <div className="risk-dashboard">
          <div className="risk-score">
            <div className="risk-score__value" style={{ color: riskScore > 70 ? '#F87171' : '#FBBF24' }}>
              {riskScore}
            </div>
            <span>综合风险指数</span>
          </div>

          <div className="active-alerts">
            {activeAlerts.map((alert) => {
              const config = levelConfig[alert.level];
              return (
                <div
                  key={alert.id}
                  className="alert-item"
                  onClick={() => selectAlert(alert.id)}
                >
                  <div className="alert-item__header">
                    <span className="alert-level" style={{ background: config.color }}>
                      {config.label}
                    </span>
                    <span className="alert-location">{alert.location}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-confidence">置信度 {alert.confidence}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 预警时间轴 */}
        <div className="alert-timeline">
          <div className="alert-timeline__title">
            <Clock size={13} />
            <span>12小时预警趋势</span>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(180,200,220,0.06)" strokeDasharray="3 5" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 9 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6, 13, 26, 0.96)',
                  border: '1px solid rgba(77, 166, 255, 0.28)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="count" fill="#4DA6FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
