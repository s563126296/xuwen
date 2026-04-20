interface DroneOverlayProps {
  onMarkerClick: (name: string, type: string) => void;
}

function DroneSvg({ beginDelay }: { beginDelay?: string }) {
  return (
    <svg viewBox="-28 -22 56 44" width="64" height="52" style={{ position: 'absolute', top: 8, left: 8 }}>
      <line x1="-20" y1="-14" x2="20" y2="14" stroke="#FFF" strokeWidth="3"/>
      <line x1="20" y1="-14" x2="-20" y2="14" stroke="#FFF" strokeWidth="3"/>
      <ellipse cx="0" cy="0" rx="12" ry="9" fill="#FFF"/>
      <ellipse cx="0" cy="-1" rx="7" ry="4" fill="#C8D0D8" opacity="0.5"/>
      <circle cx="-20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      <circle cx="20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      <circle cx="-20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      <circle cx="20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      <circle cx="0" cy="0" r="3" fill="#00FF88"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" begin={beginDelay} repeatCount="indefinite"/></circle>
    </svg>
  );
}

export default function DroneOverlay({ onMarkerClick }: DroneOverlayProps) {
  return (
    <>
      {/* 无人机 1 - 沿 G207 巡航 */}
      <div
        role="button"
        aria-label="无人机-01"
        tabIndex={0}
        onClick={() => onMarkerClick('无人机-01', 'drone')}
        style={{
          position: 'absolute', width: 80, height: 80,
          top: '10%', cursor: 'pointer', zIndex: 10,
          animation: 'droneFloat1 20s linear infinite',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', animation: 'dronePulse 3s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '65%', left: '50%', width: 1, height: 35, background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)', transform: 'translateX(-50%)' }} />
        <DroneSvg />
        <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#FFF', fontWeight: 700 }}>无人机-01</div>
          <div style={{ fontSize: 11, color: '#A0AAB8' }}>G207巡航</div>
        </div>
      </div>

      {/* 无人机 2 - 沿进港大道巡航（从县城到港口方向） */}
      <div
        role="button"
        aria-label="无人机-02"
        tabIndex={0}
        onClick={() => onMarkerClick('无人机-02', 'drone')}
        style={{
          position: 'absolute', width: 80, height: 80,
          cursor: 'pointer', zIndex: 10,
          animation: 'droneFloat2 18s linear infinite',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', animation: 'dronePulse 3s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', top: '65%', left: '50%', width: 1, height: 35, background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)', transform: 'translateX(-50%)' }} />
        <DroneSvg beginDelay="0.5s" />
        <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#FFF', fontWeight: 700 }}>无人机-02</div>
          <div style={{ fontSize: 11, color: '#A0AAB8' }}>港城大道</div>
        </div>
      </div>

      <style>{`
        @keyframes droneFloat1 {
          0% { left: 0%; }
          50% { left: 85%; }
          100% { left: 0%; }
        }
        @keyframes droneFloat2 {
          0% { left: 24%; top: 25%; }
          25% { left: 22%; top: 33%; }
          50% { left: 20%; top: 42%; }
          75% { left: 22%; top: 33%; }
          100% { left: 24%; top: 25%; }
        }
        @keyframes dronePulse {
          0%, 100% { transform: translate(-50%,-50%) scale(0.85); opacity: 0.3; }
          50% { transform: translate(-50%,-50%) scale(1.3); opacity: 0.05; }
        }
      `}</style>
    </>
  );
}

