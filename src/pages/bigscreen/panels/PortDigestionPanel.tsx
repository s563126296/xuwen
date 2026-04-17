import PanelFrame from '../components/PanelFrame';
import FlipNumber from '../components/FlipNumber';
import { useDashboardStore } from '../../../store/dashboardStore';

const portLabels: Record<'xuwen' | 'haian', string> = {
  xuwen: '徐闻港',
  haian: '海安新港',
};

export default function PortDigestionPanel() {
  const portDigestion = useDashboardStore((s) => s.portDigestion);

  return (
    <PanelFrame title="港口消化">
      <div className="bs-flex bs-gap-16" style={{ flex: 1 }}>
        {(['xuwen', 'haian'] as const).map((key) => {
          const port = portDigestion[key];
          const effPct = Math.round(port.loadEfficiency * 100);
          return (
            <div key={key} style={{ flex: 1 }}>
              <div className="bs-text-sm bs-text-cyan" style={{ marginBottom: 8, fontWeight: 600 }}>
                {portLabels[key]}
              </div>

              {/* Waiting vehicles */}
              <div className="bs-flex bs-justify-between bs-items-center">
                <span className="bs-text-xs bs-text-secondary">等待车辆</span>
                <FlipNumber value={port.waitingVehicles} digits={4} style={{ fontSize: 22 }} />
              </div>

              {/* Digestion time */}
              <div className="bs-flex bs-justify-between bs-items-center bs-mt-8">
                <span className="bs-text-xs bs-text-secondary">消化时间</span>
                <span className="bs-text-sm bs-text-cyan">
                  {port.digestionMinutes} <span style={{ fontSize: 10, opacity: 0.7 }}>分钟</span>
                </span>
              </div>

              {/* Load efficiency progress bar */}
              <div className="bs-mt-12">
                <div className="bs-flex bs-justify-between bs-text-xs bs-text-secondary" style={{ marginBottom: 4 }}>
                  <span>装载效率</span>
                  <span>{effPct}%</span>
                </div>
                <div className="bs-progress">
                  <div
                    className={`bs-progress-bar${effPct >= 90 ? '--green' : ''}`}
                    style={{ width: `${effPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PanelFrame>
  );
}
