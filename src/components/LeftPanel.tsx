import CollapsibleStatsBar from './overview/CollapsibleStatsBar';
import PortDigestionCard from './overview/PortDigestionCard';
import TidalEffectCard from './overview/TidalEffectCard';
import CorridorPressureCard from './overview/CorridorPressureCard';
import UrbanHealthCard from './overview/UrbanHealthCard';

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

interface Props {
  deviceData: DeviceData[];
  trafficData: TrafficData;
  violationData: ViolationData[];
}

export default function LeftPanel({ deviceData, trafficData, violationData }: Props) {
  return (
    <div className="panel-left" style={{ gap: 12 }}>
      <CollapsibleStatsBar
        deviceData={deviceData}
        trafficData={trafficData}
        violationData={violationData}
      />
      <div style={{ animationDelay: '0.1s' }} className="animate-in">
        <PortDigestionCard />
      </div>
      <div style={{ animationDelay: '0.15s' }} className="animate-in">
        <TidalEffectCard />
      </div>
      <div style={{ animationDelay: '0.2s' }} className="animate-in">
        <CorridorPressureCard />
      </div>
      <div style={{ animationDelay: '0.25s' }} className="animate-in">
        <UrbanHealthCard />
      </div>
    </div>
  );
}
