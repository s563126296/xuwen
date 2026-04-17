import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useDashboardStore, DirectionType } from '../store/dashboardStore';

export default function DirectionSwitcher() {
  const { selectedDirection, setSelectedDirection } = useDashboardStore();

  const directions: { key: DirectionType; label: string; icon: typeof ArrowDownLeft }[] = [
    { key: 'inbound', label: '进港方向', icon: ArrowDownLeft },
    { key: 'outbound', label: '出港方向', icon: ArrowUpRight },
  ];

  return (
    <div className="direction-switcher">
      {directions.map((dir) => {
        const Icon = dir.icon;
        const isActive = selectedDirection === dir.key;

        return (
          <button
            key={dir.key}
            className={`direction-btn ${isActive ? 'active' : ''} ${dir.key}`}
            onClick={() => setSelectedDirection(dir.key)}
          >
            <Icon size={14} />
            <span>{dir.label}</span>
          </button>
        );
      })}

      <style>{`
        .direction-switcher {
          display: flex;
          gap: 4px;
        }
        .direction-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 5px;
          color: #A0A8B4;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .direction-btn:hover {
          border-color: rgba(0, 208, 233, 0.3);
          color: #C9CDD4;
        }
        .direction-btn.active {
          border-color: currentColor;
        }
        .direction-btn.active.inbound {
          background: rgba(0, 208, 233, 0.1);
          border-color: rgba(0, 208, 233, 0.4);
          color: #00D0E9;
        }
        .direction-btn.active.outbound {
          background: rgba(245, 166, 35, 0.1);
          border-color: rgba(245, 166, 35, 0.4);
          color: #F5A623;
        }
      `}</style>
    </div>
  );
}
