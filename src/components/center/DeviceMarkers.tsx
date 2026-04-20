interface DeviceMarker {
  cx: number;
  cy: number;
  type: string;
  name: string;
  online: boolean;
  labelDir: 'top' | 'bottom' | 'left' | 'right';
}

interface DeviceMarkersProps {
  markers: readonly DeviceMarker[];
  onMarkerClick: (name: string, type: string) => void;
  getDeviceColor: (type: string) => string;
}

export default function DeviceMarkers({ markers, onMarkerClick, getDeviceColor }: DeviceMarkersProps) {
  const labelMap = {
    top:    { dx: 0, dy: -14, anchor: 'middle' as const },
    bottom: { dx: 0, dy: 22, anchor: 'middle' as const },
    left:   { dx: -14, dy: 4, anchor: 'end' as const },
    right:  { dx: 14, dy: 4, anchor: 'start' as const },
  };

  return (
    <svg
      style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 760 400"
      preserveAspectRatio="xMidYMid slice"
    >
      {markers.map((m, i) => {
        const color = m.online ? getDeviceColor(m.type) : '#4B5563';
        const labelOffset = labelMap[m.labelDir] ?? { dx: 0, dy: 18, anchor: 'middle' as const };
        return (
          <g
            key={i}
            role="button"
            aria-label={m.name}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={() => onMarkerClick(m.name, m.type)}
            onMouseEnter={(e) => {
              const halo = e.currentTarget.querySelector('.device-halo') as SVGCircleElement;
              if (halo) halo.setAttribute('opacity', '1');
            }}
            onMouseLeave={(e) => {
              const halo = e.currentTarget.querySelector('.device-halo') as SVGCircleElement;
              if (halo) halo.setAttribute('opacity', '0');
            }}
          >
            <circle className="device-halo" cx={m.cx} cy={m.cy} r={14} fill={`${color}`} opacity={0} style={{ transition: 'opacity 0.2s ease' }}>
              <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={m.cx} cy={m.cy} r={8} fill="#121A26" stroke={color} strokeWidth="2" strokeOpacity={m.online ? 1 : 0.4} />
            <circle cx={m.cx} cy={m.cy} r={3} fill={color} opacity={m.online ? 1 : 0.4} />
            <text x={m.cx + labelOffset.dx} y={m.cy + labelOffset.dy} textAnchor={labelOffset.anchor} fill={m.online ? '#C9CDD4' : '#4B5563'} fontSize="8" fontFamily="sans-serif">{m.name}</text>
            {!m.online && <line x1={m.cx - 5} y1={m.cy - 5} x2={m.cx + 5} y2={m.cy + 5} stroke="#FF4757" strokeWidth="1.5" />}
          </g>
        );
      })}
    </svg>
  );
}
