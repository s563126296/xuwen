import DetectionBoxes from './DetectionBoxes';
import DroneOverlay from './DroneOverlay';

interface DetectionBox {
  top: string;
  left: string;
  width: number;
  height: number;
  color: string;
  label: string;
  speed: string;
}

interface VideoFeedProps {
  isDroneView: boolean;
  isFullscreen?: boolean;
  cameraId?: string;
  cameraName?: string;
  detectionBoxes: DetectionBox[];
  timeStr: string;
  height: number;
  gridPatternId: string;
}

export default function VideoFeed({
  isDroneView,
  isFullscreen = false,
  cameraId,
  cameraName,
  detectionBoxes,
  timeStr,
  height,
  gridPatternId,
}: VideoFeedProps) {
  const labelPadding = isFullscreen ? '4px 12px' : '2px 6px';
  const labelFontSize = isFullscreen ? 14 : 10;
  const labelTop = isFullscreen ? 16 : 8;
  const labelLeft = isFullscreen ? 16 : 8;
  const labelRadius = isFullscreen ? 4 : 3;

  const recTop = isFullscreen ? 16 : 8;
  const recRight = isFullscreen ? 16 : 8;
  const recFontSize = isFullscreen ? 14 : 10;
  const recDotSize = isFullscreen ? 8 : 6;
  const recGap = isFullscreen ? 6 : 4;

  const bottomPad = isFullscreen ? 16 : 8;
  const bottomFontSize = isFullscreen ? 13 : 10;

  const detectionLabelFontSize = isFullscreen ? 12 : 9;
  const detectionSpeedFontSize = isFullscreen ? 11 : 8;
  const detectionLabelOffset = isFullscreen ? -22 : -20;
  const detectionSpeedOffset = isFullscreen ? -22 : -18;
  const detectionPadding = isFullscreen ? '3px 8px' : '2px 5px';

  const topLabel = isDroneView
    ? 'UAV-01'
    : isFullscreen
      ? `${cameraId?.toUpperCase()} ${cameraName}`
      : cameraId?.toUpperCase();

  return (
    <div style={{
      position: 'relative',
      height,
      borderRadius: 6,
      background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 100%)',
      border: isFullscreen ? undefined : '1px solid rgba(0,208,233,0.15)',
      overflow: 'hidden',
      width: isFullscreen ? '100%' : undefined,
    }}>
      {/* Scanline */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: isDroneView ? 'rgba(74,144,217,0.5)' : 'rgba(0,208,233,0.6)',
        animation: 'scanline 3s linear infinite',
        boxShadow: isDroneView ? '0 0 10px rgba(74,144,217,0.8)' : '0 0 10px rgba(0,208,233,0.8)',
        zIndex: 2, pointerEvents: 'none'
      }} />

      {/* Grid overlay */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15, zIndex: 1, pointerEvents: 'none' }}>
        <defs>
          <pattern id={gridPatternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,208,233,0.3)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
      </svg>

      {/* Camera mode: AI detection boxes */}
      {!isDroneView && (
        <DetectionBoxes
          boxes={detectionBoxes}
          labelFontSize={detectionLabelFontSize}
          speedFontSize={detectionSpeedFontSize}
          labelOffset={detectionLabelOffset}
          speedOffset={detectionSpeedOffset}
          padding={detectionPadding}
        />
      )}

      {/* Drone mode overlay */}
      {isDroneView && <DroneOverlay isFullscreen={isFullscreen} />}

      {/* Top-left label */}
      <div style={{
        position: 'absolute',
        top: labelTop, left: labelLeft,
        padding: labelPadding,
        background: 'rgba(0,208,233,0.9)',
        borderRadius: labelRadius,
        fontSize: labelFontSize, fontWeight: 600,
        color: '#0A0F19', zIndex: 5
      }}>
        {topLabel}
      </div>

      {/* Top-right REC indicator */}
      <div style={{
        position: 'absolute',
        top: recTop, right: recRight,
        display: 'flex', alignItems: 'center', gap: recGap,
        fontSize: recFontSize, fontWeight: 600,
        color: '#EF4444', zIndex: 5
      }}>
        <div style={{
          width: recDotSize, height: recDotSize,
          borderRadius: '50%', background: '#EF4444',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        REC
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute',
        bottom: bottomPad, left: bottomPad, right: bottomPad,
        display: 'flex', justifyContent: 'space-between',
        fontSize: bottomFontSize, color: '#64748B', zIndex: 5
      }}>
        <span>{timeStr}</span>
        <span>{isDroneView ? '高度: 120m | 速度: 15km/h' : '1920×1080 | 25fps'}</span>
      </div>
    </div>
  );
}

