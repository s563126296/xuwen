import { useState, useEffect } from 'react';
import { Volume2, VolumeX, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import { stopSpeaking } from '../../utils/assistantEngine';

const btnBase: React.CSSProperties = {
  width: 24, height: 24, borderRadius: '50%',
  border: '1px solid rgba(0, 208, 233, 0.3)',
  background: 'rgba(13, 17, 55, 0.9)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.2s',
};

const onEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'rgba(0, 208, 233, 0.2)';
  e.currentTarget.style.borderColor = '#00D0E9';
};
const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'rgba(13, 17, 55, 0.9)';
  e.currentTarget.style.borderColor = 'rgba(0, 208, 233, 0.3)';
};

export default function VirtualAssistant() {
  const { status, currentMessage, muted } = useOverviewStore((s) => s.assistantState);
  const toggleMute = useOverviewStore((s) => s.toggleAssistantMute);
  const openChat = useOverviewStore((s) => s.openAssistantChat);
  const isSpeaking = status === 'speaking';
  const [collapsed, setCollapsed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = isSpeaking ? '/avatars/xiaoyu-speak.png' : '/avatars/xiaoyu-waiting.png';
    img.onload = () => setImageLoaded(true);
  }, [isSpeaking]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 200,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(13, 17, 55, 0.95)',
          border: '1px solid rgba(0, 208, 233, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 2px 8px rgba(0, 208, 233, 0.2)',
        }}
        aria-label="展开小语"
      >
        <ChevronLeft size={16} color="#00D0E9" />
      </button>
    );
  }

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20,
      width: 150, height: 220, zIndex: 200, pointerEvents: 'auto' }}>

      {/* Speech bubble - 16:9 横向框，左上角位置 */}
      {isSpeaking && currentMessage && <SpeechBubble text={currentMessage} />}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(true)}
        style={{
          position: 'absolute', top: -5, right: -5, zIndex: 310,
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(13, 17, 55, 0.95)',
          border: '1px solid rgba(0, 208, 233, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="隐藏小语"
      >
        <ChevronRight size={10} color="#94A3B8" />
      </button>

      {/* Character container */}
      <div
        style={{ position: 'relative', width: '100%', height: '100%',
          animation: 'assistantFloat 2s ease-in-out infinite',
          cursor: isSpeaking ? 'pointer' : 'default' }}
        onClick={() => { if (isSpeaking) stopSpeaking(); }}
        role="button"
        tabIndex={0}
        aria-label={isSpeaking ? '停止播报' : '虚拟助手小语'}
      >
        <CharacterImage isSpeaking={isSpeaking} imageLoaded={imageLoaded} />

        {/* Name tag */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: '#0D1137', border: '1px solid rgba(0, 208, 233, 0.3)',
          borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#00D0E9',
        }}>小语</div>

        {/* Controls */}
        <div style={{ position: 'absolute', bottom: -5, left: '50%',
          transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          <button onClick={toggleMute} style={btnBase}
            onMouseEnter={onEnter} onMouseLeave={onLeave}>
            {muted
              ? <VolumeX size={12} color="#94A3B8" />
              : <Volume2 size={12} color="#00D0E9" />}
          </button>
          <button onClick={openChat} style={btnBase}
            onMouseEnter={onEnter} onMouseLeave={onLeave}>
            <MessageCircle size={12} color="#00D0E9" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function SpeechBubble({ text }: { text: string }) {
  return (
    <div style={{
      position: 'absolute', top: 20, right: 155,
      width: 288, height: 162,
      background: 'rgba(13, 17, 55, 0.95)',
      border: '1px solid rgba(0, 208, 233, 0.3)',
      borderRadius: 8, padding: '12px 14px',
      fontSize: 12, color: '#E0E8FF', lineHeight: 1.6,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      animation: 'assistantFadeIn 0.3s ease-out', zIndex: 300,
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: 10, color: '#00D0E9', fontWeight: 600, marginBottom: 6 }}>
        小语播报
      </div>
      {text}
      {/* Tail pointing right to character head */}
      <div style={{
        position: 'absolute', top: 30, right: -6,
        width: 0, height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgba(13, 17, 55, 0.95)',
      }} />
    </div>
  );
}

function CharacterImage({ isSpeaking, imageLoaded }: { isSpeaking: boolean; imageLoaded: boolean }) {
  const imageSrc = isSpeaking ? '/avatars/xiaoyu-speak.png' : '/avatars/xiaoyu-waiting.png';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <img
        src={imageSrc}
        alt="小语"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0, 208, 233, 0.3))',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: isSpeaking ? '#00D0E9' : '#2ED573',
        boxShadow: `0 0 8px ${isSpeaking ? '#00D0E9' : '#2ED573'}`,
        animation: !isSpeaking ? 'pulse 2s ease-in-out infinite' : 'none'
      }} />

      {/* Sound waves (when speaking) */}
      {isSpeaking && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 25,
          display: 'flex',
          gap: 4,
          alignItems: 'center'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: 12,
                backgroundColor: '#00D0E9',
                borderRadius: 1,
                animation: `soundWave 1s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
