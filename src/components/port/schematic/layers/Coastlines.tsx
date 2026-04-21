// L4: 仿真陆域、港区道路和待渡缓冲区。该图层是示意表达，不接入真实地图底图。
import { SVG_HEIGHT, SVG_WIDTH } from '../hooks/useCoordinateMap';

const northLand =
  'M-40,0 H1240 V112 C1114,124 1062,102 956,118 C836,136 794,116 684,128 C552,142 504,108 392,128 C292,146 246,118 142,138 C74,150 24,142 -40,156 Z';

const southLand =
  `M-40,${SVG_HEIGHT} H1240 V558 C1126,548 1058,566 948,548 C840,530 786,566 678,552 C546,534 474,574 348,554 C248,538 166,556 62,540 C20,534 -10,538 -40,546 Z`;

const roads = [
  { d: 'M90,74 C210,82 286,110 390,116 C496,122 562,108 676,112 C782,116 842,92 954,94 C1032,96 1104,112 1180,102', label: 'G207 港区联络走廊', x: 934, y: 82 },
  { d: 'M116,612 C238,594 342,622 474,606 C584,594 654,616 758,602 C870,586 996,604 1138,586', label: '南岸疏港承接走廊', x: 878, y: 626 },
  { d: 'M248,128 C254,172 238,198 214,222', label: '徐闻港闸口', x: 192, y: 210 },
  { d: 'M526,116 C540,156 558,182 590,204', label: '海安新港闸口', x: 616, y: 190 },
];

const waitingAreas = [
  { x: 94, y: 86, width: 128, height: 40, label: '徐闻待渡区' },
  { x: 646, y: 76, width: 136, height: 42, label: '海安缓冲区' },
  { x: 250, y: 584, width: 122, height: 36, label: '新海接驳区' },
  { x: 864, y: 572, width: 132, height: 38, label: '秀英消化区' },
];

function WaitingArea({ x, y, width, height, label }: (typeof waitingAreas)[number]) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} rx="6" fill="rgba(8,25,39,0.72)" stroke="rgba(0,208,233,0.26)" />
      <path d={`M10,${height - 10} H${width - 10}`} stroke="rgba(0,208,233,0.2)" strokeDasharray="5 5" />
      <g opacity="0.72">
        {[0, 1, 2, 3, 4].map((index) => (
          <rect key={index} x={14 + index * 20} y="12" width="12" height="7" rx="2" fill={index < 3 ? '#00d0e9' : '#f5a623'} />
        ))}
      </g>
      <text x={width / 2} y={height + 16} textAnchor="middle" fill="rgba(216,241,250,0.66)" fontSize="12">
        {label}
      </text>
    </g>
  );
}

export default function Coastlines() {
  return (
    <g>
      <defs>
        <linearGradient id="northLandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#122238" />
          <stop offset="62%" stopColor="#18334a" />
          <stop offset="100%" stopColor="#0b1d2e" />
        </linearGradient>
        <linearGradient id="southLandGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#101d31" />
          <stop offset="58%" stopColor="#173349" />
          <stop offset="100%" stopColor="#0a1b2b" />
        </linearGradient>
        <linearGradient id="coastLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00d0e9" stopOpacity="0" />
          <stop offset="45%" stopColor="#00d0e9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f5a623" stopOpacity="0.36" />
        </linearGradient>
      </defs>

      <path d={northLand} fill="url(#northLandGrad)" />
      <path d={southLand} fill="url(#southLandGrad)" />

      <path d="M-30,156 C76,142 134,152 220,134 C322,112 392,148 502,126 C600,108 668,142 786,122 C896,104 980,132 1084,116 C1140,108 1188,116 1232,110" fill="none" stroke="url(#coastLineGrad)" strokeWidth="3" filter="url(#mapSoftGlow)" />
      <path d="M-30,546 C72,536 146,558 252,542 C346,528 432,570 544,546 C664,520 740,568 852,546 C972,522 1058,564 1232,552" fill="none" stroke="url(#coastLineGrad)" strokeWidth="3" filter="url(#mapSoftGlow)" />

      <g opacity="0.82">
        {roads.map((road) => (
          <g key={road.label}>
            <path d={road.d} fill="none" stroke="rgba(13,20,32,0.8)" strokeWidth="10" strokeLinecap="round" />
            <path d={road.d} fill="none" stroke="rgba(143,244,255,0.36)" strokeWidth="2" strokeLinecap="round" strokeDasharray="12 10">
              <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="4s" repeatCount="indefinite" />
            </path>
            <text x={road.x} y={road.y} fill="rgba(221,244,252,0.56)" fontSize="12" textAnchor="middle">
              {road.label}
            </text>
          </g>
        ))}
      </g>

      <g>{waitingAreas.map((area) => <WaitingArea key={area.label} {...area} />)}</g>

      <text x="48" y="44" fill="#d7f8ff" fontSize="22" fontWeight="700" opacity="0.9">
        徐闻北岸港群
      </text>
      <text x={SVG_WIDTH - 52} y={SVG_HEIGHT - 42} textAnchor="end" fill="#ffe4b5" fontSize="22" fontWeight="700" opacity="0.86">
        海口南岸港群
      </text>
      <text x="608" y="292" textAnchor="middle" fill="rgba(222,249,255,0.2)" fontSize="42" fontWeight="700" letterSpacing="10">
        QIONGZHOU STRAIT
      </text>
    </g>
  );
}
