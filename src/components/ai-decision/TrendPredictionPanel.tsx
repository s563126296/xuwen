import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAIDecisionStore } from '../../stores/aiDecisionStore';

export default function TrendPredictionPanel() {
  const trendPredictions = useAIDecisionStore((s) => s.trendPredictions);

  const chartData = useMemo(() => {
    return trendPredictions.map((item) => ({
      date: item.date,
      predicted: item.predicted,
      actual: item.actual,
      upper: item.upper,
      lower: item.lower,
    }));
  }, [trendPredictions]);

  const stats = useMemo(() => {
    const today = trendPredictions.find((p) => p.date === '04/20');
    const peak = trendPredictions.reduce((max, p) => (p.predicted > max.predicted ? p : max));
    const avgConfidence = Math.round(
      trendPredictions.reduce((sum, p) => sum + p.confidence, 0) / trendPredictions.length
    );
    return {
      current: today?.predicted.toFixed(2) || '1.95',
      peakDate: peak.date,
      peakValue: peak.predicted.toFixed(2),
      avgConfidence,
    };
  }, [trendPredictions]);

  return (
    <div
      className="glass-panel"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          趋势预测
        </h3>
        <p style={{
          margin: '4px 0 0',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}>
          基于历史数据的7日拥堵指数预测
        </p>
      </div>

      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: 16,
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>当前指数</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-primary)', textShadow: 'var(--glow-primary)' }}>
            {stats.current}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>峰值预测</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-accent)' }}>
            {stats.peakDate} ({stats.peakValue})
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>平均置信度</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-success)' }}>
            {stats.avgConfidence}%
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4da6ff" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#4da6ff" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,200,220,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'rgba(180,200,220,0.12)' }}
              tickLine={false}
            />
            <YAxis
              domain={[1.0, 3.0]}
              tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(12,25,48,0.9)',
                border: '1px solid rgba(77,166,255,0.2)',
                borderRadius: 6,
                fontSize: 11,
                color: '#fff',
              }}
            />
            <ReferenceLine x="04/20" stroke="rgba(240,180,41,0.5)" strokeDasharray="3 3" label={{ value: '今日', fill: 'rgba(240,180,41,0.7)', fontSize: 10 }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceBand)" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
            <Area type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} fill="url(#actualGrad)" dot={false} />
            <Area type="monotone" dataKey="predicted" stroke="#4da6ff" strokeWidth={2} strokeDasharray="5 3" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
