interface RoadData {
  id: string;
  name: string;
  location: string;
  length: string;
  status: 'smooth' | 'normal' | 'congested' | 'blocked';
  speed: number;
}

interface Props {
  roads: RoadData[];
}

const statusColors = {
  smooth: 'var(--accent-success)',
  normal: 'var(--accent-primary)',
  congested: 'var(--accent-warning)',
  blocked: 'var(--accent-danger)'
};


export default function RoadStatusCard({ roads }: Props) {
  return (
    <div className="card road-status-card animate-in delay-4">
      <div className="card-header">
        <span className="card-title">主要道路状态</span>
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
      </div>
      <div className="road-list">
        {roads.map((road) => (
          <div key={road.id} className="road-item">
            <div className={`road-status ${road.status}`} />
            <div className="road-info">
              <div className="road-name">{road.name}</div>
              <div className="road-meta">{road.location} / 全长 {road.length}</div>
            </div>
            <div className="road-speed">
              <div className="road-speed-value" style={{ color: statusColors[road.status] }}>
                {road.speed}
              </div>
              <div className="road-speed-unit">km/h</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .road-list { display: flex; flex-direction: column; gap: 12px; }
        .road-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .road-item:hover { background: var(--bg-card-hover); }
        .road-status {
          width: 8px;
          height: 40px;
          border-radius: 4px;
        }
        .road-status.smooth { background: var(--accent-success); box-shadow: 0 0 10px var(--accent-success); }
        .road-status.normal { background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
        .road-status.congested { background: var(--accent-warning); box-shadow: 0 0 10px var(--accent-warning); }
        .road-status.blocked { background: var(--accent-danger); box-shadow: 0 0 10px var(--accent-danger); }
        .road-info { flex: 1; }
        .road-name { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .road-meta { font-size: 12px; color: var(--text-secondary); }
        .road-speed { text-align: right; }
        .road-speed-value { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 600; }
        .road-speed-unit { font-size: 11px; color: var(--text-muted); margin-left: 2px; }
      `}</style>
    </div>
  );
}
