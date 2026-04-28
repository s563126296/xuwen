import { MessageSquare } from 'lucide-react';

interface ChatMinimizedButtonProps {
  unreadCount: number;
  onClick: () => void;
  variant: 'closed' | 'minimized';
}

export default function ChatMinimizedButton({ unreadCount, onClick, variant }: ChatMinimizedButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 328,
        bottom: 204,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background:
          variant === 'closed' ? 'rgba(0,208,233,0.15)' : 'rgba(10,15,25,0.95)',
        border: '1px solid rgba(0,208,233,0.3)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 102,
      }}
    >
      <MessageSquare size={20} color="#00D0E9" />
      {variant === 'minimized' && unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: '#FF4757',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
}
