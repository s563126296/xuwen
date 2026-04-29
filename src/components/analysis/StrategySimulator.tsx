import { useState } from 'react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSimulatorStore } from '../../stores/simulatorStore';

const STRATEGY_OPTIONS = [
  { id: 'S-01', name: '应急车道开放' },
  { id: 'S-02', name: 'S376 省道分流' },
  { id: 'S-03', name: 'G207 国道分流' },
  { id: 'S-04', name: '信号灯配时优化' },
  { id: 'S-05', name: '港口增开班次' },
  { id: 'S-06', name: '限流入港' },
  { id: 'S-07', name: '事故快速处置' },
  { id: 'S-08', name: '临时停车区启用' },
  { id: 'S-09', name: '诱导屏信息发布' },
  { id: 'S-10', name: '海安新港分流' },
  { id: 'S-11', name: '货客分时通行' },
  { id: 'S-12', name: '冷链车优先通道' },
  { id: 'S-13', name: '潮汐车道借用' },
  { id: 'S-14', name: '交警增援部署' },
  { id: 'S-15', name: '预约通行引导' },
];

const COLORS = ['#00D0E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

export default function StrategySimulator() {
  const { params, results, baselineCurve, isSimulating, aiRecommendation, setCommonEnv, setStrategyParam, setSelectedStrategies, runSimulation, clearResults } = useSimulatorStore();
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    if (params.selectedStrategies.length > 5) {
      alert('最多只能同时选择 5 个策略进行对比');
      return;
    }
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
    <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'hidden' }}>
        {/* Left: Parameters */}
        <div style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(13,27,42,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {/* Scrollable content area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            paddingBottom: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>
              模拟参数
            </div>

            {/* Strategy Selection */}
            <ParamSection label="选择策略">
              {params.selectedStrategies.length >= 5 && (
                <div style={{ fontSize: 10, color: '#F59E0B', marginBottom: 6 }}>
                  已达上限（最多 5 个）
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STRATEGY_OPTIONS.map((opt) => {
                  const checked = params.selectedStrategies.includes(opt.id);
                  const disabled = !checked && params.selectedStrategies.length >= 5;
                  return (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...params.selectedStrategies, opt.id]
                            : params.selectedStrategies.filter((id) => id !== opt.id);
                          setSelectedStrategies(newList);
                        }}
                        style={{ accentColor: '#00D0E9' }}
                      />
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>{opt.name}</span>
                    </label>
                  );
                })}
              </div>
            </ParamSection>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

            {/* Common Environment Parameters */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#00D0E9', marginBottom: 10 }}>
              通用环境参数
            </div>

            <ParamSection label="天气条件">
              <Select value={params.commonEnv.weather} onChange={(v) => setCommonEnv('weather', v as any)} options={[
                { value: 'clear', label: '晴朗' },
                { value: 'rain', label: '降雨' },
                { value: 'fog', label: '大雾' },
              ]} />
            </ParamSection>

            <ParamSection label="车流量">
              <Select value={params.commonEnv.trafficVolume} onChange={(v) => setCommonEnv('trafficVolume', v as any)} options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]} />
            </ParamSection>

            <ParamSection label="货车比例">
              <Select value={params.commonEnv.truckRatio} onChange={(v) => setCommonEnv('truckRatio', v as any)} options={[
                { value: 'low', label: '低 (<20%)' },
                { value: 'medium', label: '中 (20-40%)' },
                { value: 'high', label: '高 (>40%)' },
              ]} />
            </ParamSection>

            <ParamSection label="港口消化能力">
              <Select value={params.commonEnv.portCapacity} onChange={(v) => setCommonEnv('portCapacity', v as any)} options={[
                { value: 'reduced', label: '降低' },
                { value: 'normal', label: '正常' },
                { value: 'enhanced', label: '增强' },
              ]} />
            </ParamSection>

            <ParamSection label="时段">
              <Select value={params.commonEnv.timePeriod} onChange={(v) => setCommonEnv('timePeriod', v as any)} options={[
                { value: 'morning', label: '早高峰' },
                { value: 'noon', label: '午间' },
                { value: 'evening', label: '晚高峰' },
                { value: 'night', label: '夜间' },
              ]} />
            </ParamSection>

            <ParamSection label="流入速率">
              <Select value={params.commonEnv.inflowRate} onChange={(v) => setCommonEnv('inflowRate', v as any)} options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]} />
            </ParamSection>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

            {/* Strategy-Specific Parameters */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#00D0E9', marginBottom: 10 }}>
              策略专属参数
            </div>

            <StrategySpecificSection
              selectedStrategies={params.selectedStrategies}
              strategyParams={params.strategyParams}
              setStrategyParam={setStrategyParam}
            />
          </div>

          {/* Fixed bottom button area */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(13,27,42,0.9)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
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
        </div>

        {/* Right: Chart + Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, overflowY: 'auto' }}>
          {/* AI Recommendation */}
          {aiRecommendation && (
            <div style={{
              padding: 16,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 8,
              flexShrink: 0,
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
                    label={{ value: '拥堵指数', angle: -90, position: 'insideLeft', dx: -10, fill: '#94A3B8', fontSize: 11 }}
                    domain={[0, 8]}
                    width={50}
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
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="plainline" />
                  <Line type="natural" dataKey="baseline" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" name="无干预基线" dot={false} />
                  {results.map((result, i) => (
                    <Line
                      key={result.strategyId}
                      type="natural"
                      dataKey={`strategy_${i}`}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      name={`${result.strategyName}`}
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
  );
}

// Strategy-specific parameter section
function StrategySpecificSection({
  selectedStrategies,
  strategyParams,
  setStrategyParam,
}: {
  selectedStrategies: string[];
  strategyParams: Record<string, any>;
  setStrategyParam: (strategyId: string, key: any, value: any) => void;
}) {
  if (selectedStrategies.length === 0) {
    return (
      <div style={{
        padding: '12px 10px',
        background: 'rgba(15,23,42,0.5)',
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 6,
        color: '#64748B',
        fontSize: 11,
        textAlign: 'center',
      }}>
        请选择至少一个策略查看专属参数
      </div>
    );
  }

  // Only show cards for strategies that have specific params
  const strategiesWithParams = selectedStrategies.filter((id) =>
    ['S-02', 'S-03', 'S-04', 'S-06', 'S-07', 'S-08', 'S-11', 'S-15'].includes(id)
  );

  if (strategiesWithParams.length === 0) {
    return (
      <div style={{
        padding: '12px 10px',
        background: 'rgba(15,23,42,0.5)',
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 6,
        color: '#64748B',
        fontSize: 11,
        textAlign: 'center',
      }}>
        已选策略暂无专属参数配置
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {strategiesWithParams.map((strategyId) => (
        <StrategyParamCard
          key={strategyId}
          strategyId={strategyId}
          params={strategyParams[strategyId] || {}}
          setStrategyParam={setStrategyParam}
        />
      ))}
    </div>
  );
}

// Strategy parameter card
function StrategyParamCard({
  strategyId,
  params,
  setStrategyParam,
}: {
  strategyId: string;
  params: Record<string, any>;
  setStrategyParam: (strategyId: string, key: any, value: any) => void;
}) {
  const strategy = STRATEGY_OPTIONS.find((s) => s.id === strategyId);
  if (!strategy) return null;

  return (
    <div style={{
      padding: 10,
      background: 'rgba(15,23,42,0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>
        {strategy.name}
      </div>

      {strategyId === 'S-02' && (
        <ParamSection label="分流比例">
          <Select value={String(params.diversionRatio ?? 30)} onChange={(v) => setStrategyParam(strategyId, 'diversionRatio', Number(v))} options={[
            { value: '10', label: '10%' },
            { value: '20', label: '20%' },
            { value: '30', label: '30%' },
            { value: '40', label: '40%' },
            { value: '50', label: '50%' },
          ]} />
        </ParamSection>
      )}

      {strategyId === 'S-03' && (
        <>
          <ParamSection label="分流比例">
            <Select value={String(params.diversionRatio ?? 20)} onChange={(v) => setStrategyParam(strategyId, 'diversionRatio', Number(v))} options={[
              { value: '10', label: '10%' },
              { value: '15', label: '15%' },
              { value: '20', label: '20%' },
              { value: '25', label: '25%' },
              { value: '30', label: '30%' },
            ]} />
          </ParamSection>
          <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 6, lineHeight: 1.4 }}>
            提示：S-02 + S-03 总分流比例建议不超过 60%
          </div>
        </>
      )}

      {strategyId === 'S-04' && (
        <>
          <ParamSection label="配时方案">
            <Select value={params.signalPlan ?? 'A'} onChange={(v) => setStrategyParam(strategyId, 'signalPlan', v)} options={[
              { value: 'A', label: '方案 A（轻度）' },
              { value: 'B', label: '方案 B（中度）' },
              { value: 'C', label: '方案 C（重度）' },
            ]} />
          </ParamSection>
          <ParamSection label="绿灯时长">
            <Select value={String(params.greenLightDuration ?? 50)} onChange={(v) => setStrategyParam(strategyId, 'greenLightDuration', Number(v))} options={[
              { value: '50', label: '50 秒' },
              { value: '60', label: '60 秒' },
              { value: '70', label: '70 秒' },
            ]} />
          </ParamSection>
        </>
      )}

      {strategyId === 'S-06' && (
        <>
          <ParamSection label="放行间隔">
            <Select value={String(params.releaseInterval ?? 5)} onChange={(v) => setStrategyParam(strategyId, 'releaseInterval', Number(v))} options={[
              { value: '3', label: '3 分钟' },
              { value: '5', label: '5 分钟' },
              { value: '8', label: '8 分钟' },
              { value: '10', label: '10 分钟' },
            ]} />
          </ParamSection>
          <ParamSection label="每批车辆数">
            <Select value={String(params.vehiclesPerBatch ?? 40)} onChange={(v) => setStrategyParam(strategyId, 'vehiclesPerBatch', Number(v))} options={[
              { value: '20', label: '20 辆' },
              { value: '30', label: '30 辆' },
              { value: '40', label: '40 辆' },
              { value: '50', label: '50 辆' },
            ]} />
          </ParamSection>
        </>
      )}

      {strategyId === 'S-07' && (
        <>
          <ParamSection label="事故等级">
            <Select value={params.accidentLevel ?? 'moderate'} onChange={(v) => setStrategyParam(strategyId, 'accidentLevel', v)} options={[
              { value: 'minor', label: '轻微事故' },
              { value: 'moderate', label: '一般事故' },
              { value: 'severe', label: '严重事故' },
            ]} />
          </ParamSection>
          <ParamSection label="资源等级">
            <Select value={params.resourceLevel ?? 'level2'} onChange={(v) => setStrategyParam(strategyId, 'resourceLevel', v)} options={[
              { value: 'level1', label: '一级响应' },
              { value: 'level2', label: '二级响应' },
              { value: 'level3', label: '三级响应' },
            ]} />
          </ParamSection>
        </>
      )}

      {strategyId === 'S-08' && (
        <>
          <ParamSection label="停车区容量">
            <Select value={String(params.parkingCapacity ?? 300)} onChange={(v) => setStrategyParam(strategyId, 'parkingCapacity', Number(v))} options={[
              { value: '200', label: '200 辆' },
              { value: '300', label: '300 辆' },
              { value: '400', label: '400 辆' },
              { value: '500', label: '500 辆' },
            ]} />
          </ParamSection>
          <ParamSection label="启用范围">
            <Select value={params.activationScope ?? 'partial'} onChange={(v) => setStrategyParam(strategyId, 'activationScope', v)} options={[
              { value: 'partial', label: '部分启用' },
              { value: 'full', label: '全部启用' },
            ]} />
          </ParamSection>
        </>
      )}

      {strategyId === 'S-11' && (
        <>
          <ParamSection label="客车优先时段">
            <Select value={params.passengerPriorityHours ?? '08:00-10:00,14:00-18:00'} onChange={(v) => setStrategyParam(strategyId, 'passengerPriorityHours', v)} options={[
              { value: '08:00-10:00,14:00-18:00', label: '08:00-10:00, 14:00-18:00' },
              { value: '07:00-10:00,15:00-19:00', label: '07:00-10:00, 15:00-19:00' },
            ]} />
          </ParamSection>
          <ParamSection label="货车限制时段">
            <Select value={params.cargoRestrictionHours ?? '06:00-08:00,10:00-14:00,18:00-22:00'} onChange={(v) => setStrategyParam(strategyId, 'cargoRestrictionHours', v)} options={[
              { value: '06:00-08:00,10:00-14:00,18:00-22:00', label: '06:00-08:00, 10:00-14:00, 18:00-22:00' },
              { value: '06:00-09:00,11:00-15:00,19:00-22:00', label: '06:00-09:00, 11:00-15:00, 19:00-22:00' },
            ]} />
          </ParamSection>
        </>
      )}

      {strategyId === 'S-15' && (
        <>
          <ParamSection label="预约覆盖率">
            <Select value={String(params.appointmentCoverage ?? 50)} onChange={(v) => setStrategyParam(strategyId, 'appointmentCoverage', Number(v))} options={[
              { value: '30', label: '30%' },
              { value: '50', label: '50%' },
              { value: '70', label: '70%' },
              { value: '80', label: '80%' },
            ]} />
          </ParamSection>
          <ParamSection label="时段容量">
            <Select value={String(params.slotCapacity ?? 400)} onChange={(v) => setStrategyParam(strategyId, 'slotCapacity', Number(v))} options={[
              { value: '300', label: '300 辆/时' },
              { value: '400', label: '400 辆/时' },
              { value: '500', label: '500 辆/时' },
              { value: '600', label: '600 辆/时' },
            ]} />
          </ParamSection>
        </>
      )}
    </div>
  );
}

// Helper components
function ParamSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 5, fontWeight: 500 }}>{label}</div>
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
        padding: '5px 7px',
        background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        color: '#E2E8F0',
        fontSize: 10,
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

