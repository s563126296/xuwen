import { useState, useRef, useEffect } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useOverviewStore } from '../../stores/overviewStore';
import { useCommandStore } from '../../stores/commandStore';

interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  color: string;
  apply: () => void;
}

export default function ScenarioPresetPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const setSystemMode = useUIStore((s) => s.setSystemMode);
  const updatePortData = useOverviewStore((s) => s.updatePortData);
  const setPortDigestion = useOverviewStore((s) => s.setPortDigestion);
  const setAiSummary = useOverviewStore((s) => s.setAiSummary);
  const setActiveAlert = useOverviewStore((s) => s.setActiveAlert);
  const clearActiveAlert = useOverviewStore((s) => s.clearActiveAlert);
  const setCorridorPressure = useOverviewStore((s) => s.setCorridorPressure);
  const setCommandState = useCommandStore((s) => s.setCommandState);
  const setMonitorState = useCommandStore((s) => s.setMonitorState);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const scenarios: ScenarioPreset[] = [
    {
      id: 'normal',
      label: '日常平稳',
      description: '拥堵指数 2.5，港口正常运转',
      color: '#2ED573',
      apply: () => {
        setSystemMode('overview');
        updatePortData('xuwen', { congestionIndex: 2.5, status: 'normal' });
        setPortDigestion({
          xuwen: { waitingVehicles: 380, digestionMinutes: 120, shipInterval: 35, shipCapacity: 280, nextDeparture: '14:30', loadEfficiency: 0.95 },
          haian: { waitingVehicles: 280, digestionMinutes: 90, shipInterval: 30, shipCapacity: 320, nextDeparture: '14:15', loadEfficiency: 0.88 },
        });
        setAiSummary({
          level: 'green',
          conclusion: '交通平稳',
          suggestionHint: '无需干预',
          badges: [{ label: '车流 1.8万', type: 'flow' }, { label: '港口等380', type: 'port' }, { label: '韧性 68', type: 'resilience' }],
          headerTitle: '日常运行 · 交通平稳',
          metrics: [
            { value: '18,200', label: '今日车流', color: '#00D0E9' },
            { value: '380', label: '港口等待(辆)', color: '#2ED573' },
            { value: '65%', label: '南向通道压力', color: '#00D0E9' },
            { value: '68', label: '应急韧性', color: '#2ED573' },
          ],
          forecasts: [{ time: '15:00', text: '预计保持平稳', level: 'info' }],
          actions: [],
          compares: [{ label: '车流', value: '-2% ↓', good: true }],
          compareConclusion: '整体平稳',
          expanded: false,
          riskForecast: { next30min: 'low', next1hour: 'low' },
          predictionConfidence: 85,
        });
        clearActiveAlert();
      },
    },
    {
      id: 'low-risk',
      label: '低风险',
      description: '车流上升，港口排队增加',
      color: '#F5A623',
      apply: () => {
        setSystemMode('overview');
        updatePortData('xuwen', { congestionIndex: 3.8, status: 'busy' });
        setPortDigestion({
          xuwen: { waitingVehicles: 850, digestionMinutes: 280, shipInterval: 35, shipCapacity: 280, nextDeparture: '14:30', loadEfficiency: 0.95 },
          haian: { waitingVehicles: 420, digestionMinutes: 140, shipInterval: 30, shipCapacity: 320, nextDeparture: '14:15', loadEfficiency: 0.88 },
        });
        setCorridorPressure({
          south: { name: '南向通道（进港方向）', currentFlow: 1750, designCapacity: 2000, pressure: 88, directionLabel: '进港主通道' },
          north: { name: '北向通道（城区方向）', currentFlow: 1400, designCapacity: 2000, pressure: 70, directionLabel: '城区连接' },
          west: { name: '西向通道（G207方向）', currentFlow: 1248, designCapacity: 1600, pressure: 78, directionLabel: 'G207国道' },
          east: { name: '东向通道（环半岛方向）', currentFlow: 700, designCapacity: 1400, pressure: 50, directionLabel: '环半岛公路' },
        });
        setAiSummary({
          level: 'yellow',
          conclusion: '低风险预警',
          suggestionHint: '预计30分钟后拥堵指数达4.5',
          badges: [{ label: '车流 2.8万', type: 'flow' }, { label: '港口等850', type: 'port' }, { label: '韧性 52', type: 'resilience' }],
          headerTitle: '低风险预警 · 车流上升趋势',
          metrics: [
            { value: '28,400', label: '今日车流', color: '#00D0E9', tag: '↑15%', tagType: 'up' },
            { value: '850', label: '港口等待(辆)', color: '#F5A623', tag: '↑4h40m', tagType: 'up' },
            { value: '88%', label: '南向通道压力', color: '#F5A623' },
            { value: '52', label: '应急韧性', color: '#F5A623' },
          ],
          forecasts: [
            { time: '15:00', text: '预计拥堵指数达4.5，港口排队持续增加', level: 'warn' },
            { time: '15:30', text: '南向通道压力可能超过90%', level: 'warn' },
          ],
          actions: [{ title: '关注港口排队', description: '排队车辆接近预警阈值', priority: 'medium' }],
          compares: [{ label: '车流', value: '+8% ↑', good: false }],
          compareConclusion: '略高于去年',
          expanded: false,
          riskForecast: { next30min: 'medium', next1hour: 'medium' },
          predictionConfidence: 78,
        });
        clearActiveAlert();
      },
    },
    {
      id: 'high-risk',
      label: '高风险',
      description: '港口积压+车流激增',
      color: '#FF6B35',
      apply: () => {
        setSystemMode('overview');
        updatePortData('xuwen', { congestionIndex: 5.2, status: 'congested' });
        setPortDigestion({
          xuwen: { waitingVehicles: 1350, digestionMinutes: 420, shipInterval: 35, shipCapacity: 280, nextDeparture: '14:30', loadEfficiency: 0.95 },
          haian: { waitingVehicles: 580, digestionMinutes: 180, shipInterval: 30, shipCapacity: 320, nextDeparture: '14:15', loadEfficiency: 0.88 },
        });
        setCorridorPressure({
          south: { name: '南向通道（进港方向）', currentFlow: 1920, designCapacity: 2000, pressure: 96, directionLabel: '进港主通道' },
          north: { name: '北向通道（城区方向）', currentFlow: 1550, designCapacity: 2000, pressure: 78, directionLabel: '城区连接' },
          west: { name: '西向通道（G207方向）', currentFlow: 1380, designCapacity: 1600, pressure: 86, directionLabel: 'G207国道' },
          east: { name: '东向通道（环半岛方向）', currentFlow: 850, designCapacity: 1400, pressure: 61, directionLabel: '环半岛公路' },
        });
        setAiSummary({
          level: 'orange',
          conclusion: '高风险预警',
          suggestionHint: '预计30分钟后拥堵指数达6.8',
          badges: [{ label: '车流 3.8万', type: 'flow' }, { label: '港口等1350', type: 'port' }, { label: '韧性 38', type: 'resilience' }],
          headerTitle: '高风险预警 · 建议提前进入指挥模式',
          metrics: [
            { value: '38,200', label: '今日车流', color: '#FF6B35', tag: '↑2.5x', tagType: 'up' },
            { value: '1,350', label: '港口等待(辆)', color: '#FF6B35', tag: '↑7h', tagType: 'up' },
            { value: '96%', label: '南向通道压力', color: '#FF6B35' },
            { value: '38', label: '应急韧性', color: '#FF6B35', tag: '薄弱', tagType: 'up' },
          ],
          forecasts: [
            { time: '15:00', text: '预计拥堵指数达6.8，超过指挥模式阈值', level: 'danger' },
            { time: '15:30', text: '港口压力持续上升，韧性预计降至30（橙→红）', level: 'danger' },
          ],
          actions: [
            { title: '提前进入指挥模式', description: '预计30分钟后达到紧急阈值', priority: 'high', mode: 'command' },
          ],
          compares: [{ label: '车流', value: '+25% ↑', good: false }],
          compareConclusion: '明显高于去年',
          expanded: false,
          riskForecast: { next30min: 'high', next1hour: 'high' },
          predictionConfidence: 82,
        });
        // Show popup suggesting command mode
        setActiveAlert({
          id: 'high-risk-alert',
          type: 'congestion',
          title: '高风险预警',
          content: '预测30分钟后拥堵指数将达6.8，建议提前进入指挥模式进行预准备',
          factors: [
            { name: '港口积压', weight: 65 },
            { name: '车流激增', weight: 25 },
            { name: '通道饱和', weight: 10 },
          ],
          suggestion: '建议立即进入指挥模式，提前部署S376分流和应急车道方案',
          timestamp: Date.now(),
        });
      },
    },
    {
      id: 'emergency',
      label: '紧急事故',
      description: '事故发生，拥堵指数7.0',
      color: '#DC2626',
      apply: () => {
        setSystemMode('overview');
        updatePortData('xuwen', { congestionIndex: 7.0, status: 'congested' });
        setPortDigestion({
          xuwen: { waitingVehicles: 1500, digestionMinutes: 480, shipInterval: 35, shipCapacity: 280, nextDeparture: '14:30', loadEfficiency: 0.95 },
          haian: { waitingVehicles: 650, digestionMinutes: 200, shipInterval: 30, shipCapacity: 320, nextDeparture: '14:15', loadEfficiency: 0.88 },
        });
        setCorridorPressure({
          south: { name: '南向通道（进港方向）', currentFlow: 1980, designCapacity: 2000, pressure: 99, directionLabel: '进港主通道' },
          north: { name: '北向通道（城区方向）', currentFlow: 1700, designCapacity: 2000, pressure: 85, directionLabel: '城区连接' },
          west: { name: '西向通道（G207方向）', currentFlow: 1480, designCapacity: 1600, pressure: 93, directionLabel: 'G207国道' },
          east: { name: '东向通道（环半岛方向）', currentFlow: 950, designCapacity: 1400, pressure: 68, directionLabel: '环半岛公路' },
        });
        setAiSummary({
          level: 'red',
          conclusion: '紧急事故',
          suggestionHint: '进港大道发生交通事故，拥堵指数7.0',
          badges: [{ label: '事故', type: 'flow' }, { label: '指数7.0', type: 'port' }, { label: '韧性 25', type: 'resilience' }],
          headerTitle: '紧急事故 · 建议立即进入指挥模式',
          metrics: [
            { value: '7.0', label: '拥堵指数', color: '#DC2626' },
            { value: '1,500', label: '港口等待(辆)', color: '#DC2626' },
            { value: '99%', label: '南向通道压力', color: '#DC2626' },
            { value: '25', label: '应急韧性', color: '#DC2626' },
          ],
          forecasts: [{ time: '现在', text: '进港大道发生交通事故，需立即处置', level: 'danger' }],
          actions: [{ title: '立即进入指挥模式', description: '启动事故快速处置方案', priority: 'high', mode: 'command' }],
          compares: [],
          compareConclusion: '',
          expanded: true,
          riskForecast: { next30min: 'high', next1hour: 'high' },
          predictionConfidence: 95,
        });
        setActiveAlert({
          id: 'emergency-alert',
          type: 'emergency',
          title: '紧急事故预警',
          content: '进港大道发生交通事故，拥堵指数已达 7.0，需立即启动应急处置',
          factors: [
            { name: '交通事故', weight: 70 },
            { name: '港口积压', weight: 20 },
            { name: '通道饱和', weight: 10 },
          ],
          suggestion: '建议立即进入指挥模式，启动 S-07 事故快速处置方案',
          timestamp: Date.now(),
        });
      },
    },
    {
      id: 'executing',
      label: '策略执行中',
      description: 'S-02执行30分钟，偏差监控激活',
      color: '#00D0E9',
      apply: () => {
        setSystemMode('command');
        setCommandState({
          congestionIndex: 5.8,
          congestionTrend: 'falling',
          strategies: [
            {
              id: 'S-02',
              name: 'S376 省道分流',
              recommended: true,
              permission: 'confirm',
              permissionLabel: '🟡 需确认',
              effect: '6.5 → 5.2',
              time: '约 20 分钟',
              reduce: '~200 辆',
              difficulty: 1,
              effectTime: '3 分钟生效',
              risk: 'S376 沿线居民出行受影响',
              triggerCondition: '进港大道拥堵指数 > 4.0',
              status: 'executing',
            },
          ],
          executionSteps: [
            { label: '策略确认', status: 'done' },
            { label: '指令下发', status: 'done' },
            { label: '现场执行', status: 'done' },
            { label: '效果验证', status: 'active' },
          ],
          currentStep: 6,
        });
        // Start monitoring
        const startTime = Date.now() - 30 * 60 * 1000; // 30 minutes ago
        setMonitorState({
          isMonitoring: true,
          monitorStartTime: startTime,
          monitorStrategyId: 'S-02',
          curveData: [
            { timestamp: startTime, minutesAfter: 0, expected: 6.5, actual: 6.5 },
            { timestamp: startTime + 10 * 60000, minutesAfter: 10, expected: 6.0, actual: 6.1 },
            { timestamp: startTime + 20 * 60000, minutesAfter: 20, expected: 5.6, actual: 5.9 },
            { timestamp: startTime + 30 * 60000, minutesAfter: 30, expected: 5.2, actual: 5.8 },
          ],
          deviationLevel: 'yellow',
          deviationPercent: 11.5,
          expectationVersions: [
            {
              version: 1,
              checkpoints: [
                { minutesAfter: 10, expected: 6.0 },
                { minutesAfter: 20, expected: 5.6 },
                { minutesAfter: 30, expected: 5.2 },
                { minutesAfter: 40, expected: 4.8 },
              ],
              reason: '初始预期：S376分流正常执行',
              timestamp: startTime,
            },
          ],
          activeInquiry: null,
          feedback: null,
        });
      },
    },
    {
      id: 'completed',
      label: '策略完成',
      description: '拥堵缓解至2.9，显示复盘报告',
      color: '#2ED573',
      apply: () => {
        setSystemMode('command');
        setCommandState({
          congestionIndex: 2.9,
          congestionTrend: 'stable',
          strategies: [
            {
              id: 'S-02',
              name: 'S376 省道分流',
              recommended: true,
              permission: 'confirm',
              permissionLabel: '🟡 需确认',
              effect: '6.5 → 5.2',
              time: '约 20 分钟',
              reduce: '~200 辆',
              difficulty: 1,
              effectTime: '3 分钟生效',
              risk: 'S376 沿线居民出行受影响',
              triggerCondition: '进港大道拥堵指数 > 4.0',
              status: 'done',
            },
          ],
          executionSteps: [
            { label: '策略确认', status: 'done' },
            { label: '指令下发', status: 'done' },
            { label: '现场执行', status: 'done' },
            { label: '效果验证', status: 'done' },
          ],
          currentStep: 6,
        });
        // Complete monitoring, show feedback panel
        const startTime = Date.now() - 60 * 60 * 1000; // 60 minutes ago
        setMonitorState({
          isMonitoring: false,
          monitorStartTime: startTime,
          monitorStrategyId: 'S-02',
          curveData: [
            { timestamp: startTime, minutesAfter: 0, expected: 6.5, actual: 6.5 },
            { timestamp: startTime + 15 * 60000, minutesAfter: 15, expected: 5.8, actual: 5.9 },
            { timestamp: startTime + 30 * 60000, minutesAfter: 30, expected: 5.2, actual: 5.4 },
            { timestamp: startTime + 45 * 60000, minutesAfter: 45, expected: 4.5, actual: 4.2 },
            { timestamp: startTime + 60 * 60000, minutesAfter: 60, expected: 4.0, actual: 2.9 },
          ],
          deviationLevel: 'none',
          deviationPercent: 0,
          expectationVersions: [
            {
              version: 1,
              checkpoints: [
                { minutesAfter: 15, expected: 5.8 },
                { minutesAfter: 30, expected: 5.2 },
                { minutesAfter: 45, expected: 4.5 },
                { minutesAfter: 60, expected: 4.0 },
              ],
              reason: 'S376分流正常执行',
              timestamp: startTime,
            },
          ],
          activeInquiry: null,
          feedback: null,
        });
      },
    },
  ];

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Gear icon button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="场景预设"
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: open ? 'rgba(0,208,233,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(0,208,233,0.3)' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'rgba(0,208,233,0.1)';
            e.currentTarget.style.borderColor = 'rgba(0,208,233,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }
        }}
      >
        <FlaskConical size={16} color={open ? '#00D0E9' : '#94A3B8'} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 320,
            maxHeight: 480,
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #0D1220 0%, #1A1F3A 100%)',
            border: '1px solid rgba(0,208,233,0.2)',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 200,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#E0E8FF' }}>
              场景预设（演示用）
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} color="#94A3B8" />
            </button>
          </div>

          {/* Scenario buttons */}
          <div style={{ padding: '8px 12px' }}>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  scenario.apply();
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 8,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${scenario.color}30`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${scenario.color}15`;
                  e.currentTarget.style.borderColor = `${scenario.color}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = `${scenario.color}30`;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: scenario.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E0E8FF' }}>
                    {scenario.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', paddingLeft: 16 }}>
                  {scenario.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
