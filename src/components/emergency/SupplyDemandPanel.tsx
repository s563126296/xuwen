import { useDashboardStore } from '../../store/dashboardStore';

// 物资库存（mock，待民政局确认后替换真实数据）
const supplyInventory = [
  { key: 'meals', label: '盒饭', unit: '份', available: 8000, perPersonPerDay: 3 },
  { key: 'water', label: '饮用水', unit: '箱', available: 1000, perPersonPerDay: 0.15 },
  { key: 'raincoat', label: '雨衣', unit: '件', available: 2000, perPersonPerDay: 0.5 },
  { key: 'blanket', label: '毛毯', unit: '条', available: 800, perPersonPerDay: 0.3 },
  { key: 'powerbank', label: '充电宝', unit: '个', available: 500, perPersonPerDay: 0.2 },
  { key: 'medicine', label: '应急药品包', unit: '份', available: 300, perPersonPerDay: 0.05 },
  { key: 'toilet', label: '移动厕所', unit: '座', available: 20, fixedDemand: 15 },
  { key: 'tent', label: '应急帐篷', unit: '顶', available: 30, fixedDemand: 20 },
];

function getBarColor(ratio: number): string {
  if (ratio >= 0.8) return '#2ED573';
  if (ratio >= 0.5) return '#F5A623';
  return '#FF4757';
}

export default function SupplyDemandPanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);
  const strandedPeople = Math.round(forecast.currentStrandedVehicles * 2);
  const shutdownDays = Math.max(1, Math.ceil(forecast.estimatedShutdownHours / 24));

  const items = supplyInventory.map((item) => {
    const demand = item.fixedDemand
      ? item.fixedDemand
      : Math.round(strandedPeople * (item.perPersonPerDay ?? 0) * shutdownDays * 1.2);
    const ratio = demand > 0 ? Math.min(item.available / demand, 1) : 1;
    return { ...item, demand, ratio };
  });

  const overallRatio = items.length > 0
    ? items.reduce((sum, i) => sum + i.ratio, 0) / items.length
    : 1;

  return (
    <div className="card" style={{ padding: 14, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>C. 物资需求估算</div>
        <div style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 3,
          background: `${getBarColor(overallRatio)}22`,
          color: getBarColor(overallRatio), fontWeight: 600,
        }}>
          综合充足率 {Math.round(overallRatio * 100)}%
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
        滞留 {strandedPeople} 人 · 预计 {shutdownDays} 天
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => {
          const pct = Math.round(item.ratio * 100);
          const color = getBarColor(item.ratio);
          return (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: '#94A3B8' }}>{item.label}</span>
                <span style={{ color: '#E2E8F0' }}>
                  <span style={{ color }}>{item.available.toLocaleString()}</span>
                  <span style={{ color: '#64748B' }}> / {item.demand.toLocaleString()}{item.unit} ({pct}%)</span>
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
