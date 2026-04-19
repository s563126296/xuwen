import { useMemo } from 'react';
import { generateHeatmapData } from '../../utils/analysisMockData';

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function getColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio < 0.25) return 'rgba(0,208,233,0.15)';
  if (ratio < 0.5) return 'rgba(0,208,233,0.35)';
  if (ratio < 0.7) return 'rgba(245,166,35,0.4)';
  if (ratio < 0.85) return 'rgba(245,166,35,0.7)';
  return 'rgba(255,71,87,0.7)';
}

export default function HeatmapView() {
  const data = useMemo(() => generateHeatmapData(), []);
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>车流量热力图</h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>按星期×小时展示平均车流量分布，识别高峰时段</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: 2, minWidth: 700 }}>
          {/* Header row */}
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} style={{ textAlign: 'center', fontSize: 9, color: '#64748B', padding: '4px 0' }}>
              {h.toString().padStart(2, '0')}
            </div>
          ))}

          {/* Data rows */}
          {DAY_LABELS.map((dayLabel, dayIdx) => (
            <>
              <div key={`label-${dayIdx}`} style={{ display: 'flex', alignItems: 'center', fontSize: 10, color: '#A0A8B4', paddingRight: 8 }}>
                {dayLabel}
              </div>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = data.find(d => d.day === dayIdx && d.hour === hour);
                const value = cell?.value || 0;
                return (
                  <div key={`${dayIdx}-${hour}`} title={`${dayLabel} ${hour}:00 — ${value} 辆`} style={{
                    height: 28,
                    background: getColor(value, maxVal),
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    color: value / maxVal > 0.5 ? 'rgba(255,255,255,0.7)' : 'transparent',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.outline = '1px solid #8B5CF6'; }}
                    onMouseLeave={e => { e.currentTarget.style.outline = 'none'; }}
                  >
                    {value / maxVal > 0.5 ? (value / 1000).toFixed(1) + 'k' : ''}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: '#64748B' }}>低</span>
        {['rgba(0,208,233,0.15)', 'rgba(0,208,233,0.35)', 'rgba(245,166,35,0.4)', 'rgba(245,166,35,0.7)', 'rgba(255,71,87,0.7)'].map((c, i) => (
          <div key={i} style={{ width: 24, height: 12, background: c, borderRadius: 2 }} />
        ))}
        <span style={{ fontSize: 10, color: '#64748B' }}>高</span>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', marginBottom: 6 }}>热力分析</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#A0A8B4', lineHeight: 1.6 }}>
          <li>工作日早高峰（07:00-09:00）和晚高峰（16:00-19:00）为车流量最高时段</li>
          <li>周末全天车流量较高，峰值出现在 10:00-12:00 和 15:00-18:00</li>
          <li>凌晨 22:00-05:00 为车流量最低时段，适合安排道路施工</li>
        </ul>
      </div>
    </div>
  );
}
