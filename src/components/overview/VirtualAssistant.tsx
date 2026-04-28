import { useState } from 'react';
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
        aria-label="展开小闻"
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
        aria-label="隐藏小闻"
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
        aria-label={isSpeaking ? '停止播报' : '虚拟助手小闻'}
      >
        <CharacterSVG isSpeaking={isSpeaking} />

        {/* Name tag */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: '#0D1137', border: '1px solid rgba(0, 208, 233, 0.3)',
          borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#00D0E9',
        }}>小闻</div>

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
      position: 'absolute', top: -50, left: -300,
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
        小闻播报
      </div>
      {text}
      {/* Tail pointing right to character head */}
      <div style={{
        position: 'absolute', top: 60, right: -6,
        width: 0, height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgba(13, 17, 55, 0.95)',
      }} />
    </div>
  );
}

function CharacterSVG({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <svg width="150" height="180" viewBox="0 0 150 180"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 208, 233, 0.3))' }}>

      {/* Sparkles */}
      <circle cx="20" cy="40" r="2" fill="#00D0E9" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="60" r="2" fill="#A855F7" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="25" cy="100" r="2" fill="#2ED573" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Gradients */}
      <defs>
        <radialGradient id="lotusGrad">
          <stop offset="0%" stopColor="#2ED573" />
          <stop offset="100%" stopColor="#1A9F52" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D0E9" />
          <stop offset="100%" stopColor="#2ED573" />
        </linearGradient>
        <radialGradient id="headGrad">
          <stop offset="0%" stopColor="#7FECF5" />
          <stop offset="100%" stopColor="#00D0E9" />
        </radialGradient>
      </defs>

      {/* Lotus leaf base */}
      <ellipse cx="75" cy="165" rx="45" ry="12" fill="url(#lotusGrad)" />

      {/* Body (traditional clothing) */}
      <rect x="55" y="95" width="40" height="45" rx="8" fill="url(#bodyGrad)" />

      {/* Lotus pattern on chest */}
      <circle cx="75" cy="110" r="6" fill="#FFFFFF" opacity="0.8" />
      <circle cx="75" cy="110" r="3" fill="#FFB4C5" opacity="0.6" />

      {/* Gold belt */}
      <rect x="55" y="120" width="40" height="4" fill="#F5A623" />
      <circle cx="75" cy="122" r="3" fill="#FFD700" />

      {/* Wave pattern */}
      <path d="M 55 135 Q 65 130 75 135 T 95 135" stroke="#006B7D" strokeWidth="2" fill="none" />

      {/* Arms */}
      <ellipse cx="50" cy="105" rx="8" ry="12" fill="#00D0E9" />
      <ellipse cx="100" cy="105" rx="8" ry="12" fill="#00D0E9" />

      {/* Head */}
      <circle cx="75" cy="60" r="35" fill="url(#headGrad)" />

      {/* Eyes */}
      <circle cx="65" cy="58" r="4" fill="#0A0F19" />
      <circle cx="66" cy="57" r="1.5" fill="#FFFFFF" />
      <circle cx="85" cy="58" r="4" fill="#0A0F19" />
      <circle cx="86" cy="57" r="1.5" fill="#FFFFFF" />

      {/* Smile */}
      <path d="M 65 68 Q 75 73 85 68" stroke="#0A0F19" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Rosy cheeks */}
      <circle cx="58" cy="65" r="5" fill="#FFB4C5" opacity="0.5" />
      <circle cx="92" cy="65" r="5" fill="#FFB4C5" opacity="0.5" />

      {/* Hair bun */}
      <ellipse cx="75" cy="30" rx="18" ry="15" fill="#00A8B8" />

      {/* Hair pin */}
      <rect x="73" y="20" width="4" height="12" fill="#F5A623" rx="2" />
      <circle cx="75" cy="18" r="3" fill="#FF4757" />

      {/* Pagoda on top */}
      <rect x="68" y="12" width="14" height="4" fill="#00A8B8" stroke="#F5A623" strokeWidth="0.5" />
      <rect x="70" y="8" width="10" height="4" fill="#00A8B8" stroke="#F5A623" strokeWidth="0.5" />
      <rect x="72" y="4" width="6" height="4" fill="#00A8B8" stroke="#F5A623" strokeWidth="0.5" />
      <polygon points="75,0 78,4 72,4" fill="#F5A623" />

      {/* Headphones */}
      <ellipse cx="45" cy="60" rx="8" ry="10" fill="#E0E8FF" opacity="0.9" />
      <ellipse cx="105" cy="60" rx="8" ry="10" fill="#E0E8FF" opacity="0.9" />
      <ellipse cx="45" cy="60" rx="5" ry="7" fill="#00D0E9" opacity="0.3" />
      <ellipse cx="105" cy="60" rx="5" ry="7" fill="#00D0E9" opacity="0.3" />
      <path d="M 45 50 Q 75 45 105 50" stroke="#E0E8FF" strokeWidth="3" fill="none" />

      {/* Status indicator */}
      <circle cx="100" cy="35" r="4" fill={isSpeaking ? '#00D0E9' : '#2ED573'}>
        {!isSpeaking && (
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Sound waves (when speaking) */}
      {isSpeaking && (
        <>
          <path d="M 115 55 Q 120 60 115 65" stroke="#00D0E9" strokeWidth="2" fill="none" opacity="0.6">
            <animate attributeName="opacity" values="0;0.6;0" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M 120 50 Q 127 60 120 70" stroke="#00D0E9" strokeWidth="2" fill="none" opacity="0.4">
            <animate attributeName="opacity" values="0;0.4;0" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </path>
          <path d="M 125 45 Q 134 60 125 75" stroke="#00D0E9" strokeWidth="2" fill="none" opacity="0.2">
            <animate attributeName="opacity" values="0;0.2;0" dur="1s" begin="0.4s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
}
