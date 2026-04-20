import { useState } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import type { SpecialVehicleDetail } from '../../stores/emergencyStore';
import { X, Snowflake, AlertTriangle, Fuel } from 'lucide-react';

const alertColors = {
  normal: '#2ED573',
  yellow: '#F5A623',
  orange: '#FF6B35',
  red: '#FF4757',
} as const;

const alertLabels = {
  normal: '正常',
  yellow: '黄色预警',
  orange: '橙色预警',
  red: '红色预警',
} as const;

const typeLabels = {
  cold_chain: '冷链车',
  hazardous: '危化品车',
  lithium_battery: '锂电池车',
} as const;

const typeColors = {
  cold_chain: '#00D0E9',
  hazardous: '#FF4757',
  lithium_battery: '#F5A623',
} as const;

function VehicleCard({ vehicle }: { vehicle: SpecialVehicleDetail }) {
  const Icon = vehicle.type === 'cold_chain' ? Snowflake : AlertTriangle;
  const typeColor = typeColors[vehicle.type];
  const alertColor = alertColors[vehicle.alertLevel];

  return (
    <div style={{
      padding: 12, borderRadius: 6, background: 'rgba(13,27,42,0.72)',
      border: `1px solid ${alertColor}33`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color={typeColor} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{vehicle.plateNumber}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{typeLabels[vehicle.type]}</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, padding: '3px 8px', borderRadius: 4,
          background: `${alertColor}22`, color: alertColor, fontWeight: 600,
        }}>
          {alertLabels[vehicle.alertLevel]}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
        <div>
          <span style={{ color: '#64748B' }}>滞留时长: </span>
          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{vehicle.strandedHours}h</span>
        </div>
        {vehicle.cargoType && (
          <div>
            <span style={{ color: '#64748B' }}>货物: </span>
            <span style={{ color: '#E2E8F0' }}>{vehicle.cargoType}</span>
          </div>
        )}
        {vehicle.fuelLevel !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Fuel size={12} color={vehicle.fuelLevel < 30 ? '#FF4757' : '#94A3B8'} />
            <span style={{ color: '#64748B' }}>燃油: </span>
            <span style={{ color: vehicle.fuelLevel < 30 ? '#FF4757' : '#E2E8F0', fontWeight: 600 }}>
              {vehicle.fuelLevel}%
            </span>
          </div>
        )}
        {vehicle.driverPhone && (
          <div>
            <span style={{ color: '#64748B' }}>司机: </span>
            <span style={{ color: '#00D0E9' }}>{vehicle.driverPhone}</span>
          </div>
        )}
      </div>

      {vehicle.notes && (
        <div style={{
          marginTop: 8, padding: 6, borderRadius: 4,
          background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
          fontSize: 10, color: '#FF4757',
        }}>
          ⚠️ {vehicle.notes}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 9, color: '#64748B' }}>
        滞留起始: {vehicle.strandedSince}
      </div>
    </div>
  );
}

export default function SpecialVehicleDetailModal({ onClose }: { onClose: () => void }) {
  const specialVehicles = useEmergencyStore((s) => s.emergencyState.specialVehicles);
  const [filter, setFilter] = useState<'all' | 'cold_chain' | 'hazardous'>('all');

  const filtered = filter === 'all'
    ? specialVehicles
    : specialVehicles.filter((v) => v.type === filter);

  const coldCount = specialVehicles.filter((v) => v.type === 'cold_chain').length;
  const hazCount = specialVehicles.filter((v) => v.type === 'hazardous').length;
  const alertCount = specialVehicles.filter((v) => v.alertLevel !== 'normal').length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 680, maxHeight: '80vh', background: '#0D1B2A',
          border: '1px solid rgba(0,208,233,0.3)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* PLACEHOLDER_HEADER */}
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>特殊车辆明细</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              冷链车 {coldCount} 辆 · 危化品车 {hazCount} 辆 · 预警 {alertCount} 辆
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        {/* PLACEHOLDER_BODY */}

        {/* Filter tabs */}
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, flexShrink: 0 }}>
          {([['all', '全部'], ['cold_chain', '冷链车'], ['hazardous', '危化品车']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
                background: filter === key ? 'rgba(0,208,233,0.15)' : 'transparent',
                border: `1px solid ${filter === key ? '#00D0E9' : 'rgba(255,255,255,0.1)'}`,
                color: filter === key ? '#00D0E9' : '#94A3B8',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vehicle list */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 28px 20px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
