import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, GitBranch, Target } from 'lucide-react';
import { useEvolutionStore } from '../../stores/evolutionStore';

const TOOLTIP_STYLE = {
  background: 'linear-gradient(135deg, rgba(13,27,42,0.98) 0%, rgba(20,35,55,0.98) 100%)',
  border: '1px solid rgba(139,92,246,0.4)',
  borderRadius: 8,
  fontSize: 11,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

export default function EvolutionRecords() {
  const { records, currentVersion, currentAccuracy } = useEvolutionStore();

  // Prepare chart data
  const chartData = records.map(r => ({
    version: r.version,
    accuracy: r.accuracyAfter,
    date: r.date,
  }));

  // Sort records newest first for timeline display
  const sortedRecords = [...records].reverse();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={14} color="#8B5CF6" /> 策略进化记录
        </h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>
          追踪 AI 模型从 v1.0 到 {currentVersion} 的进化历程，准确率从 72% 提升至 {currentAccuracy}%
        </p>
      </div>

      {/* Accuracy Trend Chart */}
      <div style={{
        padding: 16,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={12} color="#2ED573" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>准确率进化趋势</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#2ED573' }}>{currentAccuracy}%</span>
            <span style={{ fontSize: 10, color: '#64748B' }}>当前准确率</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="version" stroke="#64748B" style={{ fontSize: 10 }} />
            <YAxis stroke="#64748B" style={{ fontSize: 10 }} domain={[70, 90]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} />
            <Line type="monotone" dataKey="accuracy" stroke="#2ED573" strokeWidth={2} dot={{ fill: '#2ED573', r: 4 }} name="准确率(%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Evolution Timeline */}
      <div style={{
        padding: 16,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Sparkles size={12} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>进化时间线</span>
        </div>

        {/* Timeline list */}
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          {/* Timeline vertical line */}
          <div style={{
            position: 'absolute',
            left: 8,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'linear-gradient(180deg, rgba(139,92,246,0.5) 0%, rgba(0,208,233,0.3) 100%)'
          }} />

          {sortedRecords.map((record, index) => {
            const accuracyDelta = record.accuracyAfter - record.accuracyBefore;
            const isFirst = index === 0;

            return (
              <div key={record.version} style={{ position: 'relative', marginBottom: index === sortedRecords.length - 1 ? 0 : 16 }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: -20,
                  top: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isFirst ? '#8B5CF6' : '#00D0E9',
                  border: '2px solid #0A0F19',
                  boxShadow: isFirst ? '0 0 8px rgba(139,92,246,0.6)' : '0 0 6px rgba(0,208,233,0.4)'
                }} />

                {/* Record card */}
                <div style={{
                  padding: 12,
                  background: isFirst ? 'rgba(139,92,246,0.08)' : 'rgba(0,0,0,0.15)',
                  border: `1px solid ${isFirst ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 6
                }}>
                  {/* Header: version + date + accuracy delta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isFirst ? '#8B5CF6' : '#00D0E9',
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        background: isFirst ? 'rgba(139,92,246,0.15)' : 'rgba(0,208,233,0.15)',
                        borderRadius: 4
                      }}>
                        {record.version}
                      </span>
                      <span style={{ fontSize: 10, color: '#64748B' }}>{record.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Target size={10} color="#2ED573" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#2ED573' }}>
                        +{accuracyDelta}%
                      </span>
                      <span style={{ fontSize: 10, color: '#64748B' }}>
                        ({record.accuracyBefore}% → {record.accuracyAfter}%)
                      </span>
                    </div>
                  </div>

                  {/* Trigger event */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#64748B' }}>触发事件：</span>
                    <span style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 500 }}>{record.triggerEvent}</span>
                    {record.triggerExecutionId && (
                      <span style={{ fontSize: 10, color: '#64748B', marginLeft: 6 }}>
                        (执行ID: {record.triggerExecutionId})
                      </span>
                    )}
                  </div>

                  {/* Change description */}
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#64748B' }}>改进内容：</span>
                    <span style={{ fontSize: 11, color: '#C9CDD4' }}>{record.changeDescription}</span>
                  </div>

                  {/* Affected strategies */}
                  <div>
                    <span style={{ fontSize: 10, color: '#64748B' }}>影响策略：</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {record.affectedStrategies.map(strategyId => (
                        <span
                          key={strategyId}
                          style={{
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: '#00D0E9',
                            background: 'rgba(0,208,233,0.1)',
                            padding: '2px 6px',
                            borderRadius: 3,
                            border: '1px solid rgba(0,208,233,0.2)'
                          }}
                        >
                          {strategyId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div style={{
        marginTop: 16,
        padding: 14,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,208,233,0.05) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sparkles size={14} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>进化洞察</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#C9CDD4', lineHeight: 1.8 }}>
          <li>模型经过 {records.length} 次迭代，准确率从 72% 提升至 {currentAccuracy}%，提升 {currentAccuracy - 72} 个百分点</li>
          <li>主要改进方向：天气因子、车型因子、路况因子、汇入车流因子，覆盖多维度影响变量</li>
          <li>平均每次迭代提升 {((currentAccuracy - 72) / (records.length - 1)).toFixed(1)} 个百分点，进化效率稳定</li>
          <li>建议：持续收集执行偏差数据，识别新的影响因子，保持模型进化活力</li>
        </ul>
      </div>
    </div>
  );
}

