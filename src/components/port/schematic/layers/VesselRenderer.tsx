// L9-L11: AIS 船舶、尾迹、速度和选中目标。
import { usePortStore } from '../../../../stores/portStore';
import { geoToSvg } from '../hooks/useCoordinateMap';

function statusColor(status: string) {
  if (status === 'docked') return '#2ED573';
  if (status === 'waiting') return '#F5A623';
  return '#00D0E9';
}

export default function VesselRenderer() {
  const vessels = usePortStore((s) => s.vessels);
  const selectedVessel = usePortStore((s) => s.selectedVessel);
  const setSelectedVessel = usePortStore((s) => s.setSelectedVessel);

  return (
    <g>
      {vessels.map((vessel, index) => {
        const [x, y] = geoToSvg(vessel.position[0], vessel.position[1]);
        const color = statusColor(vessel.status);
        const selected = selectedVessel === vessel.id;
        const labelSide = index % 2 === 0 ? 1 : -1;

        return (
          <g
            key={vessel.id}
            onClick={() => setSelectedVessel(selected ? null : vessel.id)}
            style={{ cursor: 'pointer' }}
          >
            {vessel.trail && vessel.trail.length > 1 && (
              <path
                d={`M${vessel.trail.map(([lng, lat]) => {
                  const [trailX, trailY] = geoToSvg(lng, lat);
                  return `${trailX},${trailY}`;
                }).join(' L')}`}
                fill="none"
                stroke={color}
                strokeWidth={selected ? 3 : 2}
                opacity={selected ? 0.48 : 0.28}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={selected ? 'url(#mapSoftGlow)' : undefined}
              >
                <animate attributeName="opacity" values="0.18;0.5;0.18" dur="2.4s" repeatCount="indefinite" />
              </path>
            )}

            <circle cx={x} cy={y} r={selected ? 38 : 26} fill="none" stroke={color} strokeWidth={selected ? 1.6 : 1} opacity={selected ? 0.4 : 0.18} strokeDasharray="4 7">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur={selected ? '9s' : '15s'} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={selected ? 18 : 13} fill={color} opacity={selected ? 0.22 : 0.14} />

            <g transform={`translate(${x} ${y}) rotate(${vessel.course})`}>
              <path
                d="M0,-13 C7,-6 9,8 0,14 C-9,8 -7,-6 0,-13 Z"
                fill="rgba(2,9,18,0.88)"
                stroke={color}
                strokeWidth={selected ? 2.4 : 1.7}
                filter="url(#mapSoftGlow)"
              />
              <path d="M0,-10 C4,-5 5,5 0,10 C-5,5 -4,-5 0,-10 Z" fill={color} opacity="0.74" />
              <path d="M0,-12 L3,-3 H-3 Z" fill="#ffffff" opacity="0.36" />
              <line x1="0" y1="15" x2="0" y2="30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.62" />
            </g>

            <g transform={`translate(${x + 38 * labelSide} ${y - 18})`}>
              <line x1={-28 * labelSide} y1="10" x2={-8 * labelSide} y2="10" stroke={color} strokeOpacity="0.5" strokeDasharray="3 5" />
              <rect
                x={labelSide > 0 ? 0 : -104}
                y="-8"
                width="104"
                height={selected ? 43 : 34}
                rx="7"
                fill={selected ? 'rgba(4,18,31,0.96)' : 'rgba(4,18,31,0.78)'}
                stroke={color}
                strokeOpacity={selected ? 0.62 : 0.22}
              />
              <text
                x={labelSide > 0 ? 10 : -94}
                y="7"
                fill="#ecfbff"
                fontSize="11"
                fontWeight="700"
                textAnchor="start"
              >
                {vessel.name}
              </text>
              <text
                x={labelSide > 0 ? 10 : -94}
                y="22"
                fill={color}
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="start"
              >
                {vessel.speed}kn · ETA {vessel.eta}
              </text>
              {selected && (
                <text
                  x={labelSide > 0 ? 10 : -94}
                  y="36"
                  fill="rgba(225,245,255,0.62)"
                  fontSize="9"
                  textAnchor="start"
                >
                  去向 {vessel.destination} · 装载 {vessel.loadRate}%
                </text>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
}
