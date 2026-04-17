import { AlertTriangle } from 'lucide-react';

const alerts = [
  { id: 1, text: 'G207徐闻段交通事故', time: '10分钟前', type: 'warning' },
  { id: 2, text: '海安新港货车流量较大', time: '25分钟前', type: 'info' },
  { id: 3, text: '城区大道南行拥堵', time: '32分钟前', type: 'warning' },
];

export default function AlertBanner() {
  return (
    <div className="alert-banner">
      <AlertTriangle size={18} color="#F5A623" style={{ marginRight: 12 }} />
      <span style={{ fontSize: 13, color: '#F5A623', marginRight: 24, fontWeight: 500 }}>
        预警信息
      </span>
      <div className="alert-items" style={{ display: 'flex', gap: 32, flex: 1 }}>
        {alerts.map(alert => (
          <div key={alert.id} className="alert-item">
            <div className="dot" />
            <span>{alert.text}</span>
            <span className="time">({alert.time})</span>
          </div>
        ))}
      </div>
      <style>{`
        .alert-banner {
          position: absolute;
          top: 100px;
          left: 0;
          width: 1920px;
          height: 48px;
          display: flex;
          align-items: center;
          padding: 0 40px;
          background: rgba(245, 166, 35, 0.08);
          border-bottom: 1px solid rgba(245, 166, 35, 0.2);
          z-index: 90;
        }
        .alert-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #C9CDD4;
        }
        .alert-item .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #F5A623;
          animation: blink 1.5s infinite;
        }
        .alert-item .time {
          color: #A0A8B4;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
