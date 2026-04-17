import { useState, useEffect } from 'react';
import { Minimize2, X, Phone } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';

export default function VideoCallWindow() {
  const { commandState, endCall } = useDashboardStore();
  const { isInCall, callPersonId, fieldPersons } = commandState;

  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [animationState, setAnimationState] = useState<'entering' | 'entered'>('entering');

  const callPerson = callPersonId !== null ? fieldPersons.find(p => p.id === callPersonId) : null;

  // Reset duration when call starts, trigger entrance animation
  useEffect(() => {
    if (!isInCall) {
      setCallDuration(0);
      setIsMinimized(false);
      setAnimationState('entering');
      return;
    }
    setAnimationState('entering');
    setTimeout(() => setAnimationState('entered'), 50);
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isInCall]);

  const handleEndCall = () => {
    playClickSound();
    endCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isInCall || !callPerson) return null;

  // Minimized state: small floating icon
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'absolute',
          right: 280,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 80,
          height: 60,
          background: 'rgba(10,15,25,0.95)',
          border: '1px solid rgba(255,71,87,0.3)',
          borderRadius: 8,
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          zIndex: 30,
        }}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: callPerson.avatar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#0A0F19',
        }}>
          {callPerson.name.charAt(0)}
        </div>
        <div style={{ fontSize: 11, color: '#FF4757', fontWeight: 500 }}>
          {formatDuration(callDuration)}
        </div>
      </div>
    );
  }

  // Full window
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '35%',
      transform: animationState === 'entering'
        ? 'translate(-50%, -50%) scale(0.9)'
        : 'translate(-50%, -50%) scale(1)',
      opacity: animationState === 'entering' ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      width: 320,
      height: 240,
      background: 'rgba(10,15,25,0.95)',
      border: '1px solid rgba(255,71,87,0.3)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      zIndex: 30,
    }}>
      {/* Title bar */}
      <div style={{
        height: 36,
        background: 'rgba(255,71,87,0.08)',
        borderBottom: '1px solid rgba(255,71,87,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#FF4757',
            animation: 'callPulse 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#FF4757' }}>
            通话中 · {callPerson.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              width: 24, height: 24, background: 'transparent', border: 'none',
              borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={handleEndCall}
            style={{
              width: 24, height: 24, background: 'transparent', border: 'none',
              borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#FF4757',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Video area */}
      <div style={{
        height: 'calc(100% - 36px - 48px)',
        background: 'linear-gradient(180deg, #1A0A0A 0%, #2A1515 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        overflow: 'hidden',
      }}>
        {/* Scan line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,71,87,0.6) 50%, transparent 100%)',
          animation: 'callScan 3s linear infinite',
        }} />

        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: callPerson.avatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#0A0F19',
          boxShadow: `0 0 12px ${callPerson.avatar}66`,
        }}>
          {callPerson.name.charAt(0)}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
            {callPerson.name} · {callPerson.department}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,71,87,0.8)', marginTop: 4 }}>
            视频通话中...
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        height: 48,
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,71,87,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          {formatDuration(callDuration)}
        </span>
        <button
          onClick={handleEndCall}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#FF4757', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FF6B7A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FF4757'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Phone size={16} />
        </button>
      </div>

      <style>{`
        @keyframes callPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes callScan {
          0% { transform: translateY(0); }
          100% { transform: translateY(156px); }
        }
      `}</style>
    </div>
  );
}
