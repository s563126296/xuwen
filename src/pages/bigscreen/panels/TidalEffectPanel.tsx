import PanelFrame from '../components/PanelFrame';
import { useDashboardStore } from '../../../store/dashboardStore';

const statusLabelMap: Record<string, string> = {
  inbound_tide: '进港潮',
  balanced: '均衡',
  outbound_tide: '出港潮',
};

const intensityLabel: Record<string, string> = {
  light: '轻度',
  moderate: '中度',
  strong: '强烈',
};

export default function TidalEffectPanel() {
  const data = useDashboardStore((s) => s.tidalEffect);
  const total = data.inboundFlow + data.outboundFlow;
  const inPct = total > 0 ? Math.round((data.inboundFlow / total) * 100) : 50;
  const outPct = 100 - inPct;

  const statusText = statusLabelMap[data.status] || data.status;
  const statusTagClass =
    data.status === 'inbound_tide' ? 'bs-tag--red' :
    data.status === 'outbound_tide' ? 'bs-tag--yellow' : 'bs-tag--green';

  return (
    <PanelFrame title="潮汐效应">
      {/* Status label */}
      <div className="bs-flex bs-justify-between bs-items-center" style={{ marginBottom: 8 }}>
        <span className={`bs-tag ${statusTagClass}`}>{statusText}</span>
        <span className="bs-text-xs bs-text-secondary">
          {intensityLabel[data.intensity] || data.intensity}
        </span>
      </div>

      {/* Dual direction bar */}
      <div>
        <div className="bs-flex bs-justify-between bs-text-xs bs-text-secondary" style={{ marginBottom: 4 }}>
          <span>进港 {data.inboundFlow}</span>
          <span>出港 {data.outboundFlow}</span>
        </div>
        <div className="bs-dual-bar">
          <div className="bs-dual-bar-left">
            <div
              className="bs-dual-bar-fill"
              style={{
                width: `${inPct}%`,
                background: 'linear-gradient(270deg, #00f0ff, rgba(0,240,255,0.2))',
              }}
            />
          </div>
          <div style={{ width: 2, height: '100%', background: 'rgba(224,232,255,0.3)' }} />
          <div className="bs-dual-bar-right">
            <div
              className="bs-dual-bar-fill"
              style={{
                width: `${outPct}%`,
                background: 'linear-gradient(90deg, #1890ff, rgba(24,144,255,0.2))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Reversal time */}
      <div className="bs-flex bs-justify-between bs-items-center bs-mt-12">
        <span className="bs-text-xs bs-text-secondary">翻转时间</span>
        <span
          style={{
            fontFamily: 'DIN Alternate, monospace',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--bs-cyan)',
          }}
        >
          {data.reversalTime}
        </span>
      </div>
    </PanelFrame>
  );
}
