// L0-L3: 海峡示意图的海面、潮流、雷达网格和等深线。
import { SVG_HEIGHT, SVG_WIDTH } from '../hooks/useCoordinateMap';

const sparklePoints = Array.from({ length: 38 }, (_, index) => ({
  x: 42 + ((index * 173) % (SVG_WIDTH - 84)),
  y: 102 + ((index * 97) % (SVG_HEIGHT - 208)),
  delay: (index % 9) * 0.42,
  radius: 1.1 + (index % 4) * 0.22,
}));

const currentBands = [
  'M-80,322 C158,274 286,374 512,318 C724,266 854,374 1280,286',
  'M-70,372 C152,428 300,310 548,378 C754,438 914,316 1278,388',
  'M-60,442 C184,390 340,484 608,430 C834,386 1002,468 1274,414',
];

export default function SeaBackground() {
  return (
    <g>
      <defs>
        <linearGradient id="seaDepthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2033" />
          <stop offset="34%" stopColor="#0b2d43" />
          <stop offset="60%" stopColor="#07324a" />
          <stop offset="100%" stopColor="#061728" />
        </linearGradient>

        <radialGradient id="straitCoreGlow" cx="0.52" cy="0.48" r="0.58">
          <stop offset="0%" stopColor="#13d9ff" stopOpacity="0.2" />
          <stop offset="42%" stopColor="#13d9ff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#13d9ff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="tidalFlowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7eeaff" stopOpacity="0" />
          <stop offset="50%" stopColor="#7eeaff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#7eeaff" stopOpacity="0" />
          <animate attributeName="x1" values="-0.8;0.6;-0.8" dur="9s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0.2;1.6;0.2" dur="9s" repeatCount="indefinite" />
        </linearGradient>

        <pattern id="seaGridPattern" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke="rgba(118,225,255,0.08)" strokeWidth="1" />
          <path d="M32 0V64 M0 32H64" fill="none" stroke="rgba(118,225,255,0.04)" strokeWidth="1" />
        </pattern>

        <filter id="mapSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="waterSurfaceNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="3" seed="12">
            <animate
              attributeName="baseFrequency"
              values="0.012 0.028;0.018 0.032;0.012 0.028"
              dur="12s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.16" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#seaDepthGrad)" />
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#straitCoreGlow)" />
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#seaGridPattern)" opacity="0.72" />
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} filter="url(#waterSurfaceNoise)" opacity="0.28" />

      <g opacity="0.9">
        {currentBands.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke="url(#tidalFlowGrad)"
            strokeWidth={index === 1 ? 18 : 11}
            strokeLinecap="round"
            opacity={index === 1 ? 0.36 : 0.22}
          />
        ))}
      </g>

      <g opacity="0.55">
        {[0, 1, 2, 3, 4].map((index) => {
          const y = 212 + index * 72;
          return (
            <path
              key={y}
              d={`M18,${y} C210,${y - 18} 370,${y + 20} 574,${y - 4} C768,${y - 28} 954,${y + 18} 1182,${y - 10}`}
              fill="none"
              stroke="rgba(162,236,255,0.16)"
              strokeWidth="1.2"
              strokeDasharray="8 16"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="24" dur={`${5 + index}s`} repeatCount="indefinite" />
            </path>
          );
        })}
      </g>

      <g opacity="0.45">
        {sparklePoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={point.radius} fill="#a7f7ff">
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              dur="3.4s"
              begin={`${point.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${point.radius};${point.radius + 1.8};${point.radius}`}
              dur="3.4s"
              begin={`${point.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      <g opacity="0.22">
        <circle cx="600" cy="350" r="168" fill="none" stroke="#8ff4ff" strokeWidth="1" strokeDasharray="2 12">
          <animateTransform attributeName="transform" type="rotate" from="0 600 350" to="360 600 350" dur="34s" repeatCount="indefinite" />
        </circle>
        <circle cx="600" cy="350" r="258" fill="none" stroke="#8ff4ff" strokeWidth="1" strokeDasharray="4 18">
          <animateTransform attributeName="transform" type="rotate" from="360 600 350" to="0 600 350" dur="48s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  );
}
