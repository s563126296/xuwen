import { useState } from 'react';
import { Users } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import CollapsibleCard from '../common/CollapsibleCard';
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

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      警力 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{personnelByStatus.working}/{personnelByStatus.total}</span> · 车辆 <span style={{ color: '#F5A623', fontWeight: 600 }}>{vehiclesByStatus.working}/{vehiclesByStatus.total}</span> · 设备 <span style={{ color: '#2ED573', fontWeight: 600 }}>{equipmentByStatus.working}/{equipmentByStatus.total}</span>
    </div>
  );

  return (
    <>
      <CollapsibleCard
        title="资源调度状态"
        icon={<Users size={12} style={{ color: '#4da6ff' }} />}
        summary={summary}
        defaultExpanded={true}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            onClick={(e) => { e.stopPropagation(); setDetailType('personnel'); }}
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
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>人员</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9', fontFamily: 'DIN, sans-serif' }}>
              {personnelByStatus.working}/{personnelByStatus.total}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {personnelByStatus.standby} 人待命
            </div>
          </div>

          <div
            onClick={(e) => { e.stopPropagation(); setDetailType('vehicle'); }}
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
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>车辆</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F5A623', fontFamily: 'DIN, sans-serif' }}>
              {vehiclesByStatus.working}/{vehiclesByStatus.total}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              {vehiclesByStatus.standby} 辆待命
            </div>
          </div>

          <div
            onClick={(e) => { e.stopPropagation(); setDetailType('equipment'); }}
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
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>设备</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2ED573', fontFamily: 'DIN, sans-serif' }}>
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
      </CollapsibleCard>

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
