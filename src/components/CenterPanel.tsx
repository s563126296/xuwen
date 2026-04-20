import { useUIStore } from '../stores';
import HourlyChart from './HourlyChart';
import PressurePredictionChart from './overview/PressurePredictionChart';
import StraitTransitIndex from './overview/StraitTransitIndex';
import MapContainer from './map/MapContainer';

interface CenterPanelProps {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function CenterPanel(_props: CenterPanelProps) {
  const systemMode = useUIStore((s) => s.systemMode);

  // Only show map in overview mode
  if (systemMode !== 'overview') {
    return null;
  }

  return (
    <div className="panel-center" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div className="module-card full-height animate-in" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1,
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}>
          <MapContainer />
          <StraitTransitIndex />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <PressurePredictionChart compact />
        </div>
        <div style={{ flex: 1 }}>
          <HourlyChart />
        </div>
      </div>
    </div>
  );
}
