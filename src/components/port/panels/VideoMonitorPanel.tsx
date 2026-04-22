import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Video, X, Maximize2 } from 'lucide-react';
import '../modals/detail-modal.css';

const cameras = [
  {
    name: '闸口监控',
    location: '徐闻港闸口 A-01',
    resolution: '1080P',
    channel: 'CH-01',
    ip: '10.68.1.101',
    videoUrl: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4',
  },
  {
    name: '码头监控',
    location: '海安新港码头 B-03',
    resolution: '1080P',
    channel: 'CH-03',
    ip: '10.68.2.203',
    videoUrl: 'https://videos.pexels.com/video-files/3015512/3015512-uhd_2560_1440_24fps.mp4',
  },
];

export default function VideoMonitorPanel() {
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null);
  const currentCamera = cameras.find((c) => c.name === expandedCamera);

  return (
    <div className="module-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 10px' }}>
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexShrink: 0 }}>
        <Video size={12} style={{ color: '#4da6ff' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>视频监控</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>{cameras.length} 路在线</span>
      </div>

      {/* 视频窗口 */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, minHeight: 0 }}>
        {cameras.map((camera) => (
          <div
            key={camera.name}
            onClick={() => setExpandedCamera(camera.name)}
            style={{
              position: 'relative', borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
              background: '#060e1a',
              border: '1px solid rgba(0,208,233,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,208,233,0.35)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,208,233,0.12)'; }}
          >
            {/* 缩略视频（静音自动播放），加载失败时显示占位 */}
            <video
              src={camera.videoUrl}
              muted
              autoPlay
              loop
              playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
              onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
            />
            {/* 占位图标（视频加载失败时可见） */}
            <Video size={20} color="rgba(255,255,255,0.15)" strokeWidth={1.5} style={{ zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 4, left: 4, padding: '2px 5px', background: 'rgba(0,0,0,0.6)', borderRadius: 3, fontSize: 9, color: '#fff', zIndex: 1 }}>
              {camera.name}
            </div>
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 5px', background: 'rgba(0,0,0,0.6)', borderRadius: 3, fontSize: 9, color: '#fff', zIndex: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4757', boxShadow: '0 0 6px rgba(255,71,87,0.8)', animation: 'blink 1.5s infinite' }} />
              REC
            </div>
            <Maximize2 size={16} color="rgba(255,255,255,0.4)" style={{ zIndex: 1 }} />
            <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.4)', zIndex: 1 }}>
              <span>{camera.channel}</span>
              <span>{camera.resolution}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 视频详情弹窗 — Portal 到 body，确保在整个屏幕正中间 */}
      {expandedCamera && currentCamera && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setExpandedCamera(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 840, maxWidth: '92vw', maxHeight: '88vh',
              background: 'linear-gradient(145deg, rgba(6,16,31,0.98), rgba(8,31,49,0.95))',
              border: '1px solid rgba(0,208,233,0.25)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(0,208,233,0.1)',
              animation: 'slideUp 0.25s ease',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* 视频区域 */}
            <div style={{ position: 'relative', background: '#000', flexShrink: 0 }}>
              <video
                key={currentCamera.videoUrl}
                src={currentCamera.videoUrl}
                autoPlay
                loop
                controls
                playsInline
                style={{ width: '100%', height: 460, objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLVideoElement;
                  el.style.background = '#0a1520';
                  el.poster = '';
                }}
              />
              {/* 顶部信息栏 */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '10px 14px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4757', boxShadow: '0 0 8px rgba(255,71,87,0.8)', animation: 'blink 1.5s infinite' }} />
                    <span style={{ fontSize: 11, color: '#FF4757', fontWeight: 600 }}>REC</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{currentCamera.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{currentCamera.channel}</span>
                </div>
                <button
                  onClick={() => setExpandedCamera(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6,
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  <X size={16} color="#fff" />
                </button>
              </div>
              {/* 底部时间戳 */}
              <div style={{
                position: 'absolute', bottom: 40, left: 14,
                padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: 4,
                fontSize: 12, color: 'rgba(255,255,255,0.7)',
                fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
              }}>
                {new Date().toLocaleString('zh-CN')} · 实时
              </div>
            </div>

            {/* 底部信息栏 */}
            <div style={{
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 24,
              borderTop: '1px solid rgba(0,208,233,0.15)',
              flexShrink: 0,
            }}>
              {[
                { label: '位置', value: currentCamera.location },
                { label: 'IP', value: currentCamera.ip },
                { label: '分辨率', value: `${currentCamera.resolution} / 30fps` },
                { label: '状态', value: '在线', color: '#2ED573' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'color' in item && item.color ? item.color : '#fff' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
