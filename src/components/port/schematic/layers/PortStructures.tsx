// L5-L6: 港口泊位、调度节点和吞吐能力标记。
import { usePortStore } from '../../../../stores/portStore';
import { geoToSvg, PORT_POSITIONS } from '../hooks/useCoordinateMap';

type PortSide = 'north' | 'south';

interface PortMarkerProps {
  lng: number;
  lat: number;
  name: string;
  color: string;
  side: PortSide;
  metric: string;
  active?: boolean;
  onClick?: () => void;
}

function PortMarker({ lng, lat, name, color, side, metric, active = false, onClick }: PortMarkerProps) {
  const [x, y] = geoToSvg(lng, lat);
  const labelY = side === 'north' ? -42 : 52;
  const platformY = side === 'north' ? -10 : 10;
  const textAnchor = side === 'north' ? 'middle' : 'middle';

  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      opacity={active ? 1 : 0.92}
    >
      <circle r={active ? 56 : 46} fill={color} opacity={active ? 0.14 : 0.08}>
        <animate attributeName="r" values={`${active ? 48 : 38};${active ? 62 : 52};${active ? 48 : 38}`} dur="3.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values={`${active ? 0.2 : 0.1};0.04;${active ? 0.2 : 0.1}`} dur="3.6s" repeatCount="indefinite" />
      </circle>

      <g transform={`translate(0 ${platformY})`}>
        <path
          d={side === 'north' ? 'M-44,-10 H32 L52,8 H-28 Z' : 'M-44,10 H32 L52,-8 H-28 Z'}
          fill="rgba(5,18,30,0.92)"
          stroke={color}
          strokeWidth={active ? 2.2 : 1.4}
          filter="url(#mapSoftGlow)"
        />
        {[-26, -8, 10, 28].map((berth, index) => (
          <line
            key={berth}
            x1={berth}
            y1={side === 'north' ? -10 : 10}
            x2={berth + 14}
            y2={side === 'north' ? -28 - index * 2 : 28 + index * 2}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.56}
          />
        ))}
        <rect x="-31" y={side === 'north' ? -6 : -2} width="54" height="6" rx="3" fill={color} opacity="0.32" />
      </g>

      <circle r="8" fill={color} stroke="#f4feff" strokeWidth="1.5" filter="url(#mapSoftGlow)" />
      <circle r="17" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 6">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
      </circle>

      <line x1="0" y1={side === 'north' ? -12 : 12} x2="0" y2={labelY + (side === 'north' ? 18 : -18)} stroke={color} strokeDasharray="3 5" opacity="0.42" />
      <g transform={`translate(0 ${labelY})`}>
        <rect x="-54" y="-17" width="108" height="34" rx="7" fill="rgba(4,15,26,0.86)" stroke={color} strokeOpacity={active ? 0.68 : 0.32} />
        <text x="0" y="-2" textAnchor={textAnchor} fill={color} fontSize="13" fontWeight="700">
          {name}
        </text>
        <text x="0" y="12" textAnchor={textAnchor} fill="rgba(226,245,255,0.68)" fontSize="10">
          {metric}
        </text>
      </g>
    </g>
  );
}

export default function PortStructures() {
  const selectedPort = usePortStore((state) => state.selectedPort);
  const setSelectedPort = usePortStore((state) => state.setSelectedPort);
  const portCapacity = usePortStore((state) => state.portCapacity);

  const northPorts = [
    {
      ...PORT_POSITIONS.xuwen,
      color: '#00D0E9',
      metric: `${portCapacity.xuwen.availableSlots}车位 / ${portCapacity.xuwen.loadRate}%`,
      portKey: 'xuwen' as const,
    },
    {
      ...PORT_POSITIONS.haianNew,
      color: '#42E8FF',
      metric: `${portCapacity.haian.availableSlots}车位 / ${portCapacity.haian.loadRate}%`,
      portKey: 'haian' as const,
    },
    {
      ...PORT_POSITIONS.yuehai,
      color: '#77E7F4',
      metric: '铁路轮渡联络',
      portKey: null,
    },
  ];

  const southPorts = [
    { ...PORT_POSITIONS.xinhai, color: '#F5A623', metric: '南岸主接卸' },
    { ...PORT_POSITIONS.xiuying, color: '#FFC55B', metric: '客滚分流' },
    { ...PORT_POSITIONS.nangang, color: '#FFDA7C', metric: '铁路南港' },
    { ...PORT_POSITIONS.macun, color: '#F6B24E', metric: '辅助锚地' },
  ];

  return (
    <g>
      {northPorts.map((port) => (
        <PortMarker
          key={port.name}
          lng={port.lng}
          lat={port.lat}
          name={port.name}
          color={port.color}
          side="north"
          metric={port.metric}
          active={port.portKey === selectedPort}
          onClick={port.portKey ? () => setSelectedPort(port.portKey) : undefined}
        />
      ))}

      {southPorts.map((port) => (
        <PortMarker
          key={port.name}
          lng={port.lng}
          lat={port.lat}
          name={port.name}
          color={port.color}
          side="south"
          metric={port.metric}
        />
      ))}
    </g>
  );
}
