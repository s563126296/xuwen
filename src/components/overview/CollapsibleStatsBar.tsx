import { useState, useRef, useEffect } from 'react';
import { Cpu, Car, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';

interface DeviceData {
  name: string;
  count: number;
  online: number;
  offline: number;
}

interface TrafficData {
  inbound: number;
  outbound: number;
  change: number;
}

interface ViolationData {
  type: string;
  count: number;
  trend: number;
}

interface Props {
  deviceData: DeviceData[];
  trafficData: TrafficData;
  violationData: ViolationData[];
}

const deviceCategories = ['全部', '摄像头', '信号灯', '发布屏', '无人机'] as const;

export default function CollapsibleStatsBar({ deviceData, trafficData, violationData }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState<string>('全部');
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const holidayContext = useOverviewStore((s) => s.holidayContext);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, deviceFilter]);

  const totalDevices = deviceData.reduce((s, d) => s + d.count, 0);
  const totalOnline = deviceData.reduce((s, d) => s + d.online, 0);
  const onlineRate = Math.round((totalOnline / totalDevices) * 100);
  const totalViolations = violationData.reduce((s, v) => s + v.count, 0);
  const avgViolationTrend = Math.round(violationData.reduce((s, v) => s + v.trend, 0) / violationData.length);
  const inChange = trafficData.change > 0 ? `+${trafficData.change}%` : `${trafficData.change}%`;
  const totalFlow = trafficData.inbound + trafficData.outbound;
  const lastYearDiff = holidayContext?.lastYearSame
    ? Math.round(((totalFlow - holidayContext.lastYearSame) / holidayContext.lastYearSame) * 100)
    : null;

  const filteredDevices = deviceFilter === '全部'
    ? deviceData
    : deviceData.filter((d) => d.name.includes(deviceFilter));

  return (
    <div
      className="module-card animate-in"
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label="基础体征详情"
      style={{ cursor: 'pointer', transition: 'border-color 0.2s ease, background 0.2s ease' }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 208, 233, 0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
    >
      {/* Collapsed summary row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Cpu size={14} style={{ color: '#00D0E9' }} />
            <span style={{ fontSize: 12, color: '#C9CDD4' }}>设备</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ED573', display: 'inline-block' }} />
            <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 13, color: '#00D0E9' }}>{totalOnline}/{totalDevices}</span>
            <span style={{ fontSize: 12, color: '#A0A8B4' }}>{onlineRate}%</span>
          </div>
          <span style={{ color: '#A0A8B4', fontSize: 12 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Car size={14} style={{ color: '#00D0E9' }} />
            <span style={{ fontSize: 12, color: '#C9CDD4' }}>进城</span>
            <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 13, color: '#00D0E9' }}>{trafficData.inbound.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: trafficData.change > 0 ? '#2ED573' : '#FF4757' }}>({inChange})</span>
            <span style={{ fontSize: 12, color: '#C9CDD4', marginLeft: 4 }}>出城</span>
            <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 13, color: '#F5A623' }}>{trafficData.outbound.toLocaleString()}</span>
            {holidayContext && (
              <>
                <span style={{ fontSize: 11, color: '#F5A623', background: 'rgba(245,166,35,0.15)', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>
                  日常{holidayContext.multiplier}x
                </span>
                {lastYearDiff !== null && (
                  <span style={{ fontSize: 11, color: lastYearDiff <= 0 ? '#2ED573' : '#FF4757', marginLeft: 2 }}>
                    同比{lastYearDiff > 0 ? '+' : ''}{lastYearDiff}%
                  </span>
                )}
              </>
            )}
          </div>
          <span style={{ color: '#A0A8B4', fontSize: 12 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={14} style={{ color: '#F5A623' }} />
            <span style={{ fontSize: 12, color: '#C9CDD4' }}>违法</span>
            <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 13, color: '#F5A623' }}>{totalViolations}</span>
            <span style={{ fontSize: 11, color: avgViolationTrend < 0 ? '#2ED573' : '#FF4757' }}>{avgViolationTrend}%</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: '#A0A8B4', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: '#A0A8B4', flexShrink: 0 }} />}
      </div>

      {/* Expanded detail with animation */}
      <div style={{
        maxHeight: expanded ? contentHeight + 20 : 0,
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div ref={contentRef} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
          {/* Device list with filter */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#A0A8B4' }}>设备明细</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {deviceCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDeviceFilter(cat)}
                    style={{
                      padding: '2px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                      border: '1px solid',
                      borderColor: deviceFilter === cat ? 'rgba(0,208,233,0.4)' : 'rgba(255,255,255,0.08)',
                      background: deviceFilter === cat ? 'rgba(0,208,233,0.12)' : 'transparent',
                      color: deviceFilter === cat ? '#00D0E9' : '#A0A8B4',
                      transition: 'all 0.2s',
                    }}
                    aria-label={`筛选${cat}设备`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {filteredDevices.map((d, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0',
                borderBottom: i < filteredDevices.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                borderLeft: d.offline > 0 ? '3px solid #FF4757' : '3px solid transparent',
                paddingLeft: 8,
              }}>
                <span style={{ fontSize: 12, color: '#C9CDD4' }}>{d.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 13, fontWeight: 600, color: '#00D0E9' }}>{d.online}</span>
                  <span style={{ fontSize: 11, color: '#A0A8B4' }}>/ {d.count}</span>
                  {d.offline > 0 && (
                    <span style={{
                      fontSize: 11, color: '#FF4757',
                      background: 'rgba(255,71,87,0.15)', padding: '1px 6px', borderRadius: 3,
                      animation: 'offlineBlink 2s infinite',
                    }}>
                      离线{d.offline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Traffic detail */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'rgba(0,208,233,0.08)', border: '1px solid rgba(0,208,233,0.15)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#A0A8B4' }}>今日进城</div>
              <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>{trafficData.inbound.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#A0A8B4' }}>今日出城</div>
              <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{trafficData.outbound.toLocaleString()}</div>
            </div>
          </div>
          {/* Violation list */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 6 }}>违法事件</div>
            {violationData.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: i < violationData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: 12, color: '#C9CDD4' }}>{v.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 13, fontWeight: 600, color: '#F5A623' }}>{v.count}</span>
                  <span style={{ fontSize: 11, color: v.trend < 0 ? '#2ED573' : '#FF4757' }}>{v.trend > 0 ? '+' : ''}{v.trend}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes offlineBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
