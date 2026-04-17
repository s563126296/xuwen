import { useDashboardStore } from '../../store/dashboardStore';

const priorityColor = {
  high: '#FF4757',
  medium: '#F5A623',
  low: '#00D0E9',
} as const;

const statusLabel = {
  pending: '待接收',
  received: '已接收',
  executing: '执行中',
  done: '已完成',
} as const;

export default function EmergencyTaskBoard() {
  const tasks = useDashboardStore((s) => s.emergencyState.tasks);

  return (
    <div className="card" style={{ padding: 14, minHeight: 260 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>F. 跨部门任务板</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', border: `1px solid ${priorityColor[task.priority]}33` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{task.title}</div>
              <div style={{ fontSize: 10, color: priorityColor[task.priority], fontWeight: 700 }}>{statusLabel[task.status]}</div>
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
              <span>{task.department} · {task.owner}</span>
              <span>{task.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
