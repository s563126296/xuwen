interface DroneOverlayProps {
  isFullscreen?: boolean;
}

export default function DroneOverlay({ isFullscreen = false }: DroneOverlayProps) {
  const crosshairStrokeWidth = isFullscreen ? 1.5 : 1;
  const roadTop = isFullscreen ? '28%' : '25%';
  const roadLeft = isFullscreen ? '18%' : '15%';
  const roadWidth = isFullscreen ? '64%' : '70%';
  const roadHeight = isFullscreen ? '42%' : '45%';
  const roadBorderRadius = isFullscreen ? 6 : 4;
  const lineHeight = isFullscreen ? 3 : 2;
  const linePattern = isFullscreen
    ? 'repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 14px, transparent 14px, transparent 28px)'
    : 'repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 8px, transparent 8px, transparent 16px)';

  const statsFontSize = isFullscreen ? 13 : 9;
  const statsBottom = isFullscreen ? 20 : 8;
  const statsPadding = isFullscreen ? '6px 14px' : '3px 6px';
  const statsRadius = isFullscreen ? 4 : 3;

  const tempFontSize = isFullscreen ? 14 : 10;
  const tempTop = isFullscreen ? 16 : 8;
  const tempRight = isFullscreen ? 80 : 50;
  const tempPadding = isFullscreen ? '6px 12px' : '3px 6px';
  const tempRadius = isFullscreen ? 4 : 3;

  const overlayFontSize = isFullscreen ? 16 : 11;
  const overlaySubFontSize = isFullscreen ? 14 : 10;
  const overlayPadding = isFullscreen ? '12px 16px' : '8px 12px';
  const overlayRadius = isFullscreen ? 6 : 4;
  const overlayMarginBottom = isFullscreen ? 6 : 4;

  return (
    <>
      {/* Crosshair */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <line x1="50%" y1="50%" x2="50%" y2={isFullscreen ? "25%" : "30%"} stroke="rgba(74,144,217,0.6)" strokeWidth={crosshairStrokeWidth} />
        <line x1="50%" y1="50%" x2="50%" y2={isFullscreen ? "75%" : "70%"} stroke="rgba(74,144,217,0.6)" strokeWidth={crosshairStrokeWidth} />
        <line x1="50%" y1="50%" x2={isFullscreen ? "25%" : "30%"} y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth={crosshairStrokeWidth} />
        <line x1="50%" y1="50%" x2={isFullscreen ? "75%" : "70%"} y2="50%" stroke="rgba(74,144,217,0.6)" strokeWidth={crosshairStrokeWidth} />
      </svg>

      {/* Road layer */}
      <div style={{
        position: 'absolute',
        top: roadTop,
        left: roadLeft,
        width: roadWidth,
        height: roadHeight,
        background: '#2A2A2A',
        borderRadius: roadBorderRadius,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: lineHeight,
          background: linePattern
        }} />
      </div>

      {/* AI stats */}
      <div style={{
        position: 'absolute',
        bottom: statsBottom,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: statsFontSize,
        color: '#94A3B8',
        background: 'rgba(0,0,0,0.8)',
        padding: statsPadding,
        borderRadius: statsRadius,
        whiteSpace: 'nowrap',
        zIndex: 4,
        pointerEvents: 'none'
      }}>
        小汽车 12 | 货车 5 | 冷链 2 | 危化品 0
      </div>

      {/* Temperature */}
      <div style={{
        position: 'absolute',
        top: tempTop,
        right: tempRight,
        fontSize: tempFontSize,
        color: '#F5A623',
        background: 'rgba(0,0,0,0.6)',
        padding: tempPadding,
        borderRadius: tempRadius,
        zIndex: 4,
        pointerEvents: 'none'
      }}>
        32°C
      </div>

      {/* Center overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.6)',
        padding: overlayPadding,
        borderRadius: overlayRadius,
        border: '1px solid rgba(0,208,233,0.3)',
        zIndex: 5
      }}>
        <div style={{ fontSize: overlayFontSize, color: '#00D0E9', marginBottom: overlayMarginBottom }}>俯拍视角</div>
        <div style={{ fontSize: overlaySubFontSize, color: '#64748B' }}>坐标: 110.157°E, 20.291°N</div>
      </div>
    </>
  );
}

