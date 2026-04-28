import { Truck, Package, ClipboardList } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

const statusColors: Record<string, string> = {
  normal: '#2ED573',
  warning: '#F5A623',
  critical: '#FF4757',
};

const taskStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待接收', color: '#94A3B8' },
  received: { label: '已接收', color: '#F5A623' },
  executing: { label: '执行中', color: '#00D0E9' },
  completed: { label: '已完成', color: '#2ED573' },
};

export default function EmergencyPanels() {
  const sv = useCommandStore((s) => s.commandState.specialVehicles);
  const sd = useCommandStore((s) => s.commandState.supplyDemand);
  const et = useCommandStore((s) => s.commandState.emergencyTasks);

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Special Vehicle Tracking */}
      <div style={{ background: 'rgba(12,25,48,0.82)', border: '1px solid rgba(255,71,87,0.15)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Truck size={12} color="#FF4757" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>特殊车辆追踪</span>
          <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 'auto' }}>{sv.length} 辆</span>
        </div>
        {sv.map((v) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', marginBottom: 4, borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[v.status] || '#94A3B8' }} />
              <span style={{ fontSize: 11, color: '#E2E8F0', fontFamily: 'JetBrains Mono, monospace' }}>{v.plate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{v.cargo}</span>
              <span style={{ fontSize: 10, color: statusColors[v.status] || '#94A3B8', fontWeight: 500 }}>{v.waitTime}min</span>
            </div>
          </div>
        ))}
      </div>

      {/* Supply Demand */}
      <div style={{ background: 'rgba(12,25,48,0.82)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Package size={12} color="#F5A623" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>物资需求</span>
        </div>
        {sd.map((item, i) => {
          const ratio = item.allocated / item.required;
          const barColor = ratio >= 0.7 ? '#2ED573' : ratio >= 0.4 ? '#F5A623' : '#FF4757';
          return (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#A0A8B4', marginBottom: 2 }}>
                <span>{item.name}</span>
                <span>{item.allocated.toLocaleString()}/{item.required.toLocaleString()} {item.unit}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${ratio * 100}%`, height: '100%', background: barColor, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Tasks */}
      <div style={{ background: 'rgba(12,25,48,0.82)', border: '1px solid rgba(0,208,233,0.15)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ClipboardList size={12} color="#00D0E9" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>应急任务</span>
          <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 'auto' }}>{et.filter(t => t.status !== 'completed').length} 项进行中</span>
        </div>
        {et.map((task) => {
          const st = taskStatusLabels[task.status] || { label: task.status, color: '#94A3B8' };
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', marginBottom: 4, borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{task.department} · {task.owner}</div>
              </div>
              <span style={{ fontSize: 10, color: st.color, fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
