import { MessageSquare, Minimize2, X } from 'lucide-react';

interface ChatHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ onMinimize, onClose }: ChatHeaderProps) {
  return (
    <div
      style={{
        height: 40,
        padding: '0 12px',
        background: 'rgba(0,208,233,0.05)',
        borderBottom: '1px solid rgba(0,208,233,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={14} color="#00D0E9" />
        <span style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>指挥通信</span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onMinimize}
          style={{
            width: 24,
            height: 24,
            border: 'none',
            background: 'transparent',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Minimize2 size={14} />
        </button>

        <button
          onClick={onClose}
          style={{
            width: 24,
            height: 24,
            border: 'none',
            background: 'transparent',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
