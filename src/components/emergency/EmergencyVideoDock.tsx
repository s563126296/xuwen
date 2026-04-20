import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';

const CAMERAS = [
  { id: 'cam-01', name: '进港大道', status: 'online' },
  { id: 'cam-02', name: 'P-1停车区', status: 'online' },
  { id: 'cam-03', name: 'P-2停车区', status: 'online' },
  { id: 'cam-04', name: '物资发放点', status: 'online' },
  { id: 'cam-05', name: '港口入口', status: 'online' },
];

const DETECTION_BOXES = [
  { top: '26%', left: '14%', width: 56, height: 36, color: '#00D0E9', label: '粤G·K7823' },
  { top: '48%', left: '52%', width: 52, height: 34, color: '#2ED573', label: '琼A·D3156' },
  { top: '64%', left: '24%', width: 58, height: 38, color: '#F5A623', label: '桂C·M6038' },
];

function VideoScene({ isDroneView, compact = false }: { isDroneView: boolean; compact?: boolean }) {
  const typhoon = useEmergencyStore((s) => s.emergencyState.typhoon);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const sizeScale = compact ? 1 : 1.6;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: isDroneView ? 'linear-gradient(180deg,#11263C 0%,#0A0F19 100%)' : 'linear-gradient(180deg,#162231 0%,#0A0F19 100%)', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} width="100%" height="100%">
        <defs>
          <pattern id={`grid-${compact ? 'small' : 'large'}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00D0E9" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${compact ? 'small' : 'large'})`} />
      </svg>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,208,233,0.06) 50%,transparent 100%)', animation: 'emergencyVideoScan 3s linear infinite' }} />

      {isDroneView ? (
        <>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 48 * sizeScale, height: 48 * sizeScale, transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#00D0E9', opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#00D0E9', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: '25%', border: '1px solid #00D0E9', borderRadius: '50%' }} />
          </div>
          <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 10, fontSize: 10, color: '#00D0E9' }}>
            <span>UAV-01</span>
            <span>电量 82%</span>
            <span>高度 120m</span>
            <span>风速 {typhoon.windLevel}级</span>
          </div>
          {typhoon.windLevel > 6 && (
            <div style={{ position: 'absolute', top: 32, left: 10, fontSize: 10, color: '#FF4757', padding: '2px 6px', border: '1px solid #FF4757', borderRadius: 4, background: 'rgba(255,71,87,0.1)' }}>
              风力过大，建议禁飞
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 10, color: '#94A3B8' }}>巡查航线：停车区 → 港口入口 → 物资点</div>
        </>
      ) : (
        DETECTION_BOXES.map((box) => (
          <div key={box.label} style={{ position: 'absolute', top: box.top, left: box.left, width: box.width * sizeScale, height: box.height * sizeScale, border: `1px solid ${box.color}`, boxShadow: `0 0 8px ${box.color}66` }}>
            <div style={{ position: 'absolute', top: -16, left: 0, fontSize: 9, color: box.color, background: 'rgba(10,15,25,0.92)', padding: '1px 4px', borderRadius: 2 }}>{box.label}</div>
          </div>
        ))
      )}

      <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4757', boxShadow: '0 0 6px #FF4757' }} />
        <span style={{ fontSize: 10, color: '#E2E8F0' }}>REC {timeStr}</span>
      </div>
    </div>
  );
}

export default function EmergencyVideoDock() {
  const activeVideoChannel = useEmergencyStore((s) => s.emergencyState.activeVideoChannel);
  const isDroneDeployed = useEmergencyStore((s) => s.emergencyState.isDroneDeployed);
  const setEmergencyVideoChannel = useEmergencyStore((s) => s.setEmergencyVideoChannel);
  const deployEmergencyDrone = useEmergencyStore((s) => s.deployEmergencyDrone);
  const recallEmergencyDrone = useEmergencyStore((s) => s.recallEmergencyDrone);
  const [fullscreen, setFullscreen] = useState(false);

  const isDroneView = isDroneDeployed && activeVideoChannel === 5;
  const currentCamera = isDroneView ? null : CAMERAS[activeVideoChannel];

  return (
    <>
      <div style={{ position: 'absolute', left: 16, bottom: 16, width: 300, height: 192, zIndex: 30, borderRadius: 10, overflow: 'hidden', background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(0,208,233,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 112, position: 'relative' }}>
          <VideoScene isDroneView={isDroneView} compact />
          <div style={{ position: 'absolute', left: 10, top: 8, fontSize: 11, fontWeight: 700, color: '#E2E8F0' }}>
            {isDroneView ? '无人机实时回传' : currentCamera?.name}
          </div>
        </div>

        <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748B' }}>视频监控</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setFullscreen(true)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid rgba(148,163,184,0.2)', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Maximize2 size={12} /></button>
              <button onClick={() => isDroneDeployed ? recallEmergencyDrone() : deployEmergencyDrone()} style={{ height: 24, padding: '0 8px', borderRadius: 4, border: `1px solid ${isDroneDeployed ? '#FF4757' : '#00D0E9'}`, background: 'transparent', color: isDroneDeployed ? '#FF4757' : '#00D0E9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                {isDroneDeployed ? '召回' : '派出'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {CAMERAS.map((camera, index) => (
              <button key={camera.id} onClick={() => setEmergencyVideoChannel(index)} style={{ minWidth: 48, padding: '4px 6px', borderRadius: 4, border: `1px solid ${activeVideoChannel === index ? '#00D0E9' : 'rgba(148,163,184,0.18)'}`, background: activeVideoChannel === index ? 'rgba(0,208,233,0.12)' : 'rgba(15,23,42,0.6)', color: activeVideoChannel === index ? '#00D0E9' : '#94A3B8', fontSize: 9, cursor: 'pointer' }}>{camera.name}</button>
            ))}
            <button onClick={() => setEmergencyVideoChannel(5)} disabled={!isDroneDeployed} style={{ minWidth: 48, padding: '4px 6px', borderRadius: 4, border: `1px solid ${activeVideoChannel === 5 ? '#F5A623' : 'rgba(148,163,184,0.18)'}`, background: activeVideoChannel === 5 ? 'rgba(245,166,35,0.12)' : 'rgba(15,23,42,0.6)', color: !isDroneDeployed ? '#475569' : activeVideoChannel === 5 ? '#F5A623' : '#94A3B8', fontSize: 9, cursor: !isDroneDeployed ? 'not-allowed' : 'pointer' }}>无人机</button>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setFullscreen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 960, background: '#0D1B2A', borderRadius: 12, border: '1px solid rgba(0,208,233,0.25)', padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>应急视频会商监控</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[0, 1, 2, isDroneDeployed ? 5 : 4].map((channel) => (
                <div key={channel} style={{ height: 220, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <VideoScene isDroneView={channel === 5 && isDroneDeployed} />
                  <div style={{ padding: '6px 10px', background: '#0F172A', fontSize: 11, color: '#E2E8F0' }}>{channel === 5 ? '无人机回传' : CAMERAS[channel].name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes emergencyVideoScan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </>
  );
}
