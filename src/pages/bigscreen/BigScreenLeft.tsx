import PortDigestionPanel from './panels/PortDigestionPanel';
import CorridorPressurePanel from './panels/CorridorPressurePanel';
import TidalEffectPanel from './panels/TidalEffectPanel';

export default function BigScreenLeft() {
  return (
    <div className="bs-left">
      <PortDigestionPanel />
      <CorridorPressurePanel />
      <TidalEffectPanel />
    </div>
  );
}
