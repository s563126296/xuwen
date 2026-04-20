import { Plane, Maximize2 } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import Modal from '../Modal';

// Camera mode AI detection boxes (small panel)
const CAMERA_DETECTION_BOXES = [
  { top: '28%', left: '12%', width: 70, height: 44, color: '#00D0E9', label: '粤G·A2891', speed: '38 km/h →' },
  { top: '45%', left: '55%', width: 64, height: 40, color: '#2ED573', label: '粤G·B5432', speed: '42 km/h →' },
  { top: '62%', left: '25%', width: 72, height: 46, color: '#F5A623', label: '粤G·C7821', speed: '35 km/h →' },
];

// Camera mode AI detection boxes (fullscreen modal)
const CAMERA_DETECTION_BOXES_FULL = [
  { top: '28%', left: '12%', width: 110, height: 70, color: '#00D0E9', label: '粤G·A2891', speed: '38 km/h →' },
  { top: '45%', left: '55%', width: 100, height: 64, color: '#2ED573', label: '粤G·B5432', speed: '42 km/h →' },
  { top: '62%', left: '25%', width: 114, height: 72, color: '#F5A623', label: '粤G·C7821', speed: '35 km/h →' },
];

const CAMERAS = [
  { id: 'cam-01', name: '城区路口', status: 'online' },
  { id: 'cam-02', name: '华四村', status: 'online' },
  { id: 'cam-03', name: '高速入口', status: 'online' },
  { id: 'cam-04', name: '南山上村', status: 'online' },
  { id: 'cam-05', name: '港口入口', status: 'online' },
];

