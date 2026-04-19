import { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { Video, Mic, MicOff, PhoneOff, Minimize2, X } from 'lucide-react';

const DEPT_COLORS: Record<string, string> = {
  '公安交警': '#00D0E9',
  '民政局': '#2ED573',
  '交通运输局': '#F5A623',
  '港口管理方': '#FF6B35',
  '城管局': '#A78BFA',
  '应急管理局': '#FF4757',
};

export default function EmergencyVideoConference() {
  const videoConference = useDashboardStore((s) => s.emergencyState.videoConference);
  const contacts = useDashboardStore((s) => s.emergencyState.contacts);
  const endVideoConference = useDashboardStore((s) => s.endVideoConference);
  const setEmergencyState = useDashboardStore((s) => s.setEmergencyState);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState(0);

  useEffect(() => {
    if (!videoConference?.active) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [videoConference?.active]);

  useEffect(() => {
    if (!videoConference?.active) return;
    const rotate = setInterval(() => {
      setActiveSpeaker((s) => (s + 1) % (videoConference?.participants.length || 1));
    }, 8000);
    return () => clearInterval(rotate);
  }, [videoConference?.active, videoConference?.participants.length]);

  if (!videoConference?.active) return null;

  const participants = videoConference.participants
    .map((id) => contacts.find((c) => c.id === id))
    .filter(Boolean);

  const speaker = participants[activeSpeaker] || participants[0];
  const isMinimized = videoConference.isMinimized;
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  const toggleMinimize = () => {
    setEmergencyState({
      videoConference: { ...videoConference, isMinimized: !isMinimized },
    });
  };

  if (isMinimized) {
    return (
      <div
        onClick={toggleMinimize}
        style={{
          position: 'fixed', bottom: 200, right: 20, zIndex: 9998,
          width: 120, height: 48, borderRadius: 8, cursor: 'pointer',
          background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(0,208,233,0.3)',
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        }}
      >
        <Video size={16} color="#00D0E9" />
        <div>
          <div style={{ fontSize: 10, color: '#E2E8F0' }}>会商中</div>
          <div style={{ fontSize: 10, color: '#00D0E9' }}>{mins}:{secs}</div>
        </div>
      </div>
    );
  }

  // PLACEHOLDER_FULLSCREEN
  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 20, zIndex: 9998,
      width: 480, borderRadius: 12, overflow: 'hidden',
      background: '#0D1B2A', border: '1px solid rgba(0,208,233,0.3)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      animation: 'vcSlideIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes vcSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ED573', boxShadow: '0 0 8px #2ED573' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>应急视频会商</span>
          <span style={{ fontSize: 11, color: '#00D0E9' }}>{mins}:{secs}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.08)', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minimize2 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); endVideoConference(); }} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #FF4757', background: 'rgba(255,71,87,0.15)', color: '#FF4757', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>
      </div>

      {/* Main speaker */}
      {speaker && (
        <div style={{ height: 180, position: 'relative', background: 'linear-gradient(180deg,#162231 0%,#0A0F19 100%)' }}>
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width="100%" height="100%">
            <defs><pattern id="vc-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00D0E9" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#vc-grid)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: DEPT_COLORS[speaker.department] || '#00D0E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0A0F19' }}>{speaker.name[0]}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>{speaker.name}</div>
            <div style={{ fontSize: 11, color: DEPT_COLORS[speaker.department] || '#94A3B8' }}>{speaker.department} · {speaker.role}</div>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ED573' }} />
            <span style={{ fontSize: 10, color: '#94A3B8' }}>发言中</span>
          </div>
        </div>
      )}

      {/* Participants strip */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>参会人 ({participants.length})</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {participants.map((p, i) => p && (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: DEPT_COLORS[p.department] || '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0A0F19', border: i === activeSpeaker ? '2px solid #2ED573' : '2px solid transparent' }}>{p.name[0]}</div>
              <span style={{ fontSize: 9, color: i === activeSpeaker ? '#E2E8F0' : '#94A3B8', textAlign: 'center' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={() => setIsMuted(!isMuted)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: isMuted ? 'rgba(255,71,87,0.2)' : 'rgba(0,208,233,0.12)', color: isMuted ? '#FF4757' : '#00D0E9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isMuted ? <MicOff size={18} /> : <Mic size={18} />}</button>
        <button onClick={endVideoConference} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#FF4757', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneOff size={18} /></button>
      </div>
    </div>
  );
}
