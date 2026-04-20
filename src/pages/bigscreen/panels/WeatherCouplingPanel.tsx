import { useOverviewStore } from '../../../stores/overviewStore';

const levelLabel: Record<string, string> = {
  none: '无影响',
  slight: '轻微',
  significant: '显著',
  severe: '严重',
};

const levelTagClass: Record<string, string> = {
  none: 'bs-tag--green',
  slight: 'bs-tag--green',
  significant: 'bs-tag--yellow',
  severe: 'bs-tag--red',
};

export default function WeatherCouplingPanel() {
  const data = useOverviewStore((s) => s.weatherCoupling);

  return (
    <div className="bs-panel">
      <div className="bs-panel-title">天气耦合</div>

      <div className="bs-flex bs-justify-between bs-items-center">
        <span className="bs-text-xs bs-text-secondary">综合评分</span>
        <div className="bs-flex bs-items-center bs-gap-8">
          <span className="bs-kpi-sm">{data.overallScore}</span>
          <span className={`bs-tag ${levelTagClass[data.level] || ''}`}>
            {levelLabel[data.level] || data.level}
          </span>
        </div>
      </div>

      {/* Sea / Land dual scores */}
      <div className="bs-flex bs-gap-16 bs-mt-12">
        <div style={{ flex: 1 }}>
          <div className="bs-text-xs bs-text-secondary" style={{ marginBottom: 4 }}>海峡</div>
          <div className="bs-progress">
            <div className="bs-progress-bar" style={{ width: `${data.seaScore}%` }} />
          </div>
          <div className="bs-text-xs bs-text-cyan bs-mt-8">{data.seaScore} 分</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="bs-text-xs bs-text-secondary" style={{ marginBottom: 4 }}>陆地</div>
          <div className="bs-progress">
            <div className="bs-progress-bar--green" style={{ width: `${data.landScore}%`, height: 6, borderRadius: 3 }} />
          </div>
          <div className="bs-text-xs bs-text-green bs-mt-8">{data.landScore} 分</div>
        </div>
      </div>

      {/* Factors */}
      <div className="bs-mt-12">
        <div className="bs-text-xs bs-text-secondary" style={{ marginBottom: 6 }}>影响因素</div>
        <div className="bs-flex bs-gap-8" style={{ flexWrap: 'wrap' }}>
          {[...data.seaFactors, ...data.landFactors].map((f) => (
            <span key={f} className="bs-tag">{f}</span>
          ))}
        </div>
      </div>

      <div className="bs-text-xs bs-text-secondary bs-mt-12">{data.trend}</div>
    </div>
  );
}
