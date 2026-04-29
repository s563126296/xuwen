import { useEffect, useState } from 'react';
import BigScreen from './pages/BigScreen';
import Header from './components/Header';
import AiSummaryBar from './components/overview/AiSummaryBar';
import AiAlertPopup from './components/overview/AiAlertPopup';
import VirtualAssistant from './components/overview/VirtualAssistant';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import ModeSwitcher from './components/ModeSwitcher';
import PortMode from './components/port/PortMode';
import CommandMode from './components/command/CommandMode';
// v2.0: Emergency mode merged into Command mode
// import EmergencyMode from './components/emergency/EmergencyMode';
import AnalysisMode from './components/analysis/AnalysisMode';
import AIAnalysisMode from './components/ai-analysis/AIAnalysisMode';
import CheckpointModal from './components/CheckpointModal';
import CongestionPredictionModal from './components/CongestionPredictionModal';
import PoiDetailModal from './components/PoiDetailModal';
import StrategyModal from './components/StrategyModal';
import ResilienceInfoModal from './components/overview/ResilienceInfoModal';
import Modal from './components/Modal';
import MapContainer from './components/map/MapContainer';
import StraitTransitIndex from './components/overview/StraitTransitIndex';
import BottomChartsBar from './components/overview/BottomChartsBar';
import { useUIStore, useOverviewStore } from './stores';
import { computeAiSummary } from './utils/aiSummaryEngine';
import { initTTS, BroadcastScenarios } from './utils/assistantEngine';
import { predictRisk } from './utils/riskPredictionEngine';
import { useCommandStore } from './stores/commandStore';
import { computeCauses, recommendStrategies } from './utils/commandEngine';
import './App.css';

interface DeviceData {
  name: string;
  count: number;
  online: number;
  offline: number;
}

interface TrafficData {
  inbound: number;
  outbound: number;
  change: number;
}

interface ViolationData {
  type: string;
  count: number;
  trend: number;
}

