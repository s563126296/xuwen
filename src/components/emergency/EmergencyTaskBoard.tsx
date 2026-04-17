import { useDashboardStore } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';

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

const nextStatusConfig: Record<string, { label: string; next: 'received' | 'executing' | 'done'; color: string } | null> = {
  pending: { label: '确认接收', next: 'received', color: '#00D0E9' },
  received: { label: '开始执行', next: 'executing', color: '#F5A623' },
  executing: { label: '标记完成', next: 'done', color: '#2ED573' },
  done: null,
};

export default function EmergencyTaskBoard() {
  const tasks = useDashboardStore((s) => s.emergencyState.tasks);
  const setEmergencyState = useDashboardStore((s) => s.setEmergencyState);

  const handleStatusChange = (taskId: string, newStatus: 'received' | 'executing' | 'done') => {
    playClickSound();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: timeStr } : t
    );
    setEmergencyState({ tasks: updatedTasks });
  };

  return (
    <div className="card" style={{ padding: 14, minHeight: 260 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>F. 跨部门任务板</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task) => {
          const btnConfig = nextStatusConfig[task.status];
          return (
            <div key={task.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', border: `1px solid ${priorityColor[task.priority]}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{task.title}</div>
                <div style={{ fontSize: 10, color: priorityColor[task.priority], fontWeight: 700 }}>{statusLabel[task.status]}</div>
              </div>
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 11, color: '#94A3B8' }}>
                <span>{task.department} · {task.owner}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{task.updatedAt}</span>
                  {btnConfig && (
                    <button
                      onClick={() => handleStatusChange(task.id, btnConfig.next)}
                      style={{
                        fontSize: 10,
                        padding: '4px 8px',
                        background: 'transparent',
                        border: `1px solid ${btnConfig.color}`,
                        color: btnConfig.color,
                        borderRadius: 4,
                        cursor: 'pointer',
                        lineHeight: 1.2,
                      }}
                    >
                      {btnConfig.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
