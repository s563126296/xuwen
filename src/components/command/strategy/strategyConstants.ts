import { Signal, Shield, Zap, Settings } from 'lucide-react';

export const cornerStyles = `
.cmd-panel-section { position: relative; }
.cmd-panel-section::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,208,233,0.35), transparent);
}
.cmd-exec-btn-recommended:hover {
  box-shadow: 0 0 8px rgba(0,208,233,0.3) !important;
}
.cmd-alt-btn:hover {
  background: rgba(0,208,233,0.15) !important;
  border-color: rgba(0,208,233,0.4) !important;
}
`;

export const dinFont = 'DIN Alternate, Orbitron, monospace';

export const CUSTOM_TEMPLATES = [
  { id: 'adjust-diversion', label: '调整分流比例', icon: Signal },
  { id: 'add-police', label: '增加警力', icon: Shield },
  { id: 'adjust-signal', label: '调整信号灯时长', icon: Zap },
  { id: 'send-guidance', label: '发送诱导屏信息', icon: Settings },
];

export function getResponsible(strategyId: string): string {
  if (strategyId === 'S-01' || strategyId === 'S-02') return '张三';
  if (strategyId === 'S-04' || strategyId === 'S-05') return '李四';
  return '王五';
}

export function getElapsedTime(currentStep: number): string {
  if (currentStep <= 3) return '刚开始';
  if (currentStep === 4) return '约 1 分钟';
  if (currentStep === 5) return '约 3 分钟';
  return '已完成';
}

export function getLinkedCamera(strategyId: string): string {
  if (strategyId === 'S-02') return '华四村 cam-02';
  if (strategyId === 'S-01') return '城区路口 cam-01';
  if (strategyId === 'S-07') return '高速入口 cam-03';
  return '港口入口 cam-05';
}

import type { CommandFeedItem } from '../../../stores/commandStore';

export function getLatestFieldFeedback(commandFeed: CommandFeedItem[]): string {
  const fieldMsg = commandFeed.find(
    (f) => (f.type === 'field' || f.icon === 'photo' || f.icon === 'phone')
  );
  if (!fieldMsg) return '暂无现场反馈';

  const text = fieldMsg.content.length > 20
    ? fieldMsg.content.slice(0, 20) + '...'
    : fieldMsg.content;
  return `${fieldMsg.time} ${text}`;
}