export default function MapVideoDock() {
  const commandState = useCommandStore((s) => s.commandState);
  const deployDrone = useCommandStore((s) => s.deployDrone);
  const recallDrone = useCommandStore((s) => s.recallDrone);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setActiveVideoChannel = useCommandStore((s) => s.setActiveVideoChannel);
  const { isDroneDeployed, resources, activeVideoChannel } = commandState;

  const channel = activeVideoChannel;

  const isDroneView = isDroneDeployed && channel === 5;
  const currentCamera = isDroneView ? null : CAMERAS[channel];
  const canDeployDrone = resources.dronesAvailable > 0 && !isDroneDeployed;

  const handleDroneToggle = () => {
    if (isDroneDeployed) {
      recallDrone();
    } else if (canDeployDrone) {
      deployDrone();
      setActiveVideoChannel(5);
    }
  };

  const handleFullscreen = () => {
    setActiveModal('video-fullscreen');
  };

  const handleThumbnailClick = (index: number) => {
    setActiveVideoChannel(index);
  };

  const handleDroneThumbnailClick = () => {
    setActiveVideoChannel(5);
  };

  // Get current time
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <>
      <div style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 260,
        padding: 12,
        borderRadius: 8,
        background: 'rgba(10,15,25,0.92)',
        border: '1px solid rgba(0,208,233,0.12)',
        backdropFilter: 'blur(10px)',
        zIndex: 20
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
            {isDroneView ? '无人机 UAV-01' : currentCamera?.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2ED573',
            }} />
            <span style={{ fontSize: 10, color: '#64748B' }}>
              {isDroneView ? '巡航中' : '在线'}
            </span>
          </div>
        </div>

        {/* Video Display */}
        <div style={{
          position: 'relative',
          height: 110,
          borderRadius: 6,
          background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 100%)',
          border: '1px solid rgba(0,208,233,0.15)',
          overflow: 'hidden'
        }}>
          {/* Scanline */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: isDroneView ? 'rgba(74,144,217,0.5)' : 'rgba(0,208,233,0.6)',
            animation: 'scanline 3s linear infinite',
            boxShadow: isDroneView ? '0 0 10px rgba(74,144,217,0.8)' : '0 0 10px rgba(0,208,233,0.8)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Grid overlay */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15, zIndex: 1, pointerEvents: 'none' }}>
            <defs>
              <pattern id="videoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,208,233,0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#videoGrid)" />
          </svg>

          {/* Camera mode: AI detection boxes */}
          {!isDroneView && CAMERA_DETECTION_BOXES.map((box, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              border: `2px solid ${box.color}`,
              borderRadius: 4,
              zIndex: 3,
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                left: 0,
                fontSize: 9,
                color: box.color,
                background: 'rgba(0,0,0,0.8)',
                padding: '2px 5px',
                borderRadius: 3,
                whiteSpace: 'nowrap'
              }}>
                {box.label}
              </div>
              <div style={{
                position: 'absolute',
                bottom: -18,
                left: 0,
                fontSize: 8,
                color: box.color,
                background: 'rgba(0,0,0,0.8)',
                padding: '2px 5px',
                borderRadius: 3,
                whiteSpace: 'nowrap'
              }}>
                {box.speed}
              </div>
            </div>
          ))}

          {/* Drone mode: crosshair + road layer + stats + temperature */}
          {isDroneView && (
            <>
              {/* Crosshair */}
              <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
                <line x1="50%" y1="50%" x2="50%" y2="30%" stroke="rgba(74,144,217,0.6)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="50%" y2="70%" stroke="rgba(74,144,217,0.6)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="30%" y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth="1" />
              </svg>

              {/* Road layer */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '15%',
                width: '70%',
                height: '45%',
                background: '#2A2A2A',
                borderRadius: 4,
                zIndex: 1,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 8px, transparent 8px, transparent 16px)'
                }} />
              </div>

              {/* AI stats */}
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                color: '#94A3B8',
                background: 'rgba(0,0,0,0.8)',
                padding: '3px 6px',
                borderRadius: 3,
                whiteSpace: 'nowrap',
                zIndex: 4,
                pointerEvents: 'none'
              }}>
                小汽车 12 | 货车 5 | 冷链 2 | 危化品 0
              </div>

              {/* Temperature */}
              <div style={{
                position: 'absolute',
                top: 8,
                right: 50,
                fontSize: 10,
                color: '#F5A623',
                background: 'rgba(0,0,0,0.6)',
                padding: '3px 6px',
                borderRadius: 3,
                zIndex: 4,
                pointerEvents: 'none'
              }}>
                32°C
              </div>
            </>
          )}

          {/* Top-left label */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '2px 6px',
            background: 'rgba(0,208,233,0.9)',
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 600,
            color: '#0A0F19',
            zIndex: 5
          }}>
            {isDroneView ? 'UAV-01' : currentCamera?.id.toUpperCase()}
          </div>

          {/* Top-right REC indicator */}
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontWeight: 600,
            color: '#EF4444',
            zIndex: 5
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#EF4444',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            REC
          </div>

          {/* Drone center coord overlay */}
          {isDroneView && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid rgba(0,208,233,0.3)',
              zIndex: 5
            }}>
              <div style={{ fontSize: 11, color: '#00D0E9', marginBottom: 4 }}>俯拍视角</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>坐标: 110.157°E, 20.291°N</div>
            </div>
          )}

          {/* Bottom info */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: '#64748B',
            zIndex: 5
          }}>
            <span>{timeStr}</span>
            <span>{isDroneView ? '高度: 120m | 速度: 15km/h' : '1920×1080 | 25fps'}</span>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginTop: 8,
          marginBottom: 8
        }}>
          {CAMERAS.map((cam, index) => (
            <div
              key={cam.id}
              onClick={() => handleThumbnailClick(index)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.6)',
                border: channel === index ? '1px solid #00D0E9' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 600,
                color: channel === index ? '#00D0E9' : '#64748B',
                opacity: isDroneView ? 0.4 : 1,
                transition: 'all 0.2s'
              }}
            >
              {cam.id.split('-')[1]}
            </div>
          ))}
          {isDroneView && (
            <div
              onClick={handleDroneThumbnailClick}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.6)',
                border: isDroneView ? '1px solid #00D0E9' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 600,
                color: isDroneView ? '#00D0E9' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              UAV
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: 8
        }}>
          <button
            onClick={handleFullscreen}
            style={{
              flex: 1,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'rgba(0,208,233,0.08)',
              border: '1px solid rgba(0,208,233,0.2)',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: '#00D0E9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.08)';
            }}
          >
            <Maximize2 size={14} />
            全屏
          </button>
          <button
            onClick={handleDroneToggle}
            disabled={!canDeployDrone && !isDroneDeployed}
            style={{
              flex: 1,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: isDroneDeployed ? 'rgba(251,146,60,0.08)' : 'rgba(0,208,233,0.08)',
              border: isDroneDeployed ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(0,208,233,0.2)',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: isDroneDeployed ? '#FB923C' : '#00D0E9',
              cursor: (!canDeployDrone && !isDroneDeployed) ? 'not-allowed' : 'pointer',
              opacity: (!canDeployDrone && !isDroneDeployed) ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (canDeployDrone || isDroneDeployed) {
                e.currentTarget.style.background = isDroneDeployed ? 'rgba(251,146,60,0.15)' : 'rgba(0,208,233,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDroneDeployed ? 'rgba(251,146,60,0.08)' : 'rgba(0,208,233,0.08)';
            }}
          >
            <Plane size={14} />
            {isDroneDeployed ? '召回无人机' : '派出无人机'}
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Modal id="video-fullscreen" title={isDroneView ? '无人机 UAV-01' : currentCamera?.name || ''} width={800}>
        <div style={{
          width: '100%',
          height: 450,
          position: 'relative',
          background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 100%)',
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          {/* Scanline */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: isDroneView ? 'rgba(74,144,217,0.5)' : 'rgba(0,208,233,0.6)',
            animation: 'scanline 3s linear infinite',
            boxShadow: isDroneView ? '0 0 10px rgba(74,144,217,0.8)' : '0 0 10px rgba(0,208,233,0.8)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Grid overlay */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15, zIndex: 1, pointerEvents: 'none' }}>
            <defs>
              <pattern id="videoGridFull" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,208,233,0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#videoGridFull)" />
          </svg>

          {/* Camera mode: AI detection boxes */}
          {!isDroneView && CAMERA_DETECTION_BOXES_FULL.map((box, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              border: `2px solid ${box.color}`,
              borderRadius: 4,
              zIndex: 3,
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: -22,
                left: 0,
                fontSize: 12,
                color: box.color,
                background: 'rgba(0,0,0,0.8)',
                padding: '3px 8px',
                borderRadius: 3,
                whiteSpace: 'nowrap'
              }}>
                {box.label}
              </div>
              <div style={{
                position: 'absolute',
                bottom: -22,
                left: 0,
                fontSize: 11,
                color: box.color,
                background: 'rgba(0,0,0,0.8)',
                padding: '3px 8px',
                borderRadius: 3,
                whiteSpace: 'nowrap'
              }}>
                {box.speed}
              </div>
            </div>
          ))}

          {/* Drone mode: crosshair + road layer + stats + temperature */}
          {isDroneView && (
            <>
              {/* Crosshair */}
              <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
                <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="rgba(74,144,217,0.6)" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="rgba(74,144,217,0.6)" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="25%" y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth="1.5" />
              </svg>

              {/* Road layer */}
              <div style={{
                position: 'absolute',
                top: '28%',
                left: '18%',
                width: '64%',
                height: '42%',
                background: '#2A2A2A',
                borderRadius: 6,
                zIndex: 1,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 14px, transparent 14px, transparent 28px)'
                }} />
              </div>

              {/* AI stats */}
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 13,
                color: '#94A3B8',
                background: 'rgba(0,0,0,0.8)',
                padding: '6px 14px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                zIndex: 4,
                pointerEvents: 'none'
              }}>
                小汽车 12 | 货车 5 | 冷链 2 | 危化品 0
              </div>

              {/* Temperature */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 80,
                fontSize: 14,
                color: '#F5A623',
                background: 'rgba(0,0,0,0.6)',
                padding: '6px 12px',
                borderRadius: 4,
                zIndex: 4,
                pointerEvents: 'none'
              }}>
                32°C
              </div>
            </>
          )}

          {/* Top-left label */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '4px 12px',
            background: 'rgba(0,208,233,0.9)',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            color: '#0A0F19',
            zIndex: 5
          }}>
            {isDroneView ? 'UAV-01' : `${currentCamera?.id.toUpperCase()} ${currentCamera?.name}`}
          </div>

          {/* Top-right REC indicator */}
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: '#EF4444',
            zIndex: 5
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#EF4444',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            REC
          </div>

          {/* Drone center overlay */}
          {isDroneView && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.6)',
              padding: '12px 16px',
              borderRadius: 6,
              border: '1px solid rgba(0,208,233,0.3)',
              zIndex: 5
            }}>
              <div style={{ fontSize: 16, color: '#00D0E9', marginBottom: 6 }}>俯拍视角</div>
              <div style={{ fontSize: 14, color: '#64748B' }}>坐标: 110.157°E, 20.291°N</div>
            </div>
          )}

          {/* Bottom info */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#64748B',
            zIndex: 5
          }}>
            <span>{timeStr}</span>
            <span>{isDroneView ? '高度: 120m | 速度: 15km/h' : '1920×1080 | 25fps'}</span>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
