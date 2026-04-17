import { TrendingUp, TrendingDown } from 'lucide-react';
import { MiniChart } from './MiniChart';

interface StatData {
  label: string;
  value: number;
  suffix?: string;
  trend: number;
  trendLabel: string;
  variant: 'default' | 'warning' | 'danger';
  chart: number[];
}

interface Props {
  stats: StatData[];
}

export default function StatsRow({ stats }: Props) {
  return (
    <div className="stats-row">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.variant === 'warning' ? 'warning' : stat.variant === 'danger' ? 'danger' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-label">{stat.label}</span>
            <span className={`stat-trend ${stat.trend > 0 ? 'up' : 'down'}`}>
              {stat.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stat.trend)}%
            </span>
          </div>
          <div className={`stat-value ${stat.variant === 'default' ? 'accent' : stat.variant}`}>
            {stat.value.toLocaleString()}{stat.suffix}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.trendLabel}</div>
          <MiniChart data={stat.chart} color={stat.variant === 'default' ? '#00d2c8' : stat.variant === 'warning' ? '#ff6b35' : '#ff4757'} />
        </div>
      ))}

      <style>{`
        .stats-row {
          grid-column: span 12;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 4px;
        }
        .stat-card {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid rgba(0, 210, 200, 0.1);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0, 210, 200, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .stat-card.warning::after {
          background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
        }
        .stat-card.danger::after {
          background: radial-gradient(circle, rgba(255, 71, 87, 0.08) 0%, transparent 70%);
        }
        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .stat-trend.up {
          background: rgba(46, 213, 115, 0.1);
          color: var(--accent-success);
        }
        .stat-trend.down {
          background: rgba(255, 71, 87, 0.1);
          color: var(--accent-danger);
        }
        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-value.accent {
          color: var(--accent-primary);
          text-shadow: 0 0 30px rgba(0, 210, 200, 0.4);
        }
        .stat-value.warning {
          color: var(--accent-warning);
          text-shadow: 0 0 30px rgba(255, 107, 53, 0.4);
        }
        .stat-value.danger {
          color: var(--accent-danger);
          text-shadow: 0 0 30px rgba(255, 71, 87, 0.4);
        }
        @media (max-width: 1200px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
