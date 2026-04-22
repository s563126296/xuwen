import { useState, type CSSProperties } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import './semantic-operations-map.css';

export type SemanticTone = 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'muted';

export interface SemanticCorridor {
  id: string;
  label: string;
  path: string;
  tone: SemanticTone;
  width?: number;
  dashed?: boolean;
  status?: string;
  labelX: number;
  labelY: number;
  pulse?: boolean;
}

export interface SemanticNode {
  id: string;
  x: number;
  y: number;
  label: string;
  caption: string;
  marker: string;
  tone: SemanticTone;
  shape?: 'circle' | 'square' | 'diamond';
  active?: boolean;
  pulse?: boolean;
  onClick?: () => void;
}

export interface SemanticFlow {
  id: string;
  path: string;
  tone: SemanticTone;
  label?: string;
  labelX?: number;
  labelY?: number;
  dashed?: boolean;
  width?: number;
  reverse?: boolean;
}

export interface SemanticHazard {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  caption: string;
  tone: SemanticTone;
  variant?: 'storm' | 'impact';
}

export interface SemanticOperationsMapProps {
  mode: 'command' | 'emergency';
  title: string;
  subtitle: string;
  statusLabel: string;
  statusTone: SemanticTone;
  corridors: SemanticCorridor[];
  nodes: SemanticNode[];
  flows?: SemanticFlow[];
  hazards?: SemanticHazard[];
  legend: Array<{ label: string; tone: SemanticTone; type?: 'dot' | 'line' | 'dash' }>;
}

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 720;

const TONE_COLORS: Record<SemanticTone, string> = {
  cyan: '#00D0E9',
  green: '#2ED573',
  amber: '#F5A623',
  red: '#FF4757',
  blue: '#60A5FA',
  muted: '#94A3B8',
};

function toneStyle(tone: SemanticTone = 'cyan'): CSSProperties {
  return { '--semantic-tone': TONE_COLORS[tone] } as CSSProperties;
}

function BaseMapLandmarks({
  title,
  subtitle,
  statusLabel,
  statusTone,
}: {
  title: string;
  subtitle: string;
  statusLabel: string;
  statusTone: SemanticTone;
}) {
  return (
    <g className="semantic-map__base-layer">
      <defs>
        <linearGradient id="semanticSeaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B273B" />
          <stop offset="54%" stopColor="#083047" />
          <stop offset="100%" stopColor="#061522" />
        </linearGradient>
        <linearGradient id="semanticLandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14243A" />
          <stop offset="60%" stopColor="#102D43" />
          <stop offset="100%" stopColor="#0A1828" />
        </linearGradient>
        <linearGradient id="semanticCoastGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00D0E9" stopOpacity="0.08" />
          <stop offset="48%" stopColor="#00D0E9" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0.36" />
        </linearGradient>
        <pattern id="semanticGrid" width="54" height="54" patternUnits="userSpaceOnUse">
          <path d="M54 0H0V54" fill="none" stroke="rgba(143,244,255,0.07)" strokeWidth="1" />
          <path d="M27 0V54 M0 27H54" fill="none" stroke="rgba(143,244,255,0.03)" strokeWidth="1" />
        </pattern>
        <filter id="semanticGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#07111F" />
      <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#semanticGrid)" opacity="0.46" />

      <path
        d="M0,0 H1200 V410 C1050,395 900,405 700,400 C500,395 300,410 100,405 L0,410 Z"
        fill="url(#semanticLandGrad)"
      />
      <path
        d="M0,410 C150,415 300,405 500,410 C700,415 900,400 1100,390 L1200,385 V720 H0 Z"
        fill="url(#semanticSeaGrad)"
      />
      <path
        d="M100,410 C300,405 500,415 700,400 C850,390 950,395 1100,390"
        fill="none"
        stroke="url(#semanticCoastGrad)"
        strokeWidth="3"
        filter="url(#semanticGlow)"
      />

      <path
        d="M100,660 C300,650 500,665 700,655 C900,645 1000,658 1100,650"
        fill="none"
        stroke="rgba(245,166,35,0.28)"
        strokeWidth="2"
        strokeDasharray="10 12"
      />
      <text x="42" y="38" className="semantic-map__map-title">
        {title}
      </text>
      <text x="42" y="58" className="semantic-map__map-subtitle">
        {subtitle}
      </text>
      <g transform="translate(42 68)" style={toneStyle(statusTone)}>
        <rect className="semantic-map__map-status-bg" width="92" height="24" rx="5" />
        <text x="46" y="16" textAnchor="middle" className="semantic-map__map-status">
          {statusLabel}
        </text>
      </g>

      <text x="42" y="120" className="semantic-map__area-title">
        徐闻县域交通走廊
      </text>
      <text x="120" y="425" className="semantic-map__area-label">
        徐闻港岸线
      </text>
      <text x="600" y="540" textAnchor="middle" className="semantic-map__sea-label">
        琼州海峡通行窗口
      </text>
      <text x="1100" y="650" textAnchor="end" className="semantic-map__area-label semantic-map__area-label--south">
        海口承接岸线
      </text>

      <g className="semantic-map__sensor-grid" opacity="0.72">
        {[
          { x: 850, y: 160, label: '城区卡口' },
          { x: 650, y: 240, label: '雷达覆盖' },
          { x: 420, y: 320, label: '视频AI' },
          { x: 900, y: 480, label: '海况站' },
        ].map((sensor) => (
          <g key={sensor.label} transform={`translate(${sensor.x} ${sensor.y})`}>
            <circle r="24" fill="none" stroke="rgba(143,244,255,0.16)" strokeDasharray="4 8">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="26s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4" fill="#8FF4FF" />
            <text y="-34" textAnchor="middle">{sensor.label}</text>
          </g>
        ))}
      </g>

      <g opacity="0.5">
        {[0, 1, 2, 3].map((index) => {
          const y = 480 + index * 55;
          return (
            <path
              key={y}
              d={`M100,${y} C300,${y - 15} 500,${y + 20} 700,${y - 5} C900,${y - 25} 1000,${y + 15} 1100,${y - 10}`}
              fill="none"
              stroke="rgba(143,244,255,0.13)"
              strokeWidth="1.2"
              strokeDasharray="8 16"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur={`${6 + index}s`} repeatCount="indefinite" />
            </path>
          );
        })}
      </g>
    </g>
  );
}

