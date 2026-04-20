import { useOverviewStore } from '../../../stores/overviewStore';
import type { IntersectionStatus } from '../../../stores/overviewStore';

const statusColor: Record<IntersectionStatus, string> = {
  normal: '#00ffa2',
  near_peak: '#ffc107',
  saturated: '#ff8c00',
  overflow: '#ff4757',
};

const statusLabel: Record<IntersectionStatus, string> = {
  normal: '正常',
  near_peak: '临峰',
  saturated: '饱和',
  overflow: '溢出',
};

export default function UrbanHealthPanel() {
  const data = useOverviewStore((s) => s.urbanHealth);
  const scoreColor = data.score >= 80 ? '#00ffa2' : data.score >= 60 ? '#ffc107' : '#ff4757';

  return (
    <div className="bs-panel">
      <div className="bs-panel-title">城区健康度</div>

      <div className="bs-flex bs-items-center bs-gap-12">
        <div
          className="bs-kpi"
          style={{ color: scoreColor, textShadow: `0 0 16px ${scoreColor}80` }}
        >
          {data.score}
        </div>
        <div className="bs-flex-col">
          <span className="bs-text-sm" style={{ color: scoreColor }}>{data.level}</span>
          <span className="bs-text-xs bs-text-secondary">健康评分</span>
        </div>
      </div>

      {/* Intersection list */}
      <div className="bs-mt-12">
        <div className="bs-text-xs bs-text-secondary" style={{ marginBottom: 8 }}>路口饱和度</div>
        {data.intersections.slice(0, 5).map((item) => {
          const pct = Math.round(item.saturation * 100);
          const color = statusColor[item.status];
          return (
            <div key={item.name} style={{ marginBottom: 8 }}>
              <div className="bs-flex bs-justify-between bs-text-xs" style={{ marginBottom: 2 }}>
                <span className="bs-text-secondary">{item.name}</span>
                <span style={{ color }}>{statusLabel[item.status]} {pct}%</span>
              </div>
              <div className="bs-progress">
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: color,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hotspots */}
      {data.hotspots.length > 0 && (
        <div className="bs-mt-12">
          <div className="bs-text-xs bs-text-secondary" style={{ marginBottom: 6 }}>热点区域</div>
          {data.hotspots.map((h) => (
            <div key={h.name} className="bs-flex bs-justify-between bs-items-center bs-text-xs" style={{ marginBottom: 4 }}>
              <span className="bs-text-yellow">{h.name}</span>
              <span className="bs-text-secondary">{h.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
