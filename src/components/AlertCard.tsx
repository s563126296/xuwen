import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
}

interface Props {
  alerts: AlertData[];
}

const icons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

export default function AlertCard({ alerts }: Props) {
  return (
    <div className="card alert-card animate-in delay-3">
      <div className="card-header">
        <span className="card-title">实时预警</span>
        <div className="card-icon">
          <AlertTriangle size={20} />
        </div>
      </div>
      <div className="alert-list">
        {alerts.map((alert) => {
          const Icon = icons[alert.type];
          return (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                <Icon size={16} />
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.description}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 200px;
          overflow-y: auto;
        }
        .alert-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 10px;
          border-left: 3px solid;
          transition: all 0.2s ease;
        }
        .alert-item:hover { background: var(--bg-card-hover); }
        .alert-item.critical { border-left-color: var(--accent-danger); }
        .alert-item.warning { border-left-color: var(--accent-warning); }
        .alert-item.info { border-left-color: var(--accent-primary); }
        .alert-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .alert-item.critical .alert-icon { background: rgba(255, 71, 87, 0.15); }
        .alert-item.warning .alert-icon { background: rgba(255, 107, 53, 0.15); }
        .alert-item.info .alert-icon { background: rgba(0, 210, 200, 0.15); }
        .alert-item.critical .alert-icon svg { stroke: var(--accent-danger); }
        .alert-item.warning .alert-icon svg { stroke: var(--accent-warning); }
        .alert-item.info .alert-icon svg { stroke: var(--accent-primary); }
        .alert-content { flex: 1; min-width: 0; }
        .alert-title { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .alert-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
        .alert-time { font-size: 11px; color: var(--text-muted); margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}
