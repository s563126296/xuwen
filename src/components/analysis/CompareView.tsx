import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { useState } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TOOLTIP_STYLE = {
  background: 'linear-gradient(135deg, rgba(13,27,42,0.98) 0%, rgba(20,35,55,0.98) 100%)',
  border: '1px solid rgba(139,92,246,0.4)',
  borderRadius: 8,
  fontSize: 11,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

const DIMENSIONS = [
  { id: 'scene', label: '场景维度', desc: '工作日 vs 周末 vs 春运 vs 台风' },
  { id: 'yoy', label: '年度同比', desc: '2025年 vs 2026年同期对比' },
  { id: 'holiday', label: '节假日对比', desc: '春节/清明/五一/国庆' },
  { id: 'monthly', label: '月度趋势', desc: '近6个月运行数据' },
];

export default function CompareView() {
  const [dimension, setDimension] = useState('scene');

  const sceneData = [
    { name: '工作日', flow: 6200, congestion: 3.2, stranded: 450, digestion: 88 },
    { name: '周末', flow: 8500, congestion: 4.5, stranded: 680, digestion: 82 },
    { name: '春运', flow: 15200, congestion: 6.8, stranded: 1850, digestion: 68 },
    { name: '台风停航', flow: 2100, congestion: 7.5, stranded: 2800, digestion: 0 },
  ];

  const yoyData = [
    { month: '10月', '2025年': 5200, '2026年': 5800 },
    { month: '11月', '2025年': 5400, '2026年': 6100 },
    { month: '12月', '2025年': 6800, '2026年': 7200 },
    { month: '1月', '2025年': 9200, '2026年': 10500 },
    { month: '2月', '2025年': 14200, '2026年': 15800 },
    { month: '3月', '2025年': 7100, '2026年': 7500 },
    { month: '4月', '2025年': 6500, '2026年': 7200 },
  ];

  const holidayData = [
    { name: '春节', flow: 18500, duration: 15, strategies: 12 },
    { name: '清明', flow: 9200, duration: 3, strategies: 5 },
    { name: '五一', flow: 11200, duration: 5, strategies: 7 },
    { name: '端午', flow: 8600, duration: 3, strategies: 4 },
    { name: '国庆', flow: 12800, duration: 7, strategies: 8 },
  ];

  const monthlyData = [
    { month: '10月', 车流量: 156000, 事件数: 8, 策略执行: 22 },
    { month: '11月', 车流量: 162000, 事件数: 6, 策略执行: 18 },
    { month: '12月', 车流量: 216000, 事件数: 12, 策略执行: 35 },
    { month: '1月', 车流量: 315000, 事件数: 18, 策略执行: 52 },
    { month: '2月', 车流量: 442000, 事件数: 22, 策略执行: 68 },
    { month: '3月', 车流量: 225000, 事件数: 11, 策略执行: 28 },
    { month: '4月', 车流量: 198000, 事件数: 9, 策略执行: 24 },
  ];

  const radarData = [
    { metric: '车流量', 春运: 95, 台风: 25, 工作日: 40, 周末: 55 },
    { metric: '拥堵指数', 春运: 85, 台风: 92, 工作日: 35, 周末: 50 },
    { metric: '滞留车辆', 春运: 70, 台风: 100, 工作日: 15, 周末: 25 },
    { metric: '港口消化', 春运: 65, 台风: 5, 工作日: 90, 周末: 82 },
    { metric: '策略执行', 春运: 90, 台风: 95, 工作日: 15, 周末: 30 },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitCompare size={14} color="#8B5CF6" /> 场景对比分析
          </h3>
          <p style={{ fontSize: 11, color: '#64748B' }}>多维度对比不同运行场景的关键指标，识别运行规律</p>
        </div>
      </div>

      {/* Dimension tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {DIMENSIONS.map(d => (
          <button key={d.id} onClick={() => setDimension(d.id)} style={{
            padding: '8px 12px',
            background: dimension === d.id ? 'rgba(139,92,246,0.15)' : 'rgba(0,0,0,0.2)',
            border: `1px solid ${dimension === d.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            flex: 1,
            minWidth: 180,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: dimension === d.id ? '#8B5CF6' : '#E2E8F0', marginBottom: 2 }}>{d.label}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{d.desc}</div>
          </button>
        ))}
      </div>

      {/* Dimension: Scene */}
      {dimension === 'scene' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>关键指标对比</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sceneData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: 10 }} />
                  <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="flow" fill="#00D0E9" name="车流量" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stranded" fill="#FF4757" name="滞留车辆" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>综合能力雷达</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#A0A8B4', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 9 }} />
                  <Radar name="春运" dataKey="春运" stroke="#F5A623" fill="#F5A623" fillOpacity={0.3} />
                  <Radar name="台风" dataKey="台风" stroke="#FF4757" fill="#FF4757" fillOpacity={0.3} />
                  <Radar name="工作日" dataKey="工作日" stroke="#00D0E9" fill="#00D0E9" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed metrics table */}
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 0, padding: '10px 16px', background: 'rgba(139,92,246,0.1)', fontSize: 11, fontWeight: 600, color: '#8B5CF6' }}>
              <span>场景</span>
              <span style={{ textAlign: 'right' }}>日均车流</span>
              <span style={{ textAlign: 'right' }}>拥堵指数</span>
              <span style={{ textAlign: 'right' }}>滞留车辆</span>
              <span style={{ textAlign: 'right' }}>港口消化率</span>
            </div>
            {sceneData.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 11, color: '#A0A8B4' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{s.name}</span>
                <span style={{ textAlign: 'right', color: '#00D0E9' }}>{s.flow.toLocaleString()}</span>
                <span style={{ textAlign: 'right', color: s.congestion > 5 ? '#FF4757' : '#F5A623' }}>{s.congestion}</span>
                <span style={{ textAlign: 'right', color: '#FF4757' }}>{s.stranded}</span>
                <span style={{ textAlign: 'right', color: s.digestion > 70 ? '#2ED573' : s.digestion > 30 ? '#F5A623' : '#FF4757' }}>{s.digestion}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dimension: YoY */}
      {dimension === 'yoy' && (
        <>
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>近一年车流量同比</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yoyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ stroke: 'rgba(139,92,246,0.4)', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="2025年" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="2026年" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: '年度车流总量', cur: '1.89M', prev: '1.65M', change: '+14.5%', up: true },
              { label: '平均拥堵指数', cur: '3.8', prev: '3.5', change: '+8.6%', up: true },
              { label: '峰值事件数', cur: '86', prev: '72', change: '+19.4%', up: true },
              { label: '策略采纳率', cur: '87%', prev: '78%', change: '+9.0pp', up: true },
            ].map((m, i) => (
              <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: '#A0A8B4', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6', marginBottom: 2 }}>{m.cur}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <span style={{ color: '#64748B' }}>vs {m.prev}</span>
                  <span style={{ color: m.up ? '#FF4757' : '#2ED573', display: 'flex', alignItems: 'center', gap: 2 }}>
                    {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dimension: Holiday */}
      {dimension === 'holiday' && (
        <>
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>节假日车流量与策略执行对比</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={holidayData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#00D0E9" style={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#F5A623" style={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="flow" fill="#00D0E9" name="峰值日车流" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="strategies" fill="#F5A623" name="策略执行次数" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', background: 'rgba(139,92,246,0.1)', fontSize: 11, fontWeight: 600, color: '#8B5CF6' }}>
              <span>节假日</span><span style={{ textAlign: 'right' }}>持续天数</span><span style={{ textAlign: 'right' }}>峰值车流</span><span style={{ textAlign: 'right' }}>策略执行</span><span style={{ textAlign: 'right' }}>平均/日</span>
            </div>
            {holidayData.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 11, color: '#A0A8B4' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{h.name}</span>
                <span style={{ textAlign: 'right' }}>{h.duration}天</span>
                <span style={{ textAlign: 'right', color: '#00D0E9' }}>{h.flow.toLocaleString()}</span>
                <span style={{ textAlign: 'right', color: '#F5A623' }}>{h.strategies}次</span>
                <span style={{ textAlign: 'right', color: '#8B5CF6' }}>{Math.round(h.strategies / h.duration * 10) / 10}次/日</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dimension: Monthly */}
      {dimension === 'monthly' && (
        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>近6个月月度趋势</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#00D0E9" style={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#F5A623" style={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="车流量" fill="#00D0E9" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="事件数" fill="#FF4757" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="策略执行" fill="#F5A623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI insights */}
      <div style={{ marginTop: 16, padding: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,208,233,0.05) 100%)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Minus size={14} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>AI 分析洞察</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#C9CDD4', lineHeight: 1.8 }}>
          {dimension === 'scene' && (
            <>
              <li>春运期间车流量为工作日的 <span style={{ color: '#F5A623', fontWeight: 600 }}>2.5 倍</span>，拥堵指数提升 112%，需提前 3 天启动春运预案</li>
              <li>台风停航场景下虽然车流量最低，但滞留车辆数最高（<span style={{ color: '#FF4757', fontWeight: 600 }}>2800辆</span>），港口消化率归零是关键压力源</li>
              <li>周末车流量比工作日高 37%，但拥堵指数仅提升 41%，说明周末港口消化能力更强（82% vs 88%）</li>
              <li>建议：针对春运高峰提前执行 S-04 潮汐车道，针对台风建立 500 辆级的预备停车区</li>
            </>
          )}
          {dimension === 'yoy' && (
            <>
              <li>2026 年车流量同比增长 <span style={{ color: '#F5A623', fontWeight: 600 }}>14.5%</span>，2 月春运峰值增长最显著（+11.3%）</li>
              <li>峰值事件数增长 19.4%，高于车流量增幅，表明运行压力加大</li>
              <li>策略采纳率提升 9 个百分点（78% → 87%），说明 AI 建议质量显著提升</li>
              <li>建议：2026 年需加强预防性策略，降低事件发生率而非仅靠事后处置</li>
            </>
          )}
          {dimension === 'holiday' && (
            <>
              <li>春节是压力最大的节假日（15 天持续、1.85万峰值车流、12次策略执行）</li>
              <li>清明假期短但策略密度最高（1.7 次/日），说明短假期反而对快速响应要求更高</li>
              <li>国庆和五一车流量相近，但国庆策略执行次数高 14%，需分析原因</li>
              <li>建议：针对短假期建立"快速响应工具包"，降低单次决策时间</li>
            </>
          )}
          {dimension === 'monthly' && (
            <>
              <li>2 月是年度最高峰（44.2 万车流、22 起事件、68 次策略执行），受春运驱动</li>
              <li>10-11 月是最平稳时期，可作为基准月份</li>
              <li>事件数与策略执行数强相关（R²=0.94），说明策略响应机制有效</li>
              <li>建议：2-3 月峰值期需提前 2 周储备警力和物资</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
