import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useUIStore } from '../stores';
import HourlyChart from './HourlyChart';
import PressurePredictionChart from './overview/PressurePredictionChart';
import StraitTransitIndex from './overview/StraitTransitIndex';
import MapHeader, { type DeviceTypeId } from './center/MapHeader';
import MapLegend from './center/MapLegend';
import MapStats from './center/MapStats';
import RoadNetwork from './center/RoadNetwork';
import DeviceMarkers from './center/DeviceMarkers';
import DroneOverlay from './center/DroneOverlay';

interface CenterPanelProps {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

// Device types and their colors
const deviceTypes = [
  { id: 'all', label: '全部', color: '#00D0E9' },
  { id: 'police', label: '电子警察', color: '#DC2626' },
  { id: 'parking', label: '违停抓拍', color: '#F5A623' },
  { id: 'checkpoint', label: '治安卡口', color: '#00D0E9' },
  { id: 'speed', label: '超速抓拍', color: '#A855F7' },
  { id: 'signal', label: '信号灯', color: '#2ED573' },
  { id: 'screen', label: '发布屏', color: '#3B82F6' },
] as const;

// Mock device markers
const deviceMarkers = [
  { cx: 120, cy: 100, type: 'checkpoint', name: '卡口A1', online: true, labelDir: 'top' as const },
  { cx: 680, cy: 100, type: 'checkpoint', name: '卡口C3', online: true, labelDir: 'top' as const },
  { cx: 350, cy: 170, type: 'checkpoint', name: '卡口S376', online: true, labelDir: 'bottom' as const },
  { cx: 550, cy: 170, type: 'checkpoint', name: '港口卡口', online: true, labelDir: 'right' as const },
  { cx: 60, cy: 100, type: 'police', name: '警察01', online: true, labelDir: 'bottom' as const },
  { cx: 380, cy: 100, type: 'police', name: '警察02', online: true, labelDir: 'top' as const },
  { cx: 550, cy: 130, type: 'police', name: '警察03', online: false, labelDir: 'right' as const },
  { cx: 260, cy: 100, type: 'parking', name: '违停01', online: true, labelDir: 'bottom' as const },
  { cx: 460, cy: 170, type: 'parking', name: '违停02', online: true, labelDir: 'top' as const },
  { cx: 300, cy: 65, type: 'speed', name: '测速01', online: true, labelDir: 'right' as const },
  { cx: 710, cy: 100, type: 'speed', name: '测速02', online: true, labelDir: 'bottom' as const },
  { cx: 300, cy: 100, type: 'signal', name: '信号灯01', online: true, labelDir: 'top' as const },
  { cx: 550, cy: 100, type: 'signal', name: '信号灯02', online: true, labelDir: 'bottom' as const },
  { cx: 300, cy: 170, type: 'screen', name: '发布屏01', online: true, labelDir: 'bottom' as const },
] as const;

export default function CenterPanel({ leftCollapsed, rightCollapsed, onToggleLeft, onToggleRight }: CenterPanelProps) {
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setSelectedDeviceType = useUIStore((s) => s.setSelectedDeviceType);
  const [activeFilter, setActiveFilter] = useState<DeviceTypeId>('all');
  const [dronesActive, setDronesActive] = useState(false);

  const handleMarkerClick = (_name: string, type: string) => {
    setSelectedDeviceType(type);
    setActiveModal('checkpoint');
  };

  const filteredMarkers = activeFilter === 'all'
    ? deviceMarkers
    : deviceMarkers.filter(m => m.type === activeFilter);

  const getDeviceColor = (type: string) => deviceTypes.find(d => d.id === type)?.color ?? '#A0A8B4';

  return (
    <div className="panel-center" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* GIS地图 */}
      <div className="module-card full-height animate-in" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <MapHeader
          leftCollapsed={leftCollapsed}
          rightCollapsed={rightCollapsed}
          onToggleLeft={onToggleLeft}
          onToggleRight={onToggleRight}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          dronesActive={dronesActive}
          onDronesToggle={() => setDronesActive(!dronesActive)}
        />

        <div style={{
          flex: 1,
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
          border: '1px solid rgba(0, 208, 233, 0.1)'
        }}>
          <RoadNetwork />
          <DeviceMarkers
            markers={filteredMarkers}
            onMarkerClick={handleMarkerClick}
            getDeviceColor={getDeviceColor}
          />
          {dronesActive && <DroneOverlay onMarkerClick={handleMarkerClick} />}
          <MapLegend />
          <MapStats />
          <StraitTransitIndex />
        </div>

        <style>{`
          .panel-center {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
        `}</style>
      </div>

      {/* 底部图表条：压力预测 + 车流趋势 并排 */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <PressurePredictionChart compact />
        </div>
        <div className="module-card animate-in" style={{ flex: 1, animationDelay: '0.2s' }}>
          <div className="module-header">
            <span className="module-title">24h车流趋势</span>
            <div className="module-icon">
              <TrendingUp size={14} />
            </div>
          </div>
          <div style={{ height: 80 }}>
            <HourlyChart />
          </div>
        </div>
      </div>
    </div>
  );
}
