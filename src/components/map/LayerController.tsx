import { useUIStore } from '../../stores/uiStore';
import type { SystemMode } from '../../stores/types';
import RoadCongestionLayer from './layers/RoadCongestionLayer';
import ShippingLaneLayer from './layers/ShippingLaneLayer';

const LAYER_VISIBILITY: Record<SystemMode, string[]> = {
  overview: ['roadCongestion', 'shippingLane'],
  port: ['shippingLane', 'roadCongestion'],
  command: ['roadCongestion'],
  emergency: ['roadCongestion'],
  analysis: ['roadCongestion'],
  'ai-decision': ['roadCongestion'],
};

export default function LayerController() {
  const systemMode = useUIStore((s) => s.systemMode);
  const visible = LAYER_VISIBILITY[systemMode] || LAYER_VISIBILITY.overview;

  return (
    <>
      {visible.includes('roadCongestion') && <RoadCongestionLayer />}
      {visible.includes('shippingLane') && <ShippingLaneLayer />}
    </>
  );
}
