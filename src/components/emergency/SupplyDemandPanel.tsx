import { useDashboardStore } from '../../store/dashboardStore';
import { estimateSupplyDemand } from '../../utils/emergencyEngine';

const supplyInventory = {
  boxedMeals: { available: 8000, label: '盒饭' },
  water: { available: 1000, label: '饮用水(箱)' },
};

function getBarColor(ratio: number): string {
  if (ratio >= 0.8) return '#2ED573';
  if (ratio >= 0.5) return '#F5A623';
  return '#FF4757';
}

export default function SupplyDemandPanel() {
  const stranded = useDashboardStore((s) => s.emergencyState.forecast.currentStrandedVehicles);
  const { strandedPeople, boxedMeals, waterBoxes } = estimateSupplyDemand(stranded);

  const items = [
    { key: 'boxedMeals', label: supplyInventory.boxedMeals.label, available: supplyInventory.boxedMeals.available, demand: boxedMeals },
    { key: 'water', label: supplyInventory.water.label, available: supplyInventory.water.available, demand: waterBoxes },
  ];

  return (
    <div className="card" style={{ padding: 14, minHeight: 190 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>C. 物资需求估算</div>
      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>滞留人数：{strandedPeople} 人</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => {
          const ratio = item.demand > 0 ? Math.min(item.available / item.demand, 1) : 1;
          const color = getBarColor(ratio);
          const pct = Math.round(ratio * 100);
          return (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>{item.label}</span>
                <span style={{ color: '#E2E8F0' }}>
                  <span style={{ color }}>{item.available.toLocaleString()}</span>
                  <span style={{ color: '#64748B' }}> / {item.demand.toLocaleString()} ({pct}%)</span>
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
