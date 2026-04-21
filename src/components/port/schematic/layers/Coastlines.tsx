// L4: 海岸线轮廓
import { geoToSvg } from '../hooks/useCoordinateMap';

export default function Coastlines() {
  // 徐闻侧海岸线（简化轮廓）
  const xuwenCoast = [
    [109.98, 20.30],
    [110.05, 20.29],
    [110.10, 20.27],
    [110.13, 20.25], // 徐闻港附近
    [110.18, 20.28],
    [110.22, 20.29], // 海安新港附近
    [110.26, 20.28],
    [110.32, 20.27],
  ]
    .map(([lng, lat]) => geoToSvg(lng, lat))
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  // 海南侧海岸线
  const hainanCoast = [
    [109.98, 19.94],
    [110.05, 19.95],
    [110.10, 19.98],
    [110.15, 20.05], // 新海港附近
    [110.20, 20.04],
    [110.25, 20.03],
    [110.28, 20.02], // 秀英港附近
    [110.32, 20.00],
  ]
    .map(([lng, lat]) => geoToSvg(lng, lat))
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <g>
      {/* 徐闻侧陆地 */}
      <polyline
        points={xuwenCoast}
        fill="none"
        stroke="#1a3a52"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polyline
        points={xuwenCoast}
        fill="none"
        stroke="rgba(0,208,233,0.3)"
        strokeWidth={1}
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-opacity"
          values="0.3;0.5;0.3"
          dur="4s"
          repeatCount="indefinite"
        />
      </polyline>

      {/* 海南侧陆地 */}
      <polyline
        points={hainanCoast}
        fill="none"
        stroke="#1a3a52"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polyline
        points={hainanCoast}
        fill="none"
        stroke="rgba(0,208,233,0.3)"
        strokeWidth={1}
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-opacity"
          values="0.3;0.5;0.3"
          dur="4s"
          repeatCount="indefinite"
        />
      </polyline>

      {/* 陆地标签 */}
      <text
        x={200}
        y={80}
        fill="#4da6ff"
        fontSize={18}
        fontWeight="bold"
        opacity={0.6}
        letterSpacing={2}
      >
        徐闻县
      </text>
      <text
        x={200}
        y={650}
        fill="#4da6ff"
        fontSize={18}
        fontWeight="bold"
        opacity={0.6}
        letterSpacing={2}
      >
        海南岛
      </text>
    </g>
  );
}
