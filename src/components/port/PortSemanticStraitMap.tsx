import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Anchor, Ship } from 'lucide-react';
import { usePortStore, type PortVessel } from '../../stores/portStore';
import './port-semantic-strait-map.css';

type Tone = 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'muted';
type PortNodeId = 'xuwen' | 'haian' | 'xinhai' | 'xiuying' | 'nangang' | 'beigang' | 'macun';
type Focus =
  | { type: 'port'; id: PortNodeId }
  | { type: 'vessel'; id: string };

interface NodeDef {
  id: PortNodeId;
  label: string;
  short: string;
  x: number;
  y: number;
  tone: Tone;
  role: string;
  side: 'north' | 'south';
}

interface LaneDef {
  id: string;
  label: string;
  from: PortNodeId;
  to: PortNodeId;
  path: string;
  tone: Tone;
  width: number;
  status: string;
  flow: string;
  labelX: number;
  labelY: number;
  active?: boolean;
  dashed?: boolean;
}

interface VesselPoint {
  vessel: PortVessel;
  x: number;
  y: number;
  angle: number;
  tone: Tone;
}

const NODES: NodeDef[] = [
  { id: 'beigang', label: '粤海铁路北港', short: '铁', x: 280, y: 162, tone: 'blue', role: '铁路轮渡', side: 'north' },
  { id: 'xuwen', label: '徐闻港', short: '徐', x: 575, y: 146, tone: 'cyan', role: '北岸主港', side: 'north' },
  { id: 'haian', label: '海安新港', short: '海', x: 1115, y: 158, tone: 'amber', role: '北岸分流', side: 'north' },
  { id: 'macun', label: '马村港', short: '马', x: 205, y: 592, tone: 'muted', role: '辅助锚地', side: 'south' },
  { id: 'nangang', label: '南港码头', short: '南', x: 468, y: 602, tone: 'blue', role: '铁路南港', side: 'south' },
  { id: 'xinhai', label: '新海港', short: '新', x: 705, y: 578, tone: 'green', role: '南岸主接卸', side: 'south' },
  { id: 'xiuying', label: '秀英港', short: '秀', x: 1325, y: 575, tone: 'green', role: '客滚分流', side: 'south' },
];

const NODE_BY_ID = Object.fromEntries(NODES.map((node) => [node.id, node])) as Record<NodeDef['id'], NodeDef>;

