import { Ship, TrendingUp, Clock, Route, Gauge, AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

export default function PortDetailPanel() {
  const { selectedPort, selectedDirection, portData, setActiveModal } = useDashboardStore();
  const data = portData[selectedPort];

  const getCongestionInfo = (index: number) => {
    if (index <= 2) return { level: '道路通畅', color: '#2ED573', bg: 'rgba(46, 213, 115, 0.1)' };
    if (index <= 4) return { level: '轻度拥堵', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.1)' };
    if (index <= 6) return { level: '中度拥堵', color: '#FF6B35', bg: 'rgba(255, 107, 53, 0.1)' };
    if (index <= 8) return { level: '重度拥堵', color: '#FF4757', bg: 'rgba(255, 71, 87, 0.1)' };
    return { level: '严重拥堵', color: '#FF1744', bg: 'rgba(255, 23, 68, 0.1)' };
  };

  const congestionInfo = getCongestionInfo(data.congestionIndex);
  const isInbound = selectedDirection === 'inbound';

  return (
    <div className="module-card glow-accent animate-in">
      <div className="module-header">
        <span className="module-title">
          {selectedPort === 'overview' ? '双港总览' : data.name}
        </span>
        <div className="module-icon">
          <Ship size={16} />
        </div>
      </div>

      {/* Direction indicator */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12,
        padding: '6px 10px',
        background: isInbound ? 'rgba(0, 208, 233, 0.08)' : 'rgba(245, 166, 35, 0.08)',
        borderRadius: 6,
        border: `1px solid ${isInbound ? 'rgba(0, 208, 233, 0.2)' : 'rgba(245, 166, 35, 0.2)'}`
      }}>
        <span style={{
          fontSize: 13,
          color: isInbound ? '#00D0E9' : '#F5A623',
          fontWeight: 500
        }}>
          {isInbound ? '↓ 进港方向' : '↑ 出港方向'}
        </span>
        <span style={{ fontSize: 12, color: '#A0A8B4', marginLeft: 'auto' }}>
          拥堵指数 {data.congestionIndex.toFixed(1)}
        </span>
      </div>

      {/* Congestion status */}
      <div style={{
        padding: 12,
        background: congestionInfo.bg,
        borderRadius: 8,
        border: `1px solid ${congestionInfo.color}30`,
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 2 }}>拥堵状态</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: congestionInfo.color }}>
              {congestionInfo.level}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'DIN, sans-serif',
              fontSize: 26,
              fontWeight: 700,
              color: congestionInfo.color,
              textShadow: `0 0 20px ${congestionInfo.color}50`
            }}>
              {data.congestionIndex.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div style={{
          padding: 10,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={12} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>拥堵时间</span>
          </div>
          <div style={{
            fontFamily: 'DIN, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: data.congestionTime > 0 ? '#F5A623' : '#2ED573'
          }}>
            {data.congestionTime > 0 ? `${data.congestionTime}分钟` : '—'}
          </div>
        </div>

        <div style={{
          padding: 10,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Route size={12} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>拥堵距离</span>
          </div>
          <div style={{
            fontFamily: 'DIN, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: data.congestionDistance > 0 ? '#F5A623' : '#2ED573'
          }}>
            {data.congestionDistance > 0
              ? data.congestionDistance >= 1000
                ? `${(data.congestionDistance / 1000).toFixed(1)}公里`
                : `${data.congestionDistance}米`
              : '—'}
          </div>
        </div>

        <div style={{
          padding: 10,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <TrendingUp size={12} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>小时流量</span>
          </div>
          <div style={{
            fontFamily: 'DIN, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#00D0E9'
          }}>
            {data.vehicleFlow}<span style={{ fontSize: 11, color: '#A0A8B4', marginLeft: 4 }}>辆/时</span>
          </div>
        </div>

        <div style={{
          padding: 10,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Gauge size={12} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>今日累计</span>
          </div>
          <div style={{
            fontFamily: 'DIN, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#C9CDD4'
          }}>
            {data.flow.toLocaleString()}<span style={{ fontSize: 11, color: '#A0A8B4', marginLeft: 4 }}>辆</span>
          </div>
        </div>
      </div>

      {/* Strategy button - show when congestion > 2 */}
      {data.congestionIndex > 2 && (
        <button
          onClick={() => setActiveModal('strategy')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            marginTop: 12,
            padding: 10,
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: 6,
            color: '#F5A623',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <AlertTriangle size={14} />
          查看调度策略
        </button>
      )}
    </div>
  );
}
