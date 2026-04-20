import { useState } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { playClickSound, playMessageSound } from '../../utils/soundEffects';
import AddTaskModal from './AddTaskModal';

const priorityColor = {
  high: '#FF4757',
  medium: '#F5A623',
  low: '#00D0E9',
} as const;

const statusLabel = {
  pending: '待接收',
  received: '已接收',
  executing: '执行中',
  arrived: '已到场',
  done: '已完成',
} as const;

const nextStatusConfig: Record<string, { label: string; next: 'received' | 'executing' | 'arrived' | 'done'; color: string } | null> = {
  pending: { label: '确认接收', next: 'received', color: '#00D0E9' },
  received: { label: '开始执行', next: 'executing', color: '#F5A623' },
  executing: { label: '已到现场', next: 'arrived', color: '#2ED573' },
  arrived: { label: '标记完成', next: 'done', color: '#2ED573' },
  done: null,
};

export default function EmergencyTaskBoard() {
  const tasks = useEmergencyStore((s) => s.emergencyState.tasks);
  const setEmergencyState = useEmergencyStore((s) => s.setEmergencyState);
  const [showModal, setShowModal] = useState(false);

  const handleStatusChange = (taskId: string, newStatus: 'received' | 'executing' | 'arrived' | 'done') => {
    if (newStatus === 'done') {
      playMessageSound();
    } else {
      playClickSound();
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const updates: Partial<typeof t> = { status: newStatus, updatedAt: timeStr };
      if (newStatus === 'arrived') updates.arrivedAt = timeStr;
      if (newStatus === 'done') updates.completedAt = timeStr;
      return { ...t, ...updates };
    });
    setEmergencyState({ tasks: updatedTasks });
  };

  const handleAddTask = (form: {
    department: '公安交警' | '民政局' | '交通运输局' | '港口管理方' | '城管局' | '应急管理局';
    title: string;
    priority: 'high' | 'medium' | 'low';
    owner: string;
  }) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTask = {
      id: `em-task-${Date.now()}`,
      status: 'pending' as const,
      updatedAt: timeStr,
      ...form,
    };
    setEmergencyState({ tasks: [...tasks, newTask] });
    setShowModal(false);
  };

  return (
    <>
      <div className="card" style={{ padding: 14, flex: '45 0 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>F. 跨部门任务板</div>
          <button
            onClick={() => { playClickSound(); setShowModal(true); }}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              background: 'transparent',
              border: '1px solid #00D0E9',
              color: '#00D0E9',
              borderRadius: 4,
              cursor: 'pointer',
              lineHeight: 1.4,
            }}
          >
            + 新增任务
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 8, flex: 1, minHeight: 0 }}>
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
      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} onConfirm={handleAddTask} />
      )}
    </>
  );
}
