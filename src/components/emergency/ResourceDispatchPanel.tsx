import { useState } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { Users, Truck, Wrench } from 'lucide-react';
import ResourceDetailModal from './ResourceDetailModal';

export default function ResourceDispatchPanel() {
  const fieldResources = useEmergencyStore((s) => s.emergencyState.fieldResources);
  const [detailType, setDetailType] = useState<'personnel' | 'vehicle' | 'equipment' | null>(null);

  const personnel = fieldResources.filter((r) => r.type === 'personnel');
  const vehicles = fieldResources.filter((r) => r.type === 'vehicle');
  const equipment = fieldResources.filter((r) => r.type === 'equipment');

  const personnelByStatus = {
    working: personnel.filter((p) => p.status === 'working').length,
    standby: personnel.filter((p) => p.status === 'standby').length,
    total: personnel.length,
  };

  const vehiclesByStatus = {
    working: vehicles.filter((v) => v.status === 'working' || v.status === 'dispatched').length,
    standby: vehicles.filter((v) => v.status === 'standby').length,
    total: vehicles.length,
  };

  const equipmentByStatus = {
    working: equipment.filter((e) => e.status === 'working').length,
    standby: equipment.filter((e) => e.status === 'standby').length,
    total: equipment.length,
  };

  return (
    <>
      <div className="card" style={{ padding: 14, flex: '25 0 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12, flexShrink: 0 }}>资源调度状态</div>

        {/* Summary cards - now clickable */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <div
            onClick={() => setDetailType('personnel')}
            style={{
              flex: 1, padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)',
              border: '1px solid rgba(0,208,233,0.2)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.9)';
              e.currentTarget.style.borderColor = 'rgba(0,208,233,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.72)';
              e.currentTarget.style.borderColor = 'rgba(0,208,233,0.2)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Users size={14} color="#00D0E9" />
              <span style={{ fontSize: 11, color: '#94A3B8' }}>人员</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9' }}>
              {personnelByStatus.working}/{personnelByStatus.total}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {personnelByStatus.standby} 人待命
            </div>
          </div>

          <div
            onClick={() => setDetailType('vehicle')}
            style={{
              flex: 1, padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)',
              border: '1px solid rgba(245,166,35,0.2)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.9)';
              e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.72)';
              e.currentTarget.style.borderColor = 'rgba(245,166,35,0.2)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Truck size={14} color="#F5A623" />
              <span style={{ fontSize: 11, color: '#94A3B8' }}>车辆</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F5A623' }}>
              {vehiclesByStatus.working}/{vehiclesByStatus.total}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {vehiclesByStatus.standby} 辆待命
            </div>
          </div>

          <div
            onClick={() => setDetailType('equipment')}
            style={{
              flex: 1, padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)',
              border: '1px solid rgba(46,213,115,0.2)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.9)';
              e.currentTarget.style.borderColor = 'rgba(46,213,115,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(13,27,42,0.72)';
              e.currentTarget.style.borderColor = 'rgba(46,213,115,0.2)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Wrench size={14} color="#2ED573" />
              <span style={{ fontSize: 11, color: '#94A3B8' }}>设备</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2ED573' }}>
              {equipmentByStatus.working}/{equipmentByStatus.total}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {equipmentByStatus.standby} 台待命
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 10, color: '#64748B', textAlign: 'center' }}>
          点击卡片查看详细信息
        </div>
      </div>

      {detailType && (
        <ResourceDetailModal
          type={detailType}
          resources={fieldResources.filter((r) => r.type === detailType)}
          onClose={() => setDetailType(null)}
        />
      )}
    </>
  );
}
