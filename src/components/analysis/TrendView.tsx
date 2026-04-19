import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine, ReferenceArea } from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { generateTrendData } from '../../utils/analysisMockData';
import { filterEvents } from '../../utils/analysisMockData';

const TOOLTIP_STYLE = {
  background: 'linear-gradient(135deg, rgba(13,27,42,0.98) 0%, rgba(20,35,55,0.98) 100%)',
  border: '1px solid rgba(139,92,246,0.4)',
  borderRadius: 8,
  fontSize: 11,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

export default function TrendView() {
  const { analysisState } = useDashboardStore();
  const { dateRange } = analysisState.filters;
  const trendData = generateTrendData(dateRange.start, dateRange.end);
  const filteredEvents = filterEvents(analysisState.events, analysisState.filters) as typeof analysisState.events;

  // 计算统计数据
  const avgFlow = Math.round(trendData.reduce((s, d) => s + d.flow, 0) / trendData.length);
  const avgCongestion = +(trendData.reduce((s, d) => s + d.congestionIndex, 0) / trendData.length).toFixed(1);
  const avgDigestion = Math.round(trendData.reduce((s, d) => s + d.portDigestion, 0) / trendData.length);
  const peakFlow = Math.max(...trendData.map(d => d.flow));
  const peakCongestion = Math.max(...trendData.map(d => d.congestionIndex));
  const peakFlowDay = trendData.find(d => d.flow === peakFlow);
  const peakCongestionDay = trendData.find(d => d.congestionIndex === peakCongestion);

  // 异常日识别（拥堵指数 > 6）
  const abnormalDays = trendData.filter(d => d.congestionIndex > 5.5);

  // 周度汇总
  const weeklyFlow = [
    { week: '第1周', flow: 42000 }, { week: '第2周', flow: 48500 }, { week: '第3周', flow: 52000 },
    { week: '第4周', flow: 46000 }, { week: '最近周', flow: avgFlow * 7 },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="#8B5CF6" /> 交通运行趋势分析
        </h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>基于 {trendData.length} 天历史数据，识别车流规律、拥堵峰值、异常波动</p>
      </div>

      {/* Key metrics cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: '日均车流量', value: avgFlow.toLocaleString(), unit: '辆', icon: Activity, color: '#00D0E9', sub: `峰值 ${peakFlow.toLocaleString()} (${peakFlowDay?.date.slice(5) || ''})` },
          { label: '平均拥堵指数', value: avgCongestion, unit: '', icon: AlertTriangle, color: '#F5A623', sub: `峰值 ${peakCongestion.toFixed(1)} (${peakCongestionDay?.date.slice(5) || ''})` },
          { label: '港口消化率', value: avgDigestion, unit: '%', icon: TrendingUp, color: '#2ED573', sub: `${avgDigestion >= 80 ? '运力充足' : avgDigestion >= 60 ? '运力紧张' : '运力不足'}` },
          { label: '异常天数', value: abnormalDays.length, unit: '天', icon: Calendar, color: '#FF4757', sub: `占比 ${((abnormalDays.length / trendData.length) * 100).toFixed(1)}%` },
        ].map((m, i) => (
          <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <m.icon size={12} color={m.color} />
              <span style={{ fontSize: 10, color: '#A0A8B4' }}>{m.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</span>
              {m.unit && <span style={{ fontSize: 10, color: '#64748B' }}>{m.unit}</span>}
            </div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main trend chart */}
      <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>日度车流与拥堵趋势</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.5)' }} /> 异常日
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 2, background: '#F5A623' }} /> 警戒线
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D0E9" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#00D0E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
            <YAxis yAxisId="left" stroke="#00D0E9" style={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#F5A623" style={{ fontSize: 10 }} domain={[0, 10]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ stroke: 'rgba(139,92,246,0.4)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="right" y={5} stroke="#F5A623" strokeDasharray="3 3" strokeWidth={1} />
            {abnormalDays.slice(0, 5).map((d, i) => (
              <ReferenceArea key={i} yAxisId="right" x1={d.date} x2={d.date} fill="rgba(255,71,87,0.15)" />
            ))}
            <Area yAxisId="left" type="monotone" dataKey="flow" stroke="#00D0E9" strokeWidth={2} fill="url(#flowGrad)" name="车流量(辆)" />
            <Line yAxisId="right" type="monotone" dataKey="congestionIndex" stroke="#F5A623" strokeWidth={2} dot={false} name="拥堵指数" />
            <Line yAxisId="right" type="monotone" dataKey="portDigestion" stroke="#2ED573" strokeWidth={2} dot={false} name="港口消化率(%)" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column: Weekly + Event markers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>近5周车流量</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyFlow} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#64748B" style={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#E2E8F0', fontWeight: 600 }} itemStyle={{ color: '#C9CDD4' }} cursor={{ stroke: 'rgba(139,92,246,0.4)' }} />
              <Line type="monotone" dataKey="flow" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} name="周车流总量" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>区间关键事件（{filteredEvents.length} 起）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {filteredEvents.slice(0, 6).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(139,92,246,0.08)', borderRadius: 4, fontSize: 11 }}>
                <span style={{ color: '#8B5CF6', fontFamily: 'monospace', fontSize: 10, minWidth: 70 }}>{e.startTime.slice(5, 10)}</span>
                <span style={{ flex: 1, color: '#E2E8F0' }}>{e.name}</span>
                <span style={{ color: '#F5A623', fontFamily: 'monospace' }}>{e.peakCongestionIndex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ padding: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,208,233,0.05) 100%)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Activity size={14} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>趋势洞察</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#C9CDD4', lineHeight: 1.8 }}>
          <li>区间内共识别 <span style={{ color: '#FF4757', fontWeight: 600 }}>{abnormalDays.length} 个异常日</span>（拥堵指数&gt;5.5），峰值拥堵 {peakCongestion.toFixed(1)} 出现在 {peakCongestionDay?.date}</li>
          <li>港口消化率平均 {avgDigestion}%，{avgDigestion >= 80 ? '整体运力充足，可应对正常波动' : avgDigestion >= 60 ? '运力趋紧，需关注节假日和台风期' : '运力不足，建议升级港口调度'}</li>
          <li>日均车流 {avgFlow.toLocaleString()} 辆，峰值 {peakFlow.toLocaleString()} 辆，波动系数 {((peakFlow - avgFlow) / avgFlow * 100).toFixed(0)}%，{((peakFlow - avgFlow) / avgFlow * 100) > 50 ? '波动较大需加强预警' : '波动在可控范围'}</li>
          <li>建议：针对异常日集中时段（{abnormalDays.length > 0 ? abnormalDays[0].date.slice(5) : '无'}前后），启动预防性策略，减少事后处置成本</li>
        </ul>
      </div>
    </div>
  );
}
