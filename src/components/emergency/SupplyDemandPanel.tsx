import { useDashboardStore } from '../../store/dashboardStore';
import { estimateSupplyDemand } from '../../utils/emergencyEngine';

export default function SupplyDemandPanel() {
  const stranded = useDashboardStore((s) => s.emergencyState.forecast.currentStrandedVehicles);
  const { strandedPeople, boxedMeals, waterBoxes } = estimateSupplyDemand(stranded);

  return (
    <div className="card" style={{ padding: 14, minHeight: 190 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>C. 物资需求估算</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>滞留人数</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E2E8F0' }}>{strandedPeople}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>盒饭需求</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{boxedMeals}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>饮水需求</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>{waterBoxes} 箱</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>储备充足率</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FF6B35' }}>68%</div>
        </div>
      </div>
    </div>
  );
}
