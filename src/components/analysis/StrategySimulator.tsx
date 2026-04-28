import { useState } from 'react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSimulatorStore } from '../../stores/simulatorStore';

const STRATEGY_OPTIONS = [
  { id: 'S-01', name: '应急车道借用' },
  { id: 'S-02', name: 'S376 省道分流' },
  { id: 'S-04', name: '信号灯配时优化' },
  { id: 'S-05', name: '港口增开班次' },
  { id: 'S-07', name: '事故快速处置' },
  { id: 'S-09', name: '诱导屏信息发布' },
];

const COLORS = ['#00D0E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

export default function StrategySimulator() {
  const { params, results, baselineCurve, isSimulating, aiRecommendation, setParam, runSimulation, clearResults } = useSimulatorStore();
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    runSimulation();
    setHasRun(true);
  };

  const handleReset = () => {
    clearResults();
    setHasRun(false);
  };

  // Merge all curves for chart display
  const chartData = hasRun && baselineCurve.length > 0 ? baselineCurve.map((point, idx) => {
    const dataPoint: any = { time: point.time, baseline: point.congestion };
    results.forEach((result, i) => {
      dataPoint[`strategy_${i}`] = result.curve[idx]?.congestion ?? null;
    });
    return dataPoint;
  }) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* AI Recommendation */}
      {aiRecommendation && (
        <div style={{
          padding: 16,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={16} color="#8B5CF6" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>AI 推荐策略</span>
          </div>
          <div style={{ fontSize: 12, color: '#E2E8F0', lineHeight: 1.6, marginBottom: 8 }}>
            {aiRecommendation.reason}
          </div>
          {aiRecommendation.riskFactors.length > 0 && (
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              风险提示：{aiRecommendation.riskFactors.join('；')}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Left: Parameters */}
        <div style={{
          width: 280,
          flexShrink: 0,
          padding: 16,
          background: 'rgba(13,27,42,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
            模拟参数
          </div>

          {/* Selected Strategies */}
          <ParamSection label="选择策略">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STRATEGY_OPTIONS.map((opt) => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={params.selectedStrategies.includes(opt.id)}
                    onChange={(e) => {
                      const newList = e.target.checked
                        ? [...params.selectedStrategies, opt.id]
                        : params.selectedStrategies.filter((id) => id !== opt.id);
                      setParam('selectedStrategies', newList);
                    }}
                    style={{ accentColor: '#00D0E9' }}
                  />
                  <span style={{ fontSize: 11, color: '#CBD5E1' }}>{opt.name}</span>
                </label>
              ))}
            </div>
          </ParamSection>

          <ParamSection label="天气条件">
            <Select value={params.weather} onChange={(v) => setParam('weather', v as any)} options={[
              { value: 'clear', label: '晴朗' },
              { value: 'rain', label: '降雨' },
              { value: 'fog', label: '大雾' },
            ]} />
          </ParamSection>

          <ParamSection label="车流量">
            <Select value={params.trafficVolume} onChange={(v) => setParam('trafficVolume', v as any)} options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
            ]} />
          </ParamSection>

          <ParamSection label="货车比例">
            <Select value={params.truckRatio} onChange={(v) => setParam('truckRatio', v as any)} options={[
              { value: 'low', label: '低 (<20%)' },
              { value: 'medium', label: '中 (20-40%)' },
              { value: 'high', label: '高 (>40%)' },
            ]} />
          </ParamSection>

          <ParamSection label="分流道路状态">
            <Select value={params.diversionRoadStatus} onChange={(v) => setParam('diversionRoadStatus', v as any)} options={[
              { value: 'smooth', label: '畅通' },
              { value: 'congested', label: '拥堵' },
            ]} />
          </ParamSection>

          <ParamSection label="港口消化能力">
            <Select value={params.portCapacity} onChange={(v) => setParam('portCapacity', v as any)} options={[
              { value: 'reduced', label: '降低' },
              { value: 'normal', label: '正常' },
              { value: 'enhanced', label: '增强' },
            ]} />
          </ParamSection>

          <ParamSection label="时段">
            <Select value={params.timePeriod} onChange={(v) => setParam('timePeriod', v as any)} options={[
              { value: 'morning', label: '早高峰' },
              { value: 'noon', label: '午间' },
              { value: 'evening', label: '晚高峰' },
              { value: 'night', label: '夜间' },
            ]} />
          </ParamSection>

          <ParamSection label="流入速率">
            <Select value={params.inflowRate} onChange={(v) => setParam('inflowRate', v as any)} options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
            ]} />
          </ParamSection>

          <ParamSection label="信号配时方案">
            <Select value={params.signalPlan} onChange={(v) => setParam('signalPlan', v as any)} options={[
              { value: 'default', label: '默认' },
              { value: 'peak', label: '高峰' },
              { value: 'emergency', label: '应急' },
            ]} />
          </ParamSection>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={handleRun}
              disabled={isSimulating || params.selectedStrategies.length === 0}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: params.selectedStrategies.length === 0 ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg, #00D0E9 0%, #0891B2 100%)',
                border: 'none',
                borderRadius: 6,
                color: '#FFF',
                fontSize: 12,
                fontWeight: 600,
                cursor: params.selectedStrategies.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: isSimulating ? 0.6 : 1,
              }}
            >
              <Play size={14} />
              {isSimulating ? '模拟中...' : '运行模拟'}
            </button>
            <button
              onClick={handleReset}
              disabled={!hasRun}
              style={{
                padding: '8px 12px',
                background: 'rgba(100,116,139,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: '#94A3B8',
                fontSize: 12,
                cursor: hasRun ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Right: Chart + Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {/* Chart */}
          <div style={{
            flex: 1,
            padding: 16,
            background: 'rgba(13,27,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            minHeight: 300,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
              拥堵指数变化曲线
            </div>
            {!hasRun ? (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                fontSize: 12,
              }}>
                选择策略并点击「运行模拟」查看结果
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    label={{ value: '时间 (分钟)', position: 'insideBottom', offset: -5, fill: '#94A3B8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    label={{ value: '拥堵指数', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                    domain={[0, 8]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13,27,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="baseline" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name="无干预基线" dot={false} />
                  {results.map((result, i) => (
                    <Line
                      key={result.strategyId}
                      type="monotone"
                      dataKey={`strategy_${i}`}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      name={result.strategyName}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Comparison Table */}
          {hasRun && results.length > 0 && (
            <div style={{
              padding: 16,
              background: 'rgba(13,27,42,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
                策略对比
              </div>
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#94A3B8', fontWeight: 500 }}>策略</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', color: '#94A3B8', fontWeight: 500 }}>缓解时间</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', color: '#94A3B8', fontWeight: 500 }}>分流车辆</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', color: '#94A3B8', fontWeight: 500 }}>成功率</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', color: '#94A3B8', fontWeight: 500 }}>置信度</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, i) => (
                    <tr key={result.strategyId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        {result.strategyName}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 0', color: '#CBD5E1' }}>
                        {result.reliefMinutes >= 120 ? '未达标' : `${result.reliefMinutes} 分钟`}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 0', color: '#CBD5E1' }}>
                        {result.diversionVolume} 辆
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 0', color: '#CBD5E1' }}>
                        {Math.round(result.successRate * 100)}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 0' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: result.confidence >= 80 ? 'rgba(16,185,129,0.15)' : result.confidence >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: result.confidence >= 80 ? '#10B981' : result.confidence >= 60 ? '#F59E0B' : '#EF4444',
                        }}>
                          {result.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function ParamSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '6px 8px',
        background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        color: '#E2E8F0',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
