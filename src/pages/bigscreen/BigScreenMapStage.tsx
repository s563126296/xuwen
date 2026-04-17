import { useDashboardStore } from '../../store/dashboardStore';

const navStatusMap: Record<string, string> = {
  normal: '正常通航',
  caution: '谨慎通航',
  restricted: '限制通航',
  closed: '停航',
};

interface MarkerProps {
  x: number;
  y: number;
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
}

function HexMarker({ x, y, label, value, unit = '', color = '#00f0ff' }: MarkerProps) {
  const hex = `${x},${y - 14} ${x + 12},${y - 7} ${x + 12},${y + 7} ${x},${y + 14} ${x - 12},${y + 7} ${x - 12},${y - 7}`;
  return (
    <g>
      {/* Pulse rings */}
      <circle cx={x} cy={y} r={22} fill="none" stroke={color} strokeWidth={1} opacity={0.3}>
        <animate attributeName="r" values="18;30;18" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={18} fill="none" stroke={color} strokeWidth={1} opacity={0.5}>
        <animate attributeName="r" values="14;22;14" dur="3s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      {/* Hex icon */}
      <polygon points={hex} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
      {/* Value */}
      <text x={x} y={y + 4} textAnchor="middle" fill={color}
        style={{ fontSize: 11, fontFamily: 'DIN Alternate, monospace', fontWeight: 700 }}>
        {value}{unit}
      </text>
      {/* Label below */}
      <rect x={x - 28} y={y + 18} width={56} height={16} rx={3}
        fill="rgba(10,14,39,0.85)" stroke={color} strokeWidth={0.8} />
      <text x={x} y={y + 30} textAnchor="middle" fill={color}
        style={{ fontSize: 10 }}>
        {label}
      </text>
    </g>
  );
}

export default function BigScreenMapStage() {
  const { portDigestion, urbanHealth, straitTransitIndex } = useDashboardStore();

  return (
    <div className="bs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bs-panel-title">徐闻港区态势</div>

      {/* SVG map */}
      <svg viewBox="0 0 800 480" style={{ flex: 1, minHeight: 0, width: '100%' }}>
        {/* Background */}
        <rect width={800} height={480} fill="#0a0e27" />
        {/* Grid lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={480}
            stroke="rgba(0,240,255,0.04)" strokeWidth={1} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={800} y2={i * 40}
            stroke="rgba(0,240,255,0.04)" strokeWidth={1} />
        ))}

        {/* Land area (upper 2/3) */}
        <rect x={0} y={0} width={800} height={320} fill="#0d1a2e" />

        {/* Sea area (lower 1/3) */}
        <rect x={0} y={320} width={800} height={160} fill="#0a1f3d" />
        {/* Sea shimmer */}
        <rect x={0} y={320} width={800} height={160}
          fill="url(#seaGrad)" opacity={0.4} />
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1890ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0a1f3d" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Sea label */}
        <text x={400} y={390} textAnchor="middle" fill="rgba(24,144,255,0.6)"
          style={{ fontSize: 18, letterSpacing: 6 }}>
          琼州海峡
        </text>

        {/* Coastline */}
        <path d="M0,320 Q200,310 400,318 Q600,326 800,320"
          fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth={1.5} />

        {/* G207 国道 (horizontal main road) */}
        <line x1={60} y1={180} x2={740} y2={180}
          stroke="#FFA726" strokeWidth={3} strokeDasharray="8,4" />
        <rect x={320} y={165} width={60} height={16} rx={3} fill="rgba(10,14,39,0.8)" />
        <text x={350} y={177} textAnchor="middle" fill="#FFA726"
          style={{ fontSize: 10, fontWeight: 600 }}>G207国道</text>

        {/* 进港大道: G207 斜向左下到徐闻港 */}
        <path d="M280,180 L180,320"
          stroke="#00f0ff" strokeWidth={2.5} />
        <text x={200} y={255} fill="rgba(0,240,255,0.7)"
          style={{ fontSize: 10 }} transform="rotate(-30,200,255)">进港大道</text>

        {/* 海安路: G207 向右到海安新港 */}
        <path d="M520,180 L620,320"
          stroke="#00f0ff" strokeWidth={2.5} />
        <text x={590} y={255} fill="rgba(0,240,255,0.7)"
          style={{ fontSize: 10 }} transform="rotate(30,590,255)">海安路</text>

        {/* Port markers */}
        <HexMarker x={180} y={340} label="徐闻港"
          value={portDigestion.xuwen.waitingVehicles} unit="辆" />
        <HexMarker x={620} y={340} label="海安新港"
          value={portDigestion.haian.waitingVehicles} unit="辆" color="#4FC3F7" />
        <HexMarker x={400} y={120} label="徐闻县城"
          value={urbanHealth.score} unit="分" color="#00ffa2" />
      </svg>

      {/* Bottom: strait transit index */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px',
        background: 'rgba(0,240,255,0.04)',
        borderTop: '1px solid rgba(0,240,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'DIN Alternate, monospace',
            fontSize: 40,
            fontWeight: 700,
            color: 'var(--bs-cyan)',
            textShadow: '0 0 20px rgba(0,240,255,0.5)',
            lineHeight: 1,
          }}>
            {straitTransitIndex.indexValue}
          </span>
          <span style={{ fontSize: 12, color: 'var(--bs-text-secondary)' }}>海峡通行指数</span>
          <span style={{
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid rgba(0,240,255,0.3)',
            color: 'var(--bs-cyan)',
            background: 'rgba(0,240,255,0.08)',
          }}>
            {navStatusMap[straitTransitIndex.navigationStatus] ?? straitTransitIndex.navigationStatus}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--bs-text-secondary)' }}>
          <span>风力 <span className="bs-text-cyan">{straitTransitIndex.windLevel} 级</span></span>
          <span>能见度 <span className="bs-text-cyan">{straitTransitIndex.visibility}</span></span>
        </div>
      </div>
    </div>
  );
}