const LANE_PATHS: Record<string, string> = {
  'xuwen-xinhai': 'M575,184 C558,286 603,438 705,548',
  'haian-xiuying': 'M1115,196 C1155,300 1225,455 1325,545',
  'beigang-nangang': 'M280,198 C278,338 350,520 468,572',
  'xuwen-macun': 'M548,178 C450,270 328,455 205,562',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function vesselTone(status: PortVessel['status']): Tone {
  if (status === 'waiting') return 'amber';
  if (status === 'docked') return 'green';
  return 'cyan';
}

function pointOnCubic(
  start: [number, number],
  c1: [number, number],
  c2: [number, number],
  end: [number, number],
  t: number,
) {
  const u = 1 - t;
  const x = (u ** 3) * start[0] + 3 * (u ** 2) * t * c1[0] + 3 * u * (t ** 2) * c2[0] + (t ** 3) * end[0];
  const y = (u ** 3) * start[1] + 3 * (u ** 2) * t * c1[1] + 3 * u * (t ** 2) * c2[1] + (t ** 3) * end[1];
  return { x, y };
}

function lanePosition(laneId: string, progress: number) {
  const p = clamp(progress, 0, 1);
  if (laneId === 'haian-xiuying') {
    const curr = pointOnCubic([1115, 196], [1155, 300], [1225, 455], [1325, 545], p);
    const next = pointOnCubic([1115, 196], [1155, 300], [1225, 455], [1325, 545], clamp(p + 0.02, 0, 1));
    return { ...curr, angle: Math.atan2(next.y - curr.y, next.x - curr.x) * 180 / Math.PI + 90 };
  }
  if (laneId === 'haian-nangang') {
    const curr = pointOnCubic([280, 198], [278, 338], [350, 520], [468, 572], p);
    const next = pointOnCubic([280, 198], [278, 338], [350, 520], [468, 572], clamp(p + 0.02, 0, 1));
    return { ...curr, angle: Math.atan2(next.y - curr.y, next.x - curr.x) * 180 / Math.PI + 90 };
  }
  const curr = pointOnCubic([575, 184], [558, 286], [603, 438], [705, 548], p);
  const next = pointOnCubic([575, 184], [558, 286], [603, 438], [705, 548], clamp(p + 0.02, 0, 1));
  return { ...curr, angle: Math.atan2(next.y - curr.y, next.x - curr.x) * 180 / Math.PI + 90 };
}

function activeFocus(selectedPort: string | null, selectedVessel: string | null): Focus | null {
  if (selectedVessel) return { type: 'vessel', id: selectedVessel };
  if (selectedPort === 'xuwen' || selectedPort === 'haian') return { type: 'port', id: selectedPort };
  return null;
}

function formatInt(value: number) {
  return value.toLocaleString('zh-CN');
}

export default function PortSemanticStraitMap() {
  const rootRef = useRef<HTMLElement>(null);
  const [inspectorPosition, setInspectorPosition] = useState<{ x: number; y: number } | null>(null);
  const weather = usePortStore((s) => s.weather);
  const portCapacity = usePortStore((s) => s.portCapacity);
  const vessels = usePortStore((s) => s.vessels);
  const queue = usePortStore((s) => s.queue);
  const crossingStats = usePortStore((s) => s.crossingStats);
  const selectedVessel = usePortStore((s) => s.selectedVessel);
  const setSelectedVessel = usePortStore((s) => s.setSelectedVessel);
  const selectedPort = usePortStore((s) => s.selectedPort);
  const setSelectedPort = usePortStore((s) => s.setSelectedPort);

  const focus = activeFocus(selectedPort, selectedVessel);
  const activeVessel = focus?.type === 'vessel' ? vessels.find((v) => v.id === focus.id) : null;
  const activePort = focus?.type === 'port' ? NODE_BY_ID[focus.id] : null;
  const queueTone: Tone = queue.estimatedWait >= 90 ? 'red' : queue.estimatedWait >= 60 ? 'amber' : 'cyan';

  const laneDefs = useMemo<LaneDef[]>(() => {
    const xuwenLoad = portCapacity.xuwen.loadRate;
    const haianLoad = portCapacity.haian.loadRate;
    return [
      {
        id: 'xuwen-xinhai',
        label: '徐闻港 → 新海港',
        from: 'xuwen',
        to: 'xinhai',
        path: LANE_PATHS['xuwen-xinhai'],
        tone: 'cyan',
        width: 15,
        status: `装载 ${xuwenLoad}% · ${portCapacity.xuwen.availableSlots} 车位`,
        flow: `${formatInt(Math.round(crossingStats.todayTotal * 0.58))} 辆`,
        labelX: 492,
        labelY: 337,
        active: selectedPort === 'xuwen',
      },
      {
        id: 'haian-xiuying',
        label: '海安新港 → 秀英港',
        from: 'haian',
        to: 'xiuying',
        path: LANE_PATHS['haian-xiuying'],
        tone: 'amber',
        width: 11,
        status: `装载 ${haianLoad}% · ${portCapacity.haian.availableSlots} 车位`,
        flow: `${formatInt(Math.round(crossingStats.todayTotal * 0.34))} 辆`,
        labelX: 1288,
        labelY: 386,
        active: selectedPort === 'haian',
      },
      {
        id: 'beigang-nangang',
        label: '粤海铁路轮渡',
        from: 'beigang',
        to: 'nangang',
        path: LANE_PATHS['beigang-nangang'],
        tone: 'blue',
        width: 8,
        status: '铁路轮渡 · 稳定',
        flow: `${formatInt(Math.round(crossingStats.todayTotal * 0.08))} 辆`,
        labelX: 368,
        labelY: 502,
        dashed: true,
      },
      {
        id: 'xuwen-macun',
        label: '辅助锚地联络',
        from: 'xuwen',
        to: 'macun',
        path: LANE_PATHS['xuwen-macun'],
        tone: 'muted',
        width: 5,
        status: '备用通道',
        flow: '低频',
        labelX: 300,
        labelY: 300,
        dashed: true,
      },
    ];
  }, [crossingStats.todayTotal, portCapacity, selectedPort]);

  const vesselPoints = useMemo<VesselPoint[]>(() => vessels.map((vessel) => {
    const pos = lanePosition(vessel.laneId, vessel.progress);
    return {
      vessel,
      x: pos.x,
      y: pos.y,
      angle: pos.angle,
      tone: vesselTone(vessel.status),
    };
  }), [vessels]);

  const pressureRadius = clamp(42 + queue.estimatedWait * 0.42, 58, 92);
  const riskForecast = weather.forecast.filter((item) => item.windLevel >= 6 || item.visibility <= 9.5);

  const placeInspector = (event: ReactMouseEvent<SVGGElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setInspectorPosition({
      x: clamp(event.clientX - rect.left + 14, 14, rect.width - 282),
      y: clamp(event.clientY - rect.top + 14, 58, rect.height - 146),
    });
  };

  const clearFocus = () => {
    setSelectedPort(null);
    setSelectedVessel(null);
    setInspectorPosition(null);
  };

  return (
    <section ref={rootRef} className="port-semantic-map" aria-label="琼州海峡港航态势图" onClick={clearFocus}>
      <svg
        viewBox="0 0 1600 720"
        preserveAspectRatio="xMidYMid slice"
        className="port-semantic-map__svg"
        role="img"
        aria-label="琼州海峡南北岸港航拓扑"
      >
        <defs>
          <linearGradient id="portSemanticSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071A2A" />
            <stop offset="52%" stopColor="#082438" />
            <stop offset="100%" stopColor="#07111F" />
          </linearGradient>
          <linearGradient id="portSemanticLandNorth" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#101D2E" />
            <stop offset="54%" stopColor="#12283B" />
            <stop offset="100%" stopColor="#101D2E" />
          </linearGradient>
          <linearGradient id="portSemanticLandSouth" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#16202C" />
            <stop offset="50%" stopColor="#1B2B31" />
            <stop offset="100%" stopColor="#15202C" />
          </linearGradient>
          <pattern id="portSemanticGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="rgba(151,232,255,0.052)" strokeWidth="1" />
            <path d="M40 0V80 M0 40H80" fill="none" stroke="rgba(151,232,255,0.026)" strokeWidth="1" />
          </pattern>
          <filter id="portSemanticGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="portSemanticSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="13" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1600" height="720" fill="url(#portSemanticSea)" />
        <rect width="1600" height="720" fill="url(#portSemanticGrid)" />

        <g className="port-semantic-map__sea-field">
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              d={`M80,${260 + index * 62} C330,${236 + index * 60} 590,${294 + index * 46} 810,${262 + index * 58} C1060,${228 + index * 66} 1270,${305 + index * 48} 1510,${266 + index * 58}`}
            />
          ))}
        </g>

        <path
          className="port-semantic-map__land port-semantic-map__land--north"
          d="M0,0 H1600 V126 C1435,114 1324,130 1195,116 C1025,98 910,133 760,111 C615,90 478,128 334,109 C205,93 105,116 0,104 Z"
          fill="url(#portSemanticLandNorth)"
        />
        <path
          className="port-semantic-map__coast port-semantic-map__coast--north"
          d="M0,104 C105,116 205,93 334,109 C478,128 615,90 760,111 C910,133 1025,98 1195,116 C1324,130 1435,114 1600,126"
        />
        <path
          className="port-semantic-map__land port-semantic-map__land--south"
          d="M0,720 V628 C145,614 250,648 405,622 C560,596 710,631 850,612 C1030,588 1165,620 1338,598 C1455,584 1538,602 1600,590 V720 Z"
          fill="url(#portSemanticLandSouth)"
        />
        <path
          className="port-semantic-map__coast port-semantic-map__coast--south"
          d="M0,628 C145,614 250,648 405,622 C560,596 710,631 850,612 C1030,588 1165,620 1338,598 C1455,584 1538,602 1600,590"
        />

        <text x="44" y="96" className="port-semantic-map__shore-label">徐闻北岸</text>
        <text x="1548" y="644" textAnchor="end" className="port-semantic-map__shore-label port-semantic-map__shore-label--south">海口南岸</text>
        <text x="800" y="392" textAnchor="middle" className="port-semantic-map__watermark">琼州海峡</text>

        {riskForecast.length > 0 && (
          <g className="port-semantic-map__risk-zone is-amber">
            <path d="M325,265 C520,210 765,238 940,288 C1115,338 1288,328 1450,274 C1338,430 1162,510 930,488 C682,465 487,410 325,265 Z" />
            <text x="1075" y="474">未来窗口风浪抬升 · {riskForecast[0].hour}时起关注</text>
          </g>
        )}

        {laneDefs.map((lane) => (
          <g
            key={lane.id}
            className={`port-semantic-map__lane is-${lane.tone} ${lane.active ? 'is-active' : ''} ${lane.dashed ? 'is-dashed' : ''}`}
          >
            <path d={lane.path} className="port-semantic-map__lane-glow" strokeWidth={lane.width + 18} />
            <path d={lane.path} className="port-semantic-map__lane-track" strokeWidth={lane.width} />
            <path d={lane.path} className="port-semantic-map__lane-core" strokeWidth={Math.max(2, lane.width * 0.24)} />
            <g transform={`translate(${lane.labelX} ${lane.labelY})`} className="port-semantic-map__lane-label">
              <rect x="-86" y="-20" width="172" height="42" rx="6" />
              <text y="-4" textAnchor="middle">{lane.label}</text>
              <text y="13" textAnchor="middle">{lane.status}</text>
            </g>
            <g transform={`translate(${NODE_BY_ID[lane.from].x * 0.5 + NODE_BY_ID[lane.to].x * 0.5} ${NODE_BY_ID[lane.from].y * 0.5 + NODE_BY_ID[lane.to].y * 0.5})`} className="port-semantic-map__flow-badge">
              <rect x="-38" y="-13" width="76" height="26" rx="13" />
              <text y="4" textAnchor="middle">{lane.flow}</text>
            </g>
          </g>
        ))}

        <g className={`port-semantic-map__pressure-zone is-${queueTone}`}>
          <circle cx="575" cy="146" r={pressureRadius} />
          <circle cx="575" cy="146" r={pressureRadius * 0.72} />
          <text x="575" y={146 + pressureRadius + 28} textAnchor="middle">
            待渡 {formatInt(queue.totalVehicles)} 辆 · {queue.estimatedWait} 分钟
          </text>
        </g>

        {NODES.map((node) => {
          const isSelected = focus?.type === 'port' && focus.id === node.id;
          const managedPort = node.id === 'xuwen' || node.id === 'haian' ? node.id : null;
          const isManaged = managedPort !== null;
          const capacity = node.id === 'xuwen' ? portCapacity.xuwen : node.id === 'haian' ? portCapacity.haian : null;
          return (
            <g
              key={node.id}
              className={`port-semantic-map__node is-${node.tone} ${isSelected ? 'is-selected' : ''} ${isManaged ? 'is-clickable' : ''}`}
              transform={`translate(${node.x} ${node.y})`}
              onClick={(event) => {
                if (!managedPort) return;
                event.stopPropagation();
                placeInspector(event);
                setSelectedVessel(null);
                setSelectedPort(selectedPort === managedPort ? null : managedPort);
              }}
              role={isManaged ? 'button' : undefined}
              tabIndex={isManaged ? 0 : undefined}
              onKeyDown={(event) => {
                if (!managedPort || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                setSelectedVessel(null);
                setSelectedPort(selectedPort === managedPort ? null : managedPort);
              }}
            >
              <circle className="port-semantic-map__node-range" r={node.side === 'north' ? 38 : 31} />
              <circle className="port-semantic-map__node-core" r={node.side === 'north' ? 18 : 15} />
              <text className="port-semantic-map__node-short" y="5" textAnchor="middle">{node.short}</text>
              <line className="port-semantic-map__node-pin" x1="0" y1={node.side === 'north' ? 23 : -21} x2="0" y2={node.side === 'north' ? 48 : -46} />
              <g transform={`translate(0 ${node.side === 'north' ? 69 : -66})`} className="port-semantic-map__node-label">
                <rect x="-66" y="-20" width="132" height="42" rx="6" />
                <text y="-4" textAnchor="middle">{node.label}</text>
                <text y="13" textAnchor="middle">{capacity ? `${capacity.availableSlots}车位 · ${capacity.loadRate}%` : node.role}</text>
              </g>
            </g>
          );
        })}

        {vesselPoints.map(({ vessel, x, y, angle, tone }) => {
          const isSelected = selectedVessel === vessel.id;
          return (
            <g
              key={vessel.id}
              className={`port-semantic-map__vessel is-${tone} ${isSelected ? 'is-selected' : ''}`}
              transform={`translate(${x} ${y})`}
              onClick={(event) => {
                event.stopPropagation();
                placeInspector(event);
                setSelectedPort(null);
                setSelectedVessel(selectedVessel === vessel.id ? null : vessel.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                setSelectedPort(null);
                setSelectedVessel(selectedVessel === vessel.id ? null : vessel.id);
              }}
            >
              <circle className="port-semantic-map__vessel-wake" r={isSelected ? 25 : 17} />
              <path
                className="port-semantic-map__vessel-shape"
                d="M0,-14 L9,10 L0,6 L-9,10 Z"
                transform={`rotate(${angle})`}
              />
              {isSelected && (
                <g transform="translate(0 -31)" className="port-semantic-map__vessel-label">
                  <rect x="-52" y="-15" width="104" height="30" rx="6" />
                  <text y="4" textAnchor="middle">{vessel.name}</text>
                </g>
              )}
            </g>
          );
        })}

        <g className="port-semantic-map__time-window">
          <line x1="1010" y1="100" x2="1470" y2="100" />
          {weather.forecast.slice(0, 6).map((item, index) => {
            const x = 1030 + index * 82;
            const tone = item.windLevel >= 6 || item.visibility <= 9.5 ? 'amber' : 'cyan';
            return (
              <g key={`${item.hour}-${index}`} className={`is-${tone}`} transform={`translate(${x} 100)`}>
                <circle r="5" />
                <text y="-14" textAnchor="middle">{item.hour}时</text>
                <text y="24" textAnchor="middle">{item.windLevel}级</text>
              </g>
            );
          })}
          <text x="1010" y="65" className="port-semantic-map__micro-title">未来 6 小时通航窗口</text>
        </g>
      </svg>

      {(activeVessel || activePort) && (
      <div
        className="port-semantic-map__inspector"
        style={{
          left: inspectorPosition?.x ?? 16,
          top: inspectorPosition?.y ?? 64,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {activeVessel ? (
          <>
            <div className="port-semantic-map__inspector-title">
              <Ship size={15} />
              <span>{activeVessel.name}</span>
            </div>
            <div className="port-semantic-map__inspector-grid">
              <span>状态</span><b>{activeVessel.status === 'sailing' ? '航行中' : activeVessel.status === 'waiting' ? '候泊' : '靠泊'}</b>
              <span>航速</span><b>{activeVessel.speed} 节</b>
              <span>目的港</span><b>{activeVessel.destination}</b>
              <span>ETA</span><b>{activeVessel.eta}</b>
              <span>装载率</span><b>{activeVessel.loadRate}%</b>
            </div>
          </>
        ) : activePort ? (
          <>
            <div className="port-semantic-map__inspector-title">
              <Anchor size={15} />
              <span>{activePort.label}</span>
            </div>
            <div className="port-semantic-map__inspector-grid">
              <span>角色</span><b>{activePort.role}</b>
              <span>车位</span><b>{activePort.id === 'xuwen' ? portCapacity.xuwen.availableSlots : portCapacity.haian.availableSlots}</b>
              <span>装载</span><b>{activePort.id === 'xuwen' ? portCapacity.xuwen.loadRate : portCapacity.haian.loadRate}%</b>
              <span>待渡</span><b>{formatInt(queue.totalVehicles)} 辆</b>
              <span>等待</span><b>{queue.estimatedWait} 分钟</b>
            </div>
          </>
        ) : (
          null
        )}
      </div>
      )}
    </section>
  );
}