function renderNodeShape(node: SemanticNode) {
  if (node.shape === 'square') {
    return <rect className="semantic-map__node-core" x="-14" y="-14" width="28" height="28" rx="7" />;
  }
  if (node.shape === 'diamond') {
    return <rect className="semantic-map__node-core" x="-13" y="-13" width="26" height="26" rx="5" transform="rotate(45)" />;
  }
  return <circle className="semantic-map__node-core" r="15" />;
}

function SemanticNodeMarker({ node }: { node: SemanticNode }) {
  return (
    <g
      className={`semantic-map__node ${node.active ? 'is-active' : ''} ${node.pulse ? 'is-pulsing' : ''} ${node.onClick ? 'is-clickable' : ''}`}
      transform={`translate(${node.x} ${node.y})`}
      style={toneStyle(node.tone)}
      onClick={(event) => {
        event.stopPropagation();
        node.onClick?.();
      }}
      role={node.onClick ? 'button' : undefined}
      tabIndex={node.onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (node.onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          node.onClick();
        }
      }}
    >
      <circle className="semantic-map__node-halo" r={node.active ? 36 : 28} />
      {node.pulse && <circle className="semantic-map__node-pulse" r="38" />}
      {renderNodeShape(node)}
      <text className="semantic-map__node-marker" y="4" textAnchor="middle">
        {node.marker}
      </text>
      <line x1="0" y1="-18" x2="0" y2="-44" className="semantic-map__node-pin" />
      <g transform="translate(0 -61)">
        <rect className="semantic-map__node-label-bg" x="-58" y="-18" width="116" height="38" rx="7" />
        <text className="semantic-map__node-label" y="-3" textAnchor="middle">
          {node.label}
        </text>
        <text className="semantic-map__node-caption" y="12" textAnchor="middle">
          {node.caption}
        </text>
      </g>
    </g>
  );
}

function SemanticHazardMarker({ hazard }: { hazard: SemanticHazard }) {
  const isStorm = hazard.variant === 'storm';

  return (
    <g
      className={`semantic-map__hazard semantic-map__hazard--${hazard.variant ?? 'impact'}`}
      transform={`translate(${hazard.x} ${hazard.y})`}
      style={toneStyle(hazard.tone)}
    >
      <circle r={hazard.radius} className="semantic-map__hazard-zone" />
      <circle r={hazard.radius * 0.64} className="semantic-map__hazard-zone semantic-map__hazard-zone--inner" />
      {isStorm ? (
        <g className="semantic-map__storm-symbol">
          <path d="M0,-22 C18,-18 28,-4 22,10 C15,28 -10,26 -18,10 C-26,-8 -14,-24 0,-22 Z" />
          <path d="M-20,0 C-8,-12 10,-12 22,0 C10,12 -8,12 -20,0 Z" />
          <circle r="5" />
        </g>
      ) : (
        <g className="semantic-map__impact-symbol">
          <path d="M0,-20 L18,14 H-18 Z" />
          <rect x="-2" y="-7" width="4" height="11" rx="2" />
          <circle cy="9" r="2" />
        </g>
      )}
      <g transform={`translate(0 ${hazard.radius + 24})`}>
        <rect className="semantic-map__hazard-label-bg" x="-76" y="-17" width="152" height="38" rx="7" />
        <text className="semantic-map__hazard-label" y="-2" textAnchor="middle">
          {hazard.label}
        </text>
        <text className="semantic-map__hazard-caption" y="13" textAnchor="middle">
          {hazard.caption}
        </text>
      </g>
    </g>
  );
}

