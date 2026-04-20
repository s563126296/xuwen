import { useOverviewStore } from '../../../stores/overviewStore';

const nodeConfig = [
  { key: 'port', label: '港口' },
  { key: 'corridor', label: '通道' },
  { key: 'city', label: '城区' },
  { key: 'citywide', label: '全域' },
] as const;

const statusLabel: Record<string, string> = {
  decoupled: '解耦',
  transmitting: '传导中',
  spreading: '扩散中',
  citywide: '全域影响',
};

const statusTagClass: Record<string, string> = {
  decoupled: 'bs-tag--green',
  transmitting: 'bs-tag--yellow',
  spreading: 'bs-tag--red',
  citywide: 'bs-tag--red',
};

export default function PressureChainPanel() {
  const data = useOverviewStore((s) => s.pressureTransmission);

  return (
    <div className="bs-panel">
      <div className="bs-panel-title">拥堵扩散链路</div>

      <div className="bs-flex bs-justify-between bs-items-center bs-mt-8">
        <span className="bs-text-xs bs-text-secondary">整体状态</span>
        <span className={`bs-tag ${statusTagClass[data.overallStatus] || ''}`}>
          {statusLabel[data.overallStatus] || data.overallStatus}
        </span>
      </div>

      <div className="bs-chain bs-mt-12" style={{ justifyContent: 'center' }}>
        {nodeConfig.map((node, i) => {
          const d = data[node.key];
          return (
            <div key={node.key} className="bs-flex bs-items-center">
              <div className={`bs-chain-node ${d.active ? 'bs-chain-node--active' : ''}`}>
                <span
                  className="bs-text-sm"
                  style={{
                    fontFamily: 'DIN Alternate, DIN, Roboto Mono, monospace',
                    fontWeight: 700,
                    color: d.active ? '#00f0ff' : 'rgba(224,232,255,0.65)',
                  }}
                >
                  {d.score}
                </span>
                <span className="bs-text-xs bs-text-secondary">{node.label}</span>
              </div>
              {i < nodeConfig.length - 1 && <div className="bs-chain-arrow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
