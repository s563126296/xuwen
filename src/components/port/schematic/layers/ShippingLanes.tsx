// L7-L8: 航道走廊、方向流和班轮密度。
import lanesData from '../../../../data/geo/lanes.json';
import { geoToSvg } from '../hooks/useCoordinateMap';

interface Lane {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  coordinates: [number, number][];
  frequency: number;
}

function getLaneColor(lane: Lane, index: number) {
  if (lane.type === 'primary' || index === 0) return '#00D0E9';
  if (lane.name.includes('秀英')) return '#F5A623';
  return '#8FF4FF';
}

export default function ShippingLanes() {
  const lanes = lanesData as Lane[];

  return (
    <g>
      <defs>
        {lanes.map((lane, index) => {
          const color = getLaneColor(lane, index);
          return (
            <marker
              key={lane.id}
              id={`laneArrow-${index}`}
              markerWidth="12"
              markerHeight="12"
              refX="9"
              refY="6"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M2,2 L10,6 L2,10 Z" fill={color} opacity="0.78" />
            </marker>
          );
        })}
      </defs>

      {lanes.map((lane, index) => {
        const pathPoints = lane.coordinates.map(([lng, lat]) => geoToSvg(lng, lat));
        if (pathPoints.length < 2) return null;

        const pathD = `M${pathPoints.map(([x, y]) => `${x},${y}`).join(' L')}`;
        const color = getLaneColor(lane, index);
        const isPrimary = lane.type === 'primary' || index === 0;
        const centerPoint = pathPoints[Math.floor(pathPoints.length / 2)];
        const labelOffset = index % 2 === 0 ? -20 : 22;

        return (
          <g key={lane.id}>
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={isPrimary ? 46 : 34}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isPrimary ? 0.08 : 0.055}
            />
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={isPrimary ? 24 : 17}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isPrimary ? 0.13 : 0.09}
              filter="url(#mapSoftGlow)"
            />
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth={isPrimary ? 11 : 8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.1"
              strokeDasharray="2 16"
            />
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={isPrimary ? 3.2 : 2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isPrimary ? '18 12' : '12 12'}
              markerEnd={`url(#laneArrow-${index})`}
              opacity={isPrimary ? 0.82 : 0.68}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-30" dur={isPrimary ? '2.2s' : '3s'} repeatCount="indefinite" />
            </path>

            {[0, 0.31, 0.62].map((offset, particleIndex) => (
              <g key={`${lane.id}-${particleIndex}`}>
                <circle r={isPrimary ? 3.4 : 2.7} fill={color} opacity="0.95" filter="url(#mapSoftGlow)">
                  <animateMotion
                    dur={`${Math.max(4.5, 36 / Math.max(1, lane.frequency))}s`}
                    repeatCount="indefinite"
                    path={pathD}
                    begin={`${offset * 4.2}s`}
                  />
                  <animate attributeName="opacity" values="0.35;1;0.35" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </g>
            ))}

            <g transform={`translate(${centerPoint[0]} ${centerPoint[1] + labelOffset})`}>
              <rect x="-62" y="-13" width="124" height="26" rx="7" fill="rgba(3,13,24,0.72)" stroke={color} strokeOpacity="0.26" />
              <text x="0" y="4" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
                {lane.name}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
