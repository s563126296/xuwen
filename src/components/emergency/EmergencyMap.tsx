import { useEmergencyMap } from '../../hooks/useEmergencyMap';
import SemanticOperationsMap from '../map/SemanticOperationsMap';

export default function EmergencyMap() {
  const { corridors, nodes, flows, hazards, legend, subtitle, statusLabel, statusTone } = useEmergencyMap();

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <SemanticOperationsMap
        mode="emergency"
        title=""
        subtitle={subtitle}
        statusLabel={statusLabel}
        statusTone={statusTone}
        corridors={corridors}
        nodes={nodes}
        flows={flows}
        hazards={hazards}
        legend={legend}
      />
    </div>
  );
}
