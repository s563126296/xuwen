import { useRef } from 'react';
import { Video, MessageSquare } from 'lucide-react';
import type { FieldPerson } from '../../stores/commandStore';

interface PersonPopupProps {
  person: FieldPerson;
  position: { x: number; y: number };
  onStartCall: (personId: string) => void;
  onOpenChat: (personId: string) => void;
  onClose: () => void;
}

export default function PersonPopup({
  person,
  position,
  onStartCall,
  onOpenChat,
  onClose,
}: PersonPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        left: position.x - 100,
        top: position.y - 140,
        width: 200,
        background: 'rgba(13,27,42,0.95)',
        border: '1px solid rgba(0,208,233,0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: 8,
        padding: 12,
        zIndex: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'personPopupFadeIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 人员信息 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>
          {person.name} · {person.department}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>
          状态：{person.task || '空闲'}
        </div>
      </div>

      {/* 分隔线 */}
      <div style={{ height: 1, background: 'rgba(0,208,233,0.15)', marginBottom: 12 }} />

      {/* 操作按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => {
            onStartCall(person.id);
            onClose();
          }}
          style={{
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            border: '1px solid rgba(0,208,233,0.3)',
            background: 'rgba(0,208,233,0.1)',
            color: '#00D0E9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.1)';
          }}
        >
          <Video size={14} />
          视频通话
        </button>

        <button
          onClick={() => {
            onOpenChat(person.id);
            onClose();
          }}
          style={{
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            border: '1px solid rgba(0,208,233,0.3)',
            background: 'rgba(0,208,233,0.1)',
            color: '#00D0E9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.1)';
          }}
        >
          <MessageSquare size={14} />
          发送消息
        </button>
      </div>
    </div>
  );
}
