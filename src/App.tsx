import { useEffect, useState } from 'react';
import BigScreen from './pages/BigScreen';
import Header from './components/Header';
import AiSummaryBar from './components/overview/AiSummaryBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import ModeSwitcher from './components/ModeSwitcher';
import CommandMode from './components/command/CommandMode';
import EmergencyMode from './components/emergency/EmergencyMode';
import AnalysisMode from './components/analysis/AnalysisMode';
import AIDecisionMode from './components/ai-decision/AIDecisionMode';
import CheckpointModal from './components/CheckpointModal';
import CongestionPredictionModal from './components/CongestionPredictionModal';
import StrategyModal from './components/StrategyModal';
import ResilienceInfoModal from './components/overview/ResilienceInfoModal';
import Modal from './components/Modal';
import MapContainer from './components/map/MapContainer';
import StraitTransitIndex from './components/overview/StraitTransitIndex';
import PressurePredictionChart from './components/overview/PressurePredictionChart';
import HourlyChart from './components/HourlyChart';
import { useUIStore, useOverviewStore } from './stores';
import { computeAiSummary } from './utils/aiSummaryEngine';
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

  // 感知设备数据
  const deviceData: DeviceData[] = [
    { name: '电子警察', count: 49, online: 48, offline: 1 },
    { name: '违停抓拍', count: 25, online: 24, offline: 1 },
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
      <div
        className="dashboard"
      >
        <div className="bg-grid" />

        <Header time={time}>
          <ModeSwitcher />
        </Header>

        {systemMode === 'overview' && <AiSummaryBar />}

        {systemMode === 'overview' && (
          <>
            {/* Full-screen map layer */}
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

            {/* Floating panels overlay */}
            <div style={{
              position: 'absolute',
              top: 88,
              left: 16,
              right: 16,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '340px 1fr 340px',
              gridTemplateRows: '1fr auto',
              gap: 12,
              zIndex: 20,
              pointerEvents: 'none',
            }}>
              {/* Left panels */}
              <div style={{ pointerEvents: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
                <LeftPanel
                  deviceData={deviceData}
                  trafficData={trafficData}
                  violationData={violationData}
                />
              </div>

              {/* Center - transparent, map shows through */}
              <div style={{ pointerEvents: 'none' }} />

              {/* Right panels */}
              <div style={{ pointerEvents: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
                <RightPanel />
              </div>

              {/* Bottom charts - center, spanning middle column */}
              <div style={{
                gridColumn: '2 / 3',
                gridRow: '2 / 3',
                display: 'flex',
                gap: 12,
                pointerEvents: 'auto',
                paddingBottom: 12,
              }}>
                <div className="module-card" style={{ flex: 1, padding: 10 }}>
                  <div style={{ height: 70 }}>
                    <PressurePredictionChart compact />
                  </div>
                </div>
                <div className="module-card" style={{ flex: 1, padding: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontFamily: 'var(--font-label, Rajdhani)' }}>24h车流趋势</div>
                  <div style={{ height: 56 }}>
                    <HourlyChart />
                  </div>
                </div>
              </div>
            </div>

            {/* Strait Transit Index - bottom right, above bottom charts */}
            <div style={{
              position: 'absolute',
              bottom: 90,
              right: 370,
              zIndex: 25,
              pointerEvents: 'auto',
            }}>
              <StraitTransitIndex />
            </div>
          </>
        )}

        {systemMode === 'command' && <CommandMode />}
        {systemMode === 'emergency' && <EmergencyMode />}
        {systemMode === 'analysis' && <AnalysisMode />}
        {systemMode === 'ai-decision' && <AIDecisionMode />}

        {/* Modals */}
        <CheckpointModal />
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
