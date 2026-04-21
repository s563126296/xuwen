import React from 'react';
import { Video } from 'lucide-react';

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.85)',
  border: '1px solid rgba(0,208,233,0.2)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(8px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

const cameraFeedStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
  background: `
    linear-gradient(135deg, rgba(8,16,32,0.95), rgba(12,32,56,0.85)),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 12px,
      rgba(0,208,233,0.03) 12px,
      rgba(0,208,233,0.03) 13px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 12px,
      rgba(0,208,233,0.03) 12px,
      rgba(0,208,233,0.03) 13px
    )
  `,
  border: '1px solid rgba(0,208,233,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cameras = [
  { name: '闸口监控', hint: 'Gate A-01' },
  { name: '码头监控', hint: 'Dock B-03' },
];

export default function VideoMonitorPanel() {
  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        <Video size={14} />
        视频监控
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minHeight: 0 }}>
        {cameras.map((camera) => (
          <div key={camera.name} style={cameraFeedStyle}>
            {/* 左上角：摄像头名称 */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: 8,
              padding: '3px 6px',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(0,208,233,0.2)',
              borderRadius: 4,
              fontSize: 10,
              color: '#fff',
              backdropFilter: 'blur(4px)',
            }}>
              {camera.name}
            </div>

            {/* 右上角：REC 指示 */}
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 6px',
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 4,
              fontSize: 10,
              color: '#fff',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FF4757',
                boxShadow: '0 0 8px rgba(255,71,87,0.8)',
              }} />
              REC
            </div>

            {/* 中央：视频图标 */}
            <Video size={36} color="rgba(255,255,255,0.18)" strokeWidth={1.5} />

            {/* 底部辅助信息 */}
            <div style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 9,
              color: 'rgba(255,255,255,0.45)',
            }}>
              <span>{camera.hint}</span>
              <span>1080P</span>
            </div>

            {/* 扫描线效果 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(180deg, rgba(0,208,233,0.08), transparent)',
              pointerEvents: 'none',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
