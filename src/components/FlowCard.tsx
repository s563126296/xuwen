import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  inbound: number;
  outbound: number;
}

export default function FlowCard({ inbound, outbound }: Props) {
  const maxFlow = Math.max(inbound, outbound);

  return (
    <div className="card flow-card animate-in delay-4">
      <div className="card-header">
        <span className="card-title">进出城流量</span>
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
      </div>
      <div className="flow-stats">
        <div className="flow-item">
          <div className="flow-direction">
            <ArrowUpCircle size={20} />
          </div>
          <div className="flow-info">
            <div className="flow-label">进城车辆</div>
            <div className="flow-value">{inbound.toLocaleString()}</div>
          </div>
          <div className="flow-bar">
            <div className="flow-bar-fill in" style={{ width: `${(inbound / maxFlow) * 100}%` }} />
          </div>
        </div>
        <div className="flow-item">
          <div className="flow-direction">
            <ArrowDownCircle size={20} />
          </div>
          <div className="flow-info">
            <div className="flow-label">出城车辆</div>
            <div className="flow-value">{outbound.toLocaleString()}</div>
          </div>
          <div className="flow-bar">
            <div className="flow-bar-fill out" style={{ width: `${(outbound / maxFlow) * 100}%` }} />
          </div>
        </div>
      </div>

      <style>{`
        .flow-stats { display: flex; flex-direction: column; gap: 16px; }
        .flow-item { display: flex; align-items: center; gap: 12px; }
        .flow-direction {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 210, 200, 0.1);
        }
        .flow-direction svg { stroke: var(--accent-primary); }
        .flow-info { flex: 1; }
        .flow-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .flow-value { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 600; color: var(--text-primary); }
        .flow-bar { flex: 1; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
        .flow-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
        .flow-bar-fill.in { background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); }
        .flow-bar-fill.out { background: linear-gradient(90deg, var(--accent-tertiary), #9f8fff); }
      `}</style>
    </div>
  );
}
