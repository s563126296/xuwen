import { Plane, Maximize2 } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import Modal from '../Modal';
import VideoFeed from './video-dock/VideoFeed';
import ThumbnailStrip from './video-dock/ThumbnailStrip';

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
        <VideoFeed
          isDroneView={isDroneView}
          cameraId={currentCamera?.id}
          cameraName={currentCamera?.name}
          detectionBoxes={CAMERA_DETECTION_BOXES}
          timeStr={timeStr}
          height={110}
          gridPatternId="videoGrid"
        />

        {/* Thumbnail strip */}
        <ThumbnailStrip
          cameras={CAMERAS}
          activeChannel={channel}
          isDroneDeployed={isDroneDeployed}
          onCameraClick={handleThumbnailClick}
          onDroneClick={handleDroneThumbnailClick}
        />

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
        <VideoFeed
          isDroneView={isDroneView}
          isFullscreen
          cameraId={currentCamera?.id}
          cameraName={currentCamera?.name}
          detectionBoxes={CAMERA_DETECTION_BOXES_FULL}
          timeStr={timeStr}
          height={450}
          gridPatternId="videoGridFull"
        />
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
