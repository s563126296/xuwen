import { useEffect, useState } from 'react';
import { Phone, Video, X } from 'lucide-react';
import type { FieldPerson } from '../../stores/commandStore';
import { playIncomingCallSound, playClickSound } from '../../utils/soundEffects';

interface IncomingCallModalProps {
  person: FieldPerson;
  message: string;
  onAcceptVideo: () => void;
  onAcceptVoice: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({
  person,
  message,
  onAcceptVideo,
  onAcceptVoice,
  onDecline,
}: IncomingCallModalProps) {
  const [animationState, setAnimationState] = useState<'entering' | 'entered'>('entering');

  useEffect(() => {
    playIncomingCallSound();
    setTimeout(() => setAnimationState('entered'), 50);
  }, []);

  const handleAcceptVideo = () => {
    playClickSound();
    onAcceptVideo();
  };

  const handleAcceptVoice = () => {
    playClickSound();
    onAcceptVoice();
  };

  const handleDecline = () => {
    playClickSound();
    onDecline();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: animationState === 'entering'
        ? 'translate(-50%, calc(-50% - 20px))'
        : 'translate(-50%, -50%)',
      opacity: animationState === 'entering' ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 1000,
      width: 360,
      background: 'rgba(13,27,42,0.95)',
      border: '1px solid rgba(255,71,87,0.4)',
      borderRadius: 8,
      padding: 24,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 24px rgba(255,71,87,0.2)',
    }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={20} color="#FF4757" />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>来电</span>
        </div>
        <button
          onClick={handleDecline}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="关闭"
        >
          <X size={18} />
        </button>
      </div>

      {/* 人员信息 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        padding: 12,
        background: 'rgba(0,208,233,0.05)',
        borderRadius: 6,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: person.avatar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          color: '#0A0F19',
        }}>
          {person.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
            {person.name} · {person.department}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
            {person.role}
          </div>
        </div>
      </div>

      {/* 消息内容 */}
      <div style={{
        padding: 12,
        background: 'rgba(10,15,25,0.6)',
        borderRadius: 6,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
          "{message}"
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleAcceptVideo}
          style={{
            flex: 1,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#00D0E9',
            border: 'none',
            borderRadius: 6,
            color: '#0A0F19',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#00B8D4'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#00D0E9'}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Video size={16} />
          接听视频
        </button>
        <button
          onClick={handleAcceptVoice}
          style={{
            flex: 1,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'rgba(0,208,233,0.15)',
            border: '1px solid rgba(0,208,233,0.3)',
            borderRadius: 6,
            color: '#00D0E9',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.25)';
            e.currentTarget.style.borderColor = 'rgba(0,208,233,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,208,233,0.15)';
            e.currentTarget.style.borderColor = 'rgba(0,208,233,0.3)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Phone size={16} />
          接听语音
        </button>
      </div>

      <button
        onClick={handleDecline}
        style={{
          width: '100%',
          height: 36,
          marginTop: 8,
          background: 'transparent',
          border: '1px solid rgba(100,116,139,0.3)',
          borderRadius: 6,
          color: '#94A3B8',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100,116,139,0.5)';
          e.currentTarget.style.color = '#CBD5E1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100,116,139,0.3)';
          e.currentTarget.style.color = '#94A3B8';
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        忽略
      </button>
    </div>
  );
}
