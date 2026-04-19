import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Target, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const TOOLTIP_STYLE = {
  background: 'linear-gradient(135deg, rgba(13,27,42,0.98) 0%, rgba(20,35,55,0.98) 100%)',
  border: '1px solid rgba(139,92,246,0.4)',
  borderRadius: 8,
  fontSize: 11,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

export default function StrategyAnalysisView() {
  const { analysisState } = useDashboardStore();
  const { strategyRecords } = analysisState;

  // Group by strategyId
  const grouped: Record<string, { strategyId: string; strategyName: string; count: number; totalRelief: number; adopted: number; totalPreIndex: number; totalPostIndex: number }> = {};
  strategyRecords.forEach(r => {
    if (!grouped[r.strategyId]) {
      grouped[r.strategyId] = { strategyId: r.strategyId, strategyName: r.strategyName, count: 0, totalRelief: 0, adopted: 0, totalPreIndex: 0, totalPostIndex: 0 };
    }
    grouped[r.strategyId].count += 1;
    grouped[r.strategyId].totalRelief += r.reliefMinutes;
    grouped[r.strategyId].totalPreIndex += r.preIndex;
    grouped[r.strategyId].totalPostIndex += r.postIndex;
    if (r.adopted) grouped[r.strategyId].adopted += 1;
  });
  const stats = Object.values(grouped)
    .map(s => ({
      ...s,
      avgRelief: Math.round(s.totalRelief / s.count),
      adoptionRate: Math.round((s.adopted / s.count) * 100),
      avgPreIndex: +(s.totalPreIndex / s.count).toFixed(1),
      avgPostIndex: +(s.totalPostIndex / s.count).toFixed(1),
      avgReduction: +((s.totalPreIndex - s.totalPostIndex) / s.count).toFixed(1),
    }))
    .sort((a, b) => b.avgRelief - a.avgRelief);

  const top5 = stats.slice(0, 5);
  const totalExecutions = strategyRecords.length;
  const totalAdopted = strategyRecords.filter(r => r.adopted).length;
  const overallAdoptionRate = Math.round((totalAdopted / totalExecutions) * 100);
  const avgReliefAll = Math.round(strategyRecords.reduce((s, r) => s + r.reliefMinutes, 0) / totalExecutions);

  // Scatter data: adoption rate vs relief time
  const scatterData = stats.map(s => ({
    name: s.strategyId,
    x: s.adoptionRate,
    y: s.avgRelief,
    z: s.count,
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={14} color="#8B5CF6" /> 策略效果分析
        </h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>评估各策略的执行效果、采纳率、缓解能力，识别最优策略组合</p>
      </div>

      {/* Overall metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: '策略执行总次数', value: totalExecutions, unit: '次', icon: Target, color: '#8B5CF6' },
          { label: '整体采纳率', value: overallAdoptionRate, unit: '%', icon: Award, color: '#2ED573' },
          { label: '平均缓解时间', value: avgReliefAll, unit: '分钟', icon: TrendingUp, color: '#00D0E9' },
          { label: '策略覆盖率', value: stats.length, unit: '/15', icon: AlertCircle, color: '#F5A623' },
        ].map((m, i) => (
          <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <m.icon size={12} color={m.color} />
              <span style={{ fontSize: 10, color: '#A0A8B4' }}>{m.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</span>
              <span style={{ fontSize: 10, color: '#64748B' }}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Top 5 + Scatter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>TOP 5 最有效策略（按缓解时间）</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top5} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#64748B" style={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="strategyName" stroke="#64748B" style={{ fontSize: 10 }} width={110} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
              <Bar dataKey="avgRelief" fill="#8B5CF6" name="平均缓解时间(分钟)" radius={[0, 4, 4, 0]}>
                {top5.map((_, i) => <Cell key={i} fill={i === 0 ? '#8B5CF6' : i === 1 ? '#A78BFA' : '#C4B5FD'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>策略效果矩阵（采纳率 vs 缓解时间）</div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="采纳率" unit="%" stroke="#64748B" style={{ fontSize: 10 }} domain={[0, 100]} />
              <YAxis type="number" dataKey="y" name="缓解时间" unit="分钟" stroke="#64748B" style={{ fontSize: 10 }} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} formatter={(value: any, name: string) => [value, name === 'x' ? '采纳率' : name === 'y' ? '缓解时间' : '执行次数']} />
              <Scatter name="策略" data={scatterData} fill="#00D0E9">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.y > 60 ? '#8B5CF6' : entry.y > 40 ? '#00D0E9' : '#64748B'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, textAlign: 'center' }}>气泡大小=执行次数 | 紫色=高效 | 青色=中效 | 灰色=低效</div>
        </div>
      </div>

      {/* Detailed table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>全部策略执行统计</div>
        <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px 70px 70px 80px 80px', gap: 8, padding: '8px 12px', background: 'rgba(139,92,246,0.1)', fontSize: 11, fontWeight: 600, color: '#8B5CF6' }}>
            <span>编号</span>
            <span>策略名称</span>
            <span style={{ textAlign: 'right' }}>执行</span>
            <span style={{ textAlign: 'right' }}>采纳率</span>
            <span style={{ textAlign: 'right' }}>缓解</span>
            <span style={{ textAlign: 'right' }}>前指数</span>
            <span style={{ textAlign: 'right' }}>降幅</span>
          </div>
          {stats.map(s => (
            <div key={s.strategyId} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px 70px 70px 80px 80px', gap: 8, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 11, color: '#A0A8B4' }}>
              <span style={{ color: '#8B5CF6', fontFamily: 'monospace' }}>{s.strategyId}</span>
              <span style={{ color: '#E2E8F0' }}>{s.strategyName}</span>
              <span style={{ textAlign: 'right' }}>{s.count}次</span>
              <span style={{ textAlign: 'right', color: s.adoptionRate >= 80 ? '#2ED573' : s.adoptionRate >= 50 ? '#F5A623' : '#FF4757' }}>{s.adoptionRate}%</span>
              <span style={{ textAlign: 'right', color: '#00D0E9' }}>{s.avgRelief}分</span>
              <span style={{ textAlign: 'right', color: '#F5A623' }}>{s.avgPreIndex}</span>
              <span style={{ textAlign: 'right', color: '#2ED573' }}>-{s.avgReduction}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ marginTop: 16, padding: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,208,233,0.05) 100%)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Award size={14} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>策略优化建议</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#C9CDD4', lineHeight: 1.8 }}>
          <li>TOP 3 策略（{top5.slice(0, 3).map(s => s.strategyId).join('、')}）平均缓解时间超过 {Math.round(top5.slice(0, 3).reduce((s, t) => s + t.avgRelief, 0) / 3)} 分钟，建议优先推荐</li>
          <li>整体采纳率 {overallAdoptionRate}%，{overallAdoptionRate >= 85 ? 'AI 建议质量优秀' : overallAdoptionRate >= 70 ? '建议优化低采纳率策略的推荐时机' : '需重新评估策略推荐算法'}</li>
          <li>策略覆盖率 {stats.length}/15，{stats.length < 12 ? `有 ${15 - stats.length} 个策略未被执行，建议检查触发条件` : '覆盖率良好'}</li>
          <li>建议：将 {top5[0].strategyId}（{top5[0].strategyName}）设为默认首选策略，缓解时间最优（{top5[0].avgRelief}分钟）且采纳率高（{top5[0].adoptionRate}%）</li>
        </ul>
      </div>
    </div>
  );
}
