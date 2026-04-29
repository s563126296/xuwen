import { useUIStore } from '../../stores/uiStore';
import type { SystemMode } from '../../stores/types';
import RoadCongestionLayer from './layers/RoadCongestionLayer';
import ShippingLaneLayer from './layers/ShippingLaneLayer';
import ElectronicPoliceLayer from './layers/devices/ElectronicPoliceLayer';
import ParkingViolationLayer from './layers/devices/ParkingViolationLayer';
import SpeedCameraLayer from './layers/devices/SpeedCameraLayer';
import CheckpointGateLayer from './layers/devices/CheckpointGateLayer';
import TrafficLightLayer from './layers/devices/TrafficLightLayer';
import InfoScreenLayer from './layers/devices/InfoScreenLayer';
import DroneLayer from './layers/devices/DroneLayer';
import SecurityCameraLayer from './layers/devices/SecurityCameraLayer';
import PortLabelAndBuildingLayer from './layers/PortLabelAndBuildingLayer';
import RoadInfoLayer from './layers/RoadInfoLayer';
import FerryLayer from './layers/FerryLayer';

const LAYER_VISIBILITY: Record<SystemMode, string[]> = {
  overview: [
    'roadCongestion',
    'shippingLane',
    'ferry',
    'portLabelAndBuilding',
    'roadInfo',
    'electronicPolice',
    'parkingViolation',
    'speedCamera',
    'securityCamera',
    'checkpointGate',
    'trafficLight',
    'infoScreen',
    'drone',
  ],
  port: ['shippingLane', 'ferry', 'portLabelAndBuilding', 'roadCongestion', 'securityCamera', 'checkpointGate', 'infoScreen'],
  command: [
    'roadCongestion',
    'roadInfo',
    'electronicPolice',
    'parkingViolation',
    'speedCamera',
    'securityCamera',
    'checkpointGate',
    'trafficLight',
    'infoScreen',
    'drone',
  ],
  emergency: ['roadCongestion', 'roadInfo', 'electronicPolice', 'securityCamera', 'checkpointGate', 'trafficLight', 'drone'],
  analysis: ['roadCongestion', 'roadInfo', 'electronicPolice', 'speedCamera', 'securityCamera', 'checkpointGate'],
  'ai-analysis': ['roadCongestion', 'roadInfo', 'electronicPolice', 'securityCamera', 'checkpointGate', 'trafficLight'],
  'ai-strategy': ['roadCongestion', 'roadInfo', 'electronicPolice', 'securityCamera', 'checkpointGate', 'trafficLight'],
};

export default function LayerController() {
  const systemMode = useUIStore((s) => s.systemMode);
  const deviceFilter = useUIStore((s) => s.deviceFilter);
  const visible = LAYER_VISIBILITY[systemMode] || LAYER_VISIBILITY.overview;

  // Device layer filtering logic
  const shouldShowDevice = (deviceKey: string) => {
    if (!visible.includes(deviceKey)) return false;
    if (!deviceFilter) return true; // No filter, show all
    return deviceFilter === deviceKey; // Only show filtered device
  };

  return (
    <>
      {/* POI layer - always mounted to avoid remount issues */}
      <PortLabelAndBuildingLayer visible={visible.includes('portLabelAndBuilding')} />

      {/* Base layers (always respect systemMode) */}
      {visible.includes('roadCongestion') && <RoadCongestionLayer />}
      {visible.includes('shippingLane') && <ShippingLaneLayer />}
      {visible.includes('ferry') && <FerryLayer />}
      {visible.includes('roadInfo') && <RoadInfoLayer />}

      {/* Device layers (respect both systemMode and deviceFilter) */}
      {shouldShowDevice('electronicPolice') && <ElectronicPoliceLayer />}
      {shouldShowDevice('parkingViolation') && <ParkingViolationLayer />}
      {shouldShowDevice('speedCamera') && <SpeedCameraLayer />}
      {shouldShowDevice('securityCamera') && <SecurityCameraLayer />}
      {shouldShowDevice('checkpointGate') && <CheckpointGateLayer />}
      {shouldShowDevice('trafficLight') && <TrafficLightLayer />}
      {shouldShowDevice('infoScreen') && <InfoScreenLayer />}
      {shouldShowDevice('drone') && <DroneLayer />}
    </>
  );
}
