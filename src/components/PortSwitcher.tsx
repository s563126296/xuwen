import { Ship } from 'lucide-react';
import { useDashboardStore, PortType } from '../store/dashboardStore';

export default function PortSwitcher() {
  const { selectedPort, setSelectedPort, portData } = useDashboardStore();

  const ports: { key: PortType; label: string }[] = [
    { key: 'overview', label: '双港总览' },
    { key: 'xuwen', label: '徐闻港' },
    { key: 'haian', label: '海安新港' },
  ];

  return (
    <div className="port-switcher">
      <Ship size={16} style={{ marginRight: 8, color: '#00D0E9' }} />
      {ports.map((port) => {
        const isActive = selectedPort === port.key;
        const data = portData[port.key];

        return (
          <button
            key={port.key}
            className={`port-btn ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedPort(port.key)}
          >
            <span className="port-label">{port.label}</span>
            {isActive && (
              <span className={`status-dot ${data.status}`} />
            )}
          </button>
        );
      })}

      <style>{`
        .port-switcher {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          border: 1px solid rgba(0, 208, 233, 0.15);
        }
        .port-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 5px;
          color: #A0A8B4;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .port-btn:hover {
          background: rgba(0, 208, 233, 0.1);
          color: #C9CDD4;
        }
        .port-btn.active {
          background: rgba(0, 208, 233, 0.15);
          color: #00D0E9;
        }
        .port-label {
          white-space: nowrap;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-dot.normal {
          background: #2ED573;
          box-shadow: 0 0 6px #2ED573;
        }
        .status-dot.busy {
          background: #F5A623;
          box-shadow: 0 0 6px #F5A623;
          animation: pulse 1.5s infinite;
        }
        .status-dot.congested {
          background: #FF4757;
          box-shadow: 0 0 6px #FF4757;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
