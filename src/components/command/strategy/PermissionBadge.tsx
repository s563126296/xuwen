import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { StrategyPermission } from '../../../stores/commandStore';

export default function PermissionBadge({ permission }: { permission: StrategyPermission }) {
  if (permission === 'approve') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(255,71,87,0.15)', color: '#FF4757',
      }}>
        <ShieldAlert size={12} color="#FF4757" />需审批
      </span>
    );
  }
  if (permission === 'confirm') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(245,158,11,0.15)', color: '#F5A623',
      }}>
        <ShieldCheck size={12} color="#F5A623" />需确认
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 9999, fontSize: 10,
      background: 'rgba(16,185,129,0.15)', color: '#2ED573',
    }}>
      <Shield size={12} color="#2ED573" />自动执行
    </span>
  );
}
