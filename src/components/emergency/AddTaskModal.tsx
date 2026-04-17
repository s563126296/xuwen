import { useState } from 'react';
import { playClickSound } from '../../utils/soundEffects';

interface AddTaskModalProps {
  onClose: () => void;
  onConfirm: (task: {
    department: '公安交警' | '民政局' | '交通运输局' | '港口管理方' | '城管局' | '应急管理局';
    title: string;
    priority: 'high' | 'medium' | 'low';
    owner: string;
  }) => void;
}

const departments = ['公安交警', '民政局', '交通运输局', '港口管理方', '城管局', '应急管理局'] as const;
const priorities = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
] as const;

export default function AddTaskModal({ onClose, onConfirm }: AddTaskModalProps) {
  const [department, setDepartment] = useState<typeof departments[number]>('公安交警');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [owner, setOwner] = useState('');

  const handleConfirm = () => {
    if (!title.trim() || !owner.trim()) return;
    playClickSound();
    onConfirm({ department, title: title.trim(), priority, owner: owner.trim() });
  };

  const handleCancel = () => {
    playClickSound();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          width: 400,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
          border: '1px solid rgba(0,208,233,0.3)',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16 }}>新增任务</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>部门</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as typeof departments[number])}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(13,27,42,0.8)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 4,
                color: '#E2E8F0',
                fontSize: 12,
                outline: 'none',
              }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>任务标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入任务标题"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(13,27,42,0.8)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 4,
                color: '#E2E8F0',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(13,27,42,0.8)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 4,
                color: '#E2E8F0',
                fontSize: 12,
                outline: 'none',
              }}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>负责人</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="请输入负责人"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(13,27,42,0.8)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 4,
                color: '#E2E8F0',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(148,163,184,0.5)',
              borderRadius: 4,
              color: '#94A3B8',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!title.trim() || !owner.trim()}
            style={{
              padding: '8px 16px',
              background: title.trim() && owner.trim() ? '#00D0E9' : 'rgba(0,208,233,0.3)',
              border: 'none',
              borderRadius: 4,
              color: title.trim() && owner.trim() ? '#0F172A' : '#64748B',
              fontSize: 12,
              fontWeight: 600,
              cursor: title.trim() && owner.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