function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === '#/bigscreen') return <BigScreen />;

  const [time, setTime] = useState(new Date());

  const systemMode = useUIStore((s) => s.systemMode);
  const portDigestion = useOverviewStore((s) => s.portDigestion);
  const tidalEffect = useOverviewStore((s) => s.tidalEffect);
  const corridorPressure = useOverviewStore((s) => s.corridorPressure);
  const systemResilience = useOverviewStore((s) => s.systemResilience);
  const shutdownProbability = useOverviewStore((s) => s.shutdownProbability);
  const urbanHealth = useOverviewStore((s) => s.urbanHealth);
  const pressureTransmission = useOverviewStore((s) => s.pressureTransmission);
  const weatherCoupling = useOverviewStore((s) => s.weatherCoupling);
  const specialEvents = useOverviewStore((s) => s.specialEvents);
  const setAiSummary = useOverviewStore((s) => s.setAiSummary);

  // Auto-compute AI summary when indicators change (overview mode only)
  useEffect(() => {
    if (systemMode !== 'overview') return;

    const summary = computeAiSummary({
      portDigestion: portDigestion.xuwen,
      tidalEffect,
      corridorPressure: Object.values(corridorPressure),
      systemResilience,
      shutdownProbability,
      urbanHealth,
      pressureTransmission,
      weatherCoupling,
      specialEvents,
      inboundFlow: 12847,
      outboundFlow: 11235,
      violationCount: 356,
    });

    setAiSummary(summary);
  }, [
    systemMode,
    portDigestion,
    tidalEffect,
    corridorPressure,
    systemResilience,
    shutdownProbability,
    urbanHealth,
    pressureTransmission,
    weatherCoupling,
    specialEvents,
    setAiSummary,
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize TTS and startup broadcasts
  useEffect(() => {
    initTTS();

    // Daily/weekly broadcast after AI summary is computed (3s delay)
    const startupTimer = setTimeout(() => {
      if (systemMode === 'overview') {
        BroadcastScenarios.weeklyStartup();
        // dailyStartup checks localStorage internally, safe to always call
        setTimeout(() => BroadcastScenarios.dailyStartup(), 500);
      }
    }, 3000);

    return () => clearTimeout(startupTimer);
  }, []);

  // Alert broadcast (when activeAlert changes)
  const activeAlert = useOverviewStore((s) => s.activeAlert);
  useEffect(() => {
    if (activeAlert && systemMode === 'overview') {
      BroadcastScenarios.alertTriggered(activeAlert.content);
    }
  }, [activeAlert, systemMode]);

  // v2.0 Batch3: Predictive risk monitoring (runs every 15s in overview mode)
  const portDigestionForRisk = useOverviewStore((s) => s.portDigestion);
  const corridorPressureForRisk = useOverviewStore((s) => s.corridorPressure);
  const weatherCouplingForRisk = useOverviewStore((s) => s.weatherCoupling);
  const specialEventsForRisk = useOverviewStore((s) => s.specialEvents);
  const setActiveAlertForRisk = useOverviewStore((s) => s.setActiveAlert);
  const enterCommandModeForRisk = useCommandStore((s) => s.enterCommandMode);

  useEffect(() => {
    if (systemMode !== 'overview') return;

    const runPrediction = () => {
      const overviewState = useOverviewStore.getState();
      const portData = overviewState.portData.xuwen;
      const maxPressure = Math.max(
        ...Object.values(overviewState.corridorPressure).map((c) => c.pressure)
      );
      const hasAccident = overviewState.specialEvents.some(
        (e) => /事故/.test(e.type) && e.impactLevel === 'critical'
      );
      const holiday = overviewState.specialEvents.find((e) => e.isHoliday);

      const prediction = predictRisk({
        currentIndex: portData.congestionIndex,
        trend: portData.congestionIndex > 4 ? 'rising' : portData.congestionIndex > 2.5 ? 'stable' : 'falling',
        portBacklog: overviewState.portDigestion.xuwen.waitingVehicles,
        weatherSeverity: overviewState.weatherCoupling.overallScore,
        corridorPressureMax: maxPressure,
        hasAccident,
        isHoliday: !!holiday,
        holidayMultiplier: holiday?.baselineMultiplier ?? 1,
      });

      if (prediction.level === 'emergency') {
        // Auto-switch to command mode with precomputed data
        const engineSlice = {
          portDigestion: overviewState.portDigestion,
          tidalEffect: overviewState.tidalEffect,
          corridorPressure: overviewState.corridorPressure,
          weatherCoupling: overviewState.weatherCoupling,
          specialEvents: overviewState.specialEvents,
        };
        const causes = computeCauses(engineSlice);
        const strategies = recommendStrategies(causes, engineSlice);

        enterCommandModeForRisk(
          { title: '紧急自动切换', description: prediction.reason, priority: 'high', mode: 'command' },
          { riskPrediction: prediction, precomputedCauses: causes, precomputedStrategies: strategies, earlyEntry: true }
        );
      } else if (prediction.level === 'high') {
        // Show popup suggesting early command mode entry
        setActiveAlertForRisk({
          id: `risk-high-${Date.now()}`,
          type: 'predictive',
          title: '高风险预警',
          content: prediction.reason,
          factors: [
            { name: '港口积压', weight: overviewState.portDigestion.xuwen.waitingVehicles > 800 ? 60 : 30 },
            { name: '通道压力', weight: maxPressure > 85 ? 25 : 10 },
            { name: '天气影响', weight: overviewState.weatherCoupling.overallScore > 50 ? 15 : 5 },
          ],
          suggestion: `建议提前进入指挥模式，预计 ${prediction.timeToReach} 分钟后拥堵指数达 ${prediction.predictedIndex.toFixed(1)}（置信度 ${prediction.confidence}%）`,
          timestamp: Date.now(),
        });
      }
      // Low risk: the AiSummaryBar already shows yellow warning via riskForecast field
    };

    // Run once immediately, then every 15 seconds
    runPrediction();
    const interval = setInterval(runPrediction, 15000);
    return () => clearInterval(interval);
  }, [
    systemMode,
    portDigestionForRisk,
    corridorPressureForRisk,
    weatherCouplingForRisk,
    specialEventsForRisk,
    setActiveAlertForRisk,
    enterCommandModeForRisk,
  ]);

  // 感知设备数据
  const deviceData: DeviceData[] = [
    { name: '电子警察', count: 49, online: 48, offline: 1 },
    { name: '违停抓拍', count: 25, online: 24, offline: 1 },
    { name: '治安监控', count: 4, online: 4, offline: 0 },
    { name: '治安卡口', count: 31, online: 30, offline: 1 },
    { name: '超速抓拍', count: 4, online: 4, offline: 0 },
    { name: '信号灯控制', count: 8, online: 8, offline: 0 },
    { name: '信息发布屏', count: 2, online: 2, offline: 0 },
  ];

  // 徐闻出行数据
  const trafficData: TrafficData = {
    inbound: 19847,
    outbound: 15000,
    change: 12.3
  };

  // 交通违法数据
  const violationData: ViolationData[] = [
    { type: '超速行驶', count: 156, trend: -12 },
    { type: '违规停车', count: 89, trend: -8 },
    { type: '闯红灯', count: 45, trend: -15 },
    { type: '不按规定车道行驶', count: 67, trend: -5 },
    { type: '违反限行规定', count: 23, trend: 3 },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="bg-grid" />

        <Header time={time}>
          <ModeSwitcher />
        </Header>

        {systemMode === 'overview' && (
          <>
            {/* Full-screen map */}
            <div style={{
              position: 'absolute',
              top: 72,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}>
              <MapContainer />
            </div>

            {/* AI Summary Bar */}
            <AiSummaryBar />

            {/* v2.0 Phase 2: AI Alert Popup */}
            <AiAlertPopup />

            {/* v2.0 Phase 3: Virtual Assistant */}
            <VirtualAssistant />

            {/* Left Panel — 延伸到底部 */}
            <div style={{
              position: 'absolute',
              top: 80,
              left: 12,
              bottom: 8,
              width: 340,
              zIndex: 20,
              pointerEvents: 'auto',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <LeftPanel
                deviceData={deviceData}
                trafficData={trafficData}
                violationData={violationData}
              />
            </div>

            {/* Right Panel — 延伸到底部 */}
            <div style={{
              position: 'absolute',
              top: 80,
              right: 12,
              bottom: 8,
              width: 340,
              zIndex: 20,
              pointerEvents: 'auto',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <RightPanel />
            </div>

            {/* Bottom Charts — 叠在面板上方 */}
            <div style={{
              position: 'absolute',
              bottom: 8,
              left: 364,
              right: 364,
              height: 94,
              zIndex: 30,
              pointerEvents: 'auto',
            }}>
              <BottomChartsBar />
            </div>

            {/* Strait Transit Index */}
            <div style={{
              position: 'absolute',
              bottom: 110,
              right: 364,
              zIndex: 30,
              pointerEvents: 'auto',
            }}>
              <StraitTransitIndex />
            </div>

            {/* Development TTS test button */}
            {import.meta.env.DEV && (
              <button
                onClick={() => BroadcastScenarios.forceDailyStartup()}
                style={{
                  position: 'absolute',
                  bottom: 250,
                  right: 20,
                  padding: '8px 12px',
                  background: '#A855F7',
                  border: 'none',
                  borderRadius: 6,
                  color: '#FFFFFF',
                  fontSize: 12,
                  cursor: 'pointer',
                  zIndex: 200,
                }}
              >
                测试播报
              </button>
            )}
          </>
        )}

        {systemMode === 'port' && <PortMode />}
        {systemMode === 'command' && <CommandMode />}
        {/* v2.0: Emergency mode merged into Command mode */}
        {/* {systemMode === 'emergency' && <EmergencyMode />} */}
        {systemMode === 'analysis' && <AnalysisMode />}
        {systemMode === 'ai-analysis' && <AIAnalysisMode />}

        {/* Modals */}
        <CheckpointModal />
        <PoiDetailModal />
        <CongestionPredictionModal />
        <StrategyModal />
        <Modal id="resilience-info" title="交通系统韧性指标说明" width={520}>
          <ResilienceInfoModal />
        </Modal>
      </div>
    </div>
  );
}

export default App;
