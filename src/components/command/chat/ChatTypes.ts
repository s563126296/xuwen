export interface Person {
  id: string;
  name: string;
  department: string;
  status: 'idle' | 'executing' | 'moving' | 'calling';
}

export const PERSONS: Person[] = [
  { id: 'zhang', name: '张三', department: '交警一队', status: 'executing' },
  { id: 'li', name: '李四', department: '交警一队', status: 'idle' },
  { id: 'wang', name: '王五', department: '拖车公司', status: 'moving' },
];

export const STATUS_CONFIG: Record<Person['status'], { color: string; label: string }> = {
  idle: { color: '#2ED573', label: '空闲' },
  executing: { color: '#00D0E9', label: '执行中' },
  moving: { color: '#F5A623', label: '移动中' },
  calling: { color: '#FF4757', label: '通话中' },
};

export const QUICK_REPLIES = ['收到', '已协调', '继续执行', '需支援'];

export type ChatType = 'group' | 'private';
