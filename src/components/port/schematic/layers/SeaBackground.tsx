// L0-L3: 海面背景效果层
import { SVG_WIDTH, SVG_HEIGHT } from '../hooks/useCoordinateMap';

export default function SeaBackground() {
  return (
    <g>
      {/* L0: 深海渐变背景 */}
      <defs>
        <linearGradient id="seaDepthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1f3d" stopOpacity={1} />
          <stop offset="50%" stopColor="#0d2847" stopOpacity={1} />
          <stop offset="100%" stopColor="#0f3152" stopOpacity={1} />
        </linearGradient>

        {/* 月光反射 */}
        <radialGradient id="moonlightGrad" cx="0.3" cy="0.2">
          <stop offset="0%" stopColor="#4da6ff" stopOpacity={0.15} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* 水波纹理噪声 */}
        <filter id="waterNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="2">
            <animate
              attributeName="baseFrequency"
              values="0.02;0.025;0.02"
              dur="8s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>

      {/* 海洋区域 */}
      <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#seaDepthGrad)" />
      <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#moonlightGrad)" />
      <rect
        x={0}
        y={0}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        filter="url(#waterNoise)"
        opacity={0.3}
      />

      {/* L2: 等深线（4条） */}
      {[20, 40, 60, 80].map((depth, i) => {
        const y = 200 + i * 100;
        return (
          <path
            key={depth}
            d={`M0,${y} Q300,${y - 5} 600,${y + 3} Q900,${y - 4} ${SVG_WIDTH},${y}`}
            fill="none"
            stroke="rgba(77,166,255,0.08)"
            strokeWidth={0.8}
            strokeDasharray="4,8"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.08;0.12;0.08"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        );
      })}

      {/* L3: 海浪波纹 */}
      <g opacity={0.15}>
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 150 + i * 70;
          return (
            <path
              key={`wave${i}`}
              d={`M0,${y} Q200,${y - 3} 400,${y} T800,${y} T${SVG_WIDTH},${y}`}
              fill="none"
              stroke="#4da6ff"
              strokeWidth={0.8}
            >
              <animate
                attributeName="d"
                values={`M0,${y} Q200,${y - 3} 400,${y} T800,${y} T${SVG_WIDTH},${y};M0,${y} Q200,${y + 3} 400,${y} T800,${y} T${SVG_WIDTH},${y};M0,${y} Q200,${y - 3} 400,${y} T800,${y} T${SVG_WIDTH},${y}`}
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
          );
        })}
      </g>
    </g>
  );
}
