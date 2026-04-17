import Modal from '../Modal';
import { AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function EscalateConfirmModal() {
  const { commandState, setActiveModal, setSystemMode, addCommandFeedItem } = useDashboardStore();
  const { congestionIndex } = commandState;

  const handleConfirm = () => {
    // Add escalation message to feed
    addCommandFeedItem('事件已升级为应急模式，正在启动应急预案...');
    // Switch to emergency mode
    setSystemMode('emergency');
    setActiveModal(null);
  };

  const handleCancel = () => {
    setActiveModal(null);
  };

  return (
    <Modal id="escalate-confirm" title="确认升级" width={400}>
      <div style={{
        background: 'rgba(13,27,42,0.9)',
        border: '1px solid rgba(255,71,87,0.3)',
        borderRadius: 6,
        padding: 20,
        backdropFilter: 'blur(10px)',
      }}>
        {/* Warning icon and description */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 20,
        }}>
          <div style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,71,87,0.15)',
            border: '1px solid rgba(255,71,87,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangle size={20} color="#FF4757" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>
              确认将当前事件升级为应急模式？
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
              当前拥堵指数 <span style={{ color: '#FF4757', fontWeight: 600 }}>{congestionIndex.toFixed(1)}</span>，
              策略效果不足，建议升级为应急模式。
            </div>
            <div style={{
              fontSize: 12,
              color: '#FCD34D',
              marginTop: 8,
              padding: '8px 10px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 4,
              lineHeight: 1.6,
            }}>
              升级后将启动应急预案，通知相关部门。
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(100,116,139,0.15)',
              border: '1px solid rgba(100,116,139,0.3)',
              color: '#94A3B8',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100,116,139,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(100,116,139,0.15)';
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(255,71,87,0.15)',
              border: '1px solid rgba(255,71,87,0.4)',
              color: '#FF4757',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,71,87,0.25)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(255,71,87,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,71,87,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            确认升级
          </button>
        </div>
      </div>
    </Modal>
  );
}
