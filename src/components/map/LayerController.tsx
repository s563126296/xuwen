import { useUIStore } from '../../stores/uiStore';
import type { SystemMode } from '../../stores/types';
import RoadCongestionLayer from './layers/RoadCongestionLayer';
import TrafficHeatmapLayer from './layers/TrafficHeatmapLayer';
import VesselLayer from './layers/VesselLayer';
import ShippingLaneLayer from './layers/ShippingLaneLayer';
import EventMarkerLayer from './layers/EventMarkerLayer';

const LAYER_VISIBILITY: Record<SystemMode, string[]> = {
  overview: ['roadCongestion', 'vessel', 'shippingLane', 'eventMarker', 'heatmap'],
  port: ['shippingLane', 'vessel', 'roadCongestion', 'eventMarker', 'heatmap'],
  command: ['roadCongestion', 'eventMarker', 'heatmap'],
  emergency: ['roadCongestion', 'eventMarker', 'heatmap'],
  analysis: ['roadCongestion', 'heatmap', 'eventMarker'],
  'ai-decision': ['roadCongestion', 'heatmap', 'eventMarker'],
};

export default function LayerController() {
  const systemMode = useUIStore((s) => s.systemMode);
  const visible = LAYER_VISIBILITY[systemMode] || LAYER_VISIBILITY.overview;

  return (
    <>
      {visible.includes('roadCongestion') && <RoadCongestionLayer />}
      {visible.includes('heatmap') && <TrafficHeatmapLayer />}
      {visible.includes('vessel') && <VesselLayer />}
      {visible.includes('shippingLane') && <ShippingLaneLayer />}
      {visible.includes('eventMarker') && <EventMarkerLayer />}
    </>
  );
}
