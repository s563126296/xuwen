// L5-L6: 港口标记和建筑
import { geoToSvg, PORT_POSITIONS } from '../hooks/useCoordinateMap';

interface PortMarkerProps {
  x: number;
  y: number;
  name: string;
  color: string;
  isXuwenSide: boolean;
  onClick?: () => void;
}

function PortMarker({ x, y, name, color, isXuwenSide, onClick }: PortMarkerProps) {
  const size = isXuwenSide ? 8 : 6;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* 雷达扫描效果 */}
      <circle cx={x} cy={y} r={30} fill="none" stroke={color} strokeWidth={1} opacity={0.15}>
        <animate attributeName="r" values="20;35;20" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* 呼吸光晕 */}
      <circle cx={x} cy={y} r={16} fill={color} opacity={0.12}>
        <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.06;0.12" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* 实心点 */}
      <circle cx={x} cy={y} r={size} fill={color} opacity={0.9} stroke="#fff" strokeWidth={1.5} />

      {/* 港口名称 */}
      <text
        x={x}
        y={y - 20}
        fill={color}
        fontSize={12}
        fontWeight={600}
        textAnchor="middle"
        style={{ textShadow: '0 0 6px rgba(0,0,0,0.8)' }}
      >
        {name}
      </text>
    </g>
  );
}

export default function PortStructures() {
  // 徐闻侧港口（主角，更大更亮）
  const xuwenPorts = [
    { ...PORT_POSITIONS.xuwen, color: '#00D0E9', isMain: true },
    { ...PORT_POSITIONS.haianNew, color: '#00D0E9', isMain: true },
    { ...PORT_POSITIONS.haian, color: 'rgba(0,208,233,0.7)', isMain: false },
    { ...PORT_POSITIONS.yuehai, color: 'rgba(0,208,233,0.7)', isMain: false },
  ];

  // 海南侧港口
  const hainanPorts = [
    { ...PORT_POSITIONS.xinhai, color: '#F5A623', isMain: true },
    { ...PORT_POSITIONS.xiuying, color: '#F5A623', isMain: true },
    { ...PORT_POSITIONS.nangang, color: 'rgba(245,166,35,0.7)', isMain: false },
    { ...PORT_POSITIONS.macun, color: 'rgba(245,166,35,0.7)', isMain: false },
  ];

  return (
    <g>
      {/* 徐闻侧港口 */}
      {xuwenPorts.map((port) => {
        const [x, y] = geoToSvg(port.lng, port.lat);
        return (
          <PortMarker
            key={port.name}
            x={x}
            y={y}
            name={port.name}
            color={port.color}
            isXuwenSide={true}
          />
        );
      })}

      {/* 海南侧港口 */}
      {hainanPorts.map((port) => {
        const [x, y] = geoToSvg(port.lng, port.lat);
        return (
          <PortMarker
            key={port.name}
            x={x}
            y={y}
            name={port.name}
            color={port.color}
            isXuwenSide={false}
          />
        );
      })}
    </g>
  );
}
