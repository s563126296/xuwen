import { X, Users, Truck, Wrench } from 'lucide-react';
import type { FieldResource } from '../../store/dashboardStore';

const statusColor = {
  standby: '#94A3B8',
  dispatched: '#F5A623',
  arrived: '#00D0E9',
  working: '#2ED573',
  offline: '#64748B',
} as const;

const statusLabel = {
  standby: '待命',
  dispatched: '派出',
  arrived: '到场',
  working: '工作中',
  offline: '离线',
} as const;

const typeLabels = {
  personnel: '人员',
  vehicle: '车辆',
  equipment: '设备',
} as const;

const typeIcons = {
  personnel: Users,
  vehicle: Truck,
  equipment: Wrench,
} as const;

const typeColors = {
  personnel: '#00D0E9',
  vehicle: '#F5A623',
  equipment: '#2ED573',
} as const;

interface Props {
  type: 'personnel' | 'vehicle' | 'equipment';
  resources: FieldResource[];
  onClose: () => void;
}

export default function ResourceDetailModal({ type, resources, onClose }: Props) {
  const Icon = typeIcons[type];
  const typeColor = typeColors[type];
  const typeLabel = typeLabels[type];

  const byStatus = {
    working: resources.filter((r) => r.status === 'working' || r.status === 'dispatched').length,
    standby: resources.filter((r) => r.status === 'standby').length,
    total: resources.length,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 680, maxHeight: '80vh', background: '#0D1B2A',
          border: `1px solid ${typeColor}55`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={20} color={typeColor} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>{typeLabel}调度详情</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                工作中 {byStatus.working} · 待命 {byStatus.standby} · 总计 {byStatus.total}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Resource list */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 28px 20px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resources.map((resource) => (
              <div
                key={resource.id}
                style={{
                  padding: 12, borderRadius: 6, background: 'rgba(13,27,42,0.5)',
                  border: `1px solid ${statusColor[resource.status]}33`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{resource.name}</div>
                  <div
                    style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      background: `${statusColor[resource.status]}22`,
                      color: statusColor[resource.status], fontWeight: 600,
                    }}
                  >
                    {statusLabel[resource.status]}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                  {resource.department} · {resource.detail}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
                  更新: {resource.lastUpdate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
