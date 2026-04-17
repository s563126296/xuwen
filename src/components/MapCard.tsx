import { Layers } from 'lucide-react';

export default function MapCard() {
  return (
    <div className="card map-card animate-in delay-2">
      <div className="card-header">
        <span className="card-title">实时路况</span>
        <div className="card-icon">
          <Layers size={20} />
        </div>
      </div>
      <div className="map-container">
        <div className="map-overlay" />
        <svg className="map-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,210,200,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#mapGrid)"/>

          <g stroke="rgba(0,210,200,0.3)" strokeWidth="8" fill="none">
            <path d="M0 200 L800 200" strokeDasharray="20,10"/>
            <path d="M0 120 L800 120" strokeDasharray="20,10"/>
            <path d="M0 280 L800 280" strokeDasharray="20,10"/>
            <path d="M200 0 L200 400" strokeDasharray="20,10"/>
            <path d="M400 0 L400 400" strokeDasharray="20,10"/>
            <path d="M600 0 L600 400" strokeDasharray="20,10"/>
          </g>

          <g fill="none" strokeWidth="6" strokeLinecap="round">
            <path d="M0 200 L150 200" stroke="#2ed573"/>
            <path d="M250 200 L550 200" stroke="#2ed573"/>
            <path d="M650 200 L800 200" stroke="#2ed573"/>
            <path d="M400 0 L400 150" stroke="#2ed573"/>
            <path d="M400 250 L400 400" stroke="#2ed573"/>
            <path d="M200 0 L200 100" stroke="#00d2c8"/>
            <path d="M200 180 L200 400" stroke="#00d2c8"/>
            <path d="M600 0 L600 120" stroke="#00d2c8"/>
            <path d="M600 200 L600 400" stroke="#00d2c8"/>
            <path d="M150 200 L250 200" stroke="#ff6b35"/>
            <path d="M550 200 L650 200" stroke="#ff6b35"/>
            <path d="M200 100 L200 180" stroke="#ff6b35"/>
            <path d="M600 120 L600 200" stroke="#ff6b35"/>
            <path d="M320 140 L380 140" stroke="#ff4757"/>
            <path d="M420 260 L480 260" stroke="#ff4757"/>
          </g>

          <g>
            <circle cx="200" cy="200" r="12" fill="#141d28" stroke="#00d2c8" strokeWidth="2"/>
            <circle cx="400" cy="200" r="14" fill="#141d28" stroke="#2ed573" strokeWidth="2"/>
            <circle cx="600" cy="200" r="12" fill="#141d28" stroke="#ff6b35" strokeWidth="2"/>
            <circle cx="200" cy="120" r="10" fill="#141d28" stroke="#00d2c8" strokeWidth="2"/>
            <circle cx="200" cy="280" r="10" fill="#141d28" stroke="#00d2c8" strokeWidth="2"/>
            <circle cx="600" cy="120" r="10" fill="#141d28" stroke="#ff6b35" strokeWidth="2"/>
            <circle cx="600" cy="280" r="10" fill="#141d28" stroke="#00d2c8" strokeWidth="2"/>
            <circle cx="400" cy="120" r="10" fill="#141d28" stroke="#2ed573" strokeWidth="2"/>
            <circle cx="400" cy="280" r="10" fill="#141d28" stroke="#ff4757" strokeWidth="2"/>
          </g>

          <g transform="translate(400, 200)">
            <circle r="20" fill="rgba(0,210,200,0.2)">
              <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle r="12" fill="rgba(0,210,200,0.4)"/>
            <circle r="6" fill="#00d2c8"/>
          </g>

          <g fill="#8892a0" fontSize="10" fontFamily="JetBrains Mono, monospace">
            <text x="400" y="185" textAnchor="middle">交警指挥中心</text>
            <text x="195" y="195" textAnchor="end" fontSize="9">G207</text>
            <text x="605" y="195" textAnchor="start" fontSize="9">G207</text>
            <text x="395" y="125" textAnchor="end" fontSize="9">X699</text>
            <text x="395" y="295" textAnchor="end" fontSize="9">X699</text>
          </g>

          <g fill="#00d2c8">
            <circle cx="120" cy="200" r="4">
              <animate attributeName="cx" values="120;380" dur="8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="280" cy="200" r="4">
              <animate attributeName="cx" values="280;380" dur="6s" repeatCount="indefinite"/>
            </circle>
            <circle cx="500" cy="200" r="4">
              <animate attributeName="cx" values="500;380" dur="7s" repeatCount="indefinite"/>
            </circle>
          </g>
        </svg>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-dot smooth" />
            <span>畅通</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot normal" />
            <span>正常</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot congested" />
            <span>拥堵</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot blocked" />
            <span>管制</span>
          </div>
        </div>
      </div>

      <style>{`
        .map-card { min-height: 480px; }
        .map-container {
          height: calc(100% - 50px);
          background: var(--bg-secondary);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 210, 200, 0.1);
        }
        .map-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background:
            linear-gradient(180deg, rgba(10, 14, 20, 0.3) 0%, transparent 20%, transparent 80%, rgba(10, 14, 20, 0.5) 100%),
            linear-gradient(90deg, rgba(10, 14, 20, 0.2) 0%, transparent 10%, transparent 90%, rgba(10, 14, 20, 0.2) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .map-svg { width: 100%; height: 100%; }
        .map-legend {
          position: absolute;
          bottom: 16px;
          left: 16px;
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(20, 29, 40, 0.9);
          border-radius: 8px;
          border: 1px solid rgba(0, 210, 200, 0.2);
          z-index: 2;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .legend-dot.smooth { background: var(--accent-success); box-shadow: 0 0 8px var(--accent-success); }
        .legend-dot.normal { background: var(--accent-primary); box-shadow: 0 0 8px var(--accent-primary); }
        .legend-dot.congested { background: var(--accent-warning); box-shadow: 0 0 8px var(--accent-warning); }
        .legend-dot.blocked { background: var(--accent-danger); box-shadow: 0 0 8px var(--accent-danger); }
      `}</style>
    </div>
  );
}
