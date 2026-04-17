import { useEffect, useState, useRef } from 'react';
import BigScreen from './pages/BigScreen';
import Header from './components/Header';
import AiSummaryBar from './components/overview/AiSummaryBar';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import ModeSwitcher from './components/ModeSwitcher';
import CommandMode from './components/command/CommandMode';
import CheckpointModal from './components/CheckpointModal';
import CongestionPredictionModal from './components/CongestionPredictionModal';
import StrategyModal from './components/StrategyModal';
import ResilienceInfoModal from './components/overview/ResilienceInfoModal';
import Modal from './components/Modal';
import { useDashboardStore } from './store/dashboardStore';
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const { systemMode } = useDashboardStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 动态缩放计算
  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dashboardWidth = 1920;
      const dashboardHeight = 1080;

      // 计算缩放比例（保证完整显示）
      const scaleX = viewportWidth / dashboardWidth;
      const scaleY = viewportHeight / dashboardHeight;
      const newScale = Math.min(scaleX, scaleY); // 支持4K大屏放大

      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <div className="dashboard-wrapper" ref={wrapperRef}>
      <div
        className="dashboard"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div className="bg-grid" />

        <Header time={time}>
          <ModeSwitcher />
        </Header>

        {systemMode === 'overview' && <AiSummaryBar />}

        {systemMode === 'overview' && (
          <div className="main-content">
            <div style={{
              display: 'flex',
              gap: 12,
              width: '100%',
              height: '100%',
              transition: 'all 0.3s ease',
            }}>
              {!leftCollapsed && (
                <LeftPanel
                  deviceData={deviceData}
                  trafficData={trafficData}
                  violationData={violationData}
                />
              )}
              <CenterPanel
                leftCollapsed={leftCollapsed}
                rightCollapsed={rightCollapsed}
                onToggleLeft={() => setLeftCollapsed(!leftCollapsed)}
                onToggleRight={() => setRightCollapsed(!rightCollapsed)}
              />
              {!rightCollapsed && <RightPanel />}
            </div>
          </div>
        )}

        {systemMode === 'command' && <CommandMode />}

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
