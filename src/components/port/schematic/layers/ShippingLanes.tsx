// L7-L8: 航线层（有宽度的航道 + 流动粒子）
import lanesData from '../../../../data/geo/lanes.json';
import { geoToSvg, LANE_COLORS } from '../hooks/useCoordinateMap';

interface Lane {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  coordinates: [number, number][];
  frequency: number;
}

export default function ShippingLanes() {
  const lanes = lanesData as Lane[];

  return (
    <g>
      {lanes.map((lane) => {
        const pathPoints = lane.coordinates.map(([lng, lat]) => geoToSvg(lng, lat));
        const pathD = `M${pathPoints.map(([x, y]) => `${x},${y}`).join(' L')}`;
        const color = lane.type === 'primary' ? LANE_COLORS.primary : LANE_COLORS.secondary;
        const width = lane.type === 'primary' ? 3 : 2;

        return (
          <g key={lane.id}>
            {/* 航道光晕 */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={width * 4}
              opacity={0.08}
            />

            {/* 虚线中心线 */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={width}
              strokeDasharray="12,6"
              opacity={0.6}
            />

            {/* 流动粒子 */}
            <circle r={2} fill={color} opacity={0.8}>
              <animateMotion dur={`${30 / lane.frequency}s`} repeatCount="indefinite" path={pathD} />
            </circle>

            {/* 航线标注（在中点） */}
            {pathPoints.length > 0 && (
              <text
                x={pathPoints[Math.floor(pathPoints.length / 2)][0]}
                y={pathPoints[Math.floor(pathPoints.length / 2)][1] - 10}
                fill={color}
                fontSize={9}
                opacity={0.5}
                textAnchor="middle"
              >
                {lane.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