export default function SemanticOperationsMap({
  mode,
  title,
  subtitle,
  statusLabel,
  statusTone,
  corridors,
  nodes,
  flows = [],
  hazards = [],
  legend,
}: SemanticOperationsMapProps) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((value) => Math.min(1.45, Number((value + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((value) => Math.max(0.85, Number((value - 0.1).toFixed(2))));

  return (
    <div className={`semantic-map semantic-map--${mode}`}>
      <div className="semantic-map__viewport" style={{ '--semantic-zoom': zoom } as CSSProperties}>
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="semantic-map__svg"
          role="img"
          aria-label={`${title}语义化态势图`}
        >
          <BaseMapLandmarks title={title} subtitle={subtitle} statusLabel={statusLabel} statusTone={statusTone} />

          <g className="semantic-map__flow-layer">
            {flows.map((flow) => (
              <g key={flow.id} style={toneStyle(flow.tone)}>
                <path
                  d={flow.path}
                  className={`semantic-map__flow-glow ${flow.dashed ? 'is-dashed' : ''}`}
                  strokeWidth={flow.width ? flow.width + 14 : 24}
                />
                <path
                  d={flow.path}
                  className={`semantic-map__flow-line ${flow.dashed ? 'is-dashed' : ''} ${flow.reverse ? 'is-reverse' : ''}`}
                  strokeWidth={flow.width ?? 4}
                />
                {flow.label && flow.labelX !== undefined && flow.labelY !== undefined && (
                  <g transform={`translate(${flow.labelX} ${flow.labelY})`}>
                    <rect className="semantic-map__path-label-bg" x="-72" y="-15" width="144" height="30" rx="7" />
                    <text className="semantic-map__path-label" y="4" textAnchor="middle">
                      {flow.label}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </g>

          <g className="semantic-map__corridor-layer">
            {corridors.map((corridor) => (
              <g key={corridor.id} style={toneStyle(corridor.tone)}>
                <path
                  d={corridor.path}
                  className={`semantic-map__corridor-glow ${corridor.dashed ? 'is-dashed' : ''}`}
                  strokeWidth={(corridor.width ?? 10) + 18}
                />
                <path
                  d={corridor.path}
                  className={`semantic-map__corridor-line ${corridor.dashed ? 'is-dashed' : ''} ${corridor.pulse ? 'is-pulsing' : ''}`}
                  strokeWidth={corridor.width ?? 10}
                />
                <g transform={`translate(${corridor.labelX} ${corridor.labelY})`}>
                  <rect className="semantic-map__path-label-bg" x="-78" y="-16" width="156" height="34" rx="7" />
                  <text className="semantic-map__path-label" y="-1" textAnchor="middle">
                    {corridor.label}
                  </text>
                  {corridor.status && (
                    <text className="semantic-map__path-caption" y="13" textAnchor="middle">
                      {corridor.status}
                    </text>
                  )}
                </g>
              </g>
            ))}
          </g>

          <g className="semantic-map__hazard-layer">
            {hazards.map((hazard) => (
              <SemanticHazardMarker key={hazard.id} hazard={hazard} />
            ))}
          </g>

          <g className="semantic-map__node-layer">
            {nodes.map((node) => (
              <SemanticNodeMarker key={node.id} node={node} />
            ))}
          </g>

          <g className="semantic-map__inline-legend">
            {legend.map((item, index) => (
              <g key={item.label} transform={`translate(${42 + index * 128} 700)`} style={toneStyle(item.tone)}>
                {item.type === 'line' || item.type === 'dash' ? (
                  <line x1="0" y1="0" x2="30" y2="0" className={`semantic-map__legend-line ${item.type === 'dash' ? 'is-dashed' : ''}`} />
                ) : (
                  <circle cx="10" cy="0" r="5" className="semantic-map__legend-dot" />
                )}
                <text x="38" y="4" className="semantic-map__legend-text">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="semantic-map__zoom-controls">
        <button type="button" onClick={zoomOut} aria-label="缩小语义地图">
          <ZoomOut size={16} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={zoomIn} aria-label="放大语义地图">
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
