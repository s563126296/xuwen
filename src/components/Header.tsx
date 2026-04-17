import { Activity } from 'lucide-react';
import HeaderWeather from './overview/HeaderWeather';

interface Props {
  time: Date;
  children?: React.ReactNode;
}

export default function Header({ time, children }: Props) {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[time.getDay()];

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <Activity size={24} color="#0A0F19" />
          </div>
          <div>
            <div className="logo-text">徐闻县智慧交通大数据系统</div>
            <div className="header-subtitle">XUWEN INTELLIGENT TRANSPORTATION SYSTEM</div>
          </div>
        </div>
      </div>

      <div className="header-center">
        {children}
      </div>

      <div className="header-right">
        <div className="header-time">
          <span className="time-value">{hours}:{minutes}:{seconds}</span>
          <span className="time-label">{year}.{month}.{day} 星期{weekday}</span>
        </div>
        <HeaderWeather />
      </div>

      <style>{`
        .header {
          position: absolute;
          top: 0;
          left: 0;
          width: 1920px;
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 30px;
          background: linear-gradient(180deg, rgba(18, 26, 38, 0.98) 0%, rgba(10, 15, 25, 0.9) 100%);
          border-bottom: 1px solid rgba(0, 208, 233, 0.2);
          z-index: 100;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00D0E9, transparent);
        }
        .header-left {
          flex: 1;
        }
        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .header-right {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00D0E9 0%, #00A8CC 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(0, 208, 233, 0.4);
        }
        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 2px;
          text-shadow: 0 0 15px rgba(0, 208, 233, 0.3);
        }
        .header-subtitle {
          font-size: 11px;
          color: #A0A8B4;
          letter-spacing: 2px;
          margin-top: 2px;
        }
        .header-time {
          text-align: right;
        }
        .time-value {
          font-family: 'DIN', 'Orbitron', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #00D0E9;
          text-shadow: 0 0 20px rgba(0, 208, 233, 0.5);
          letter-spacing: 3px;
        }
        .time-label {
          display: block;
          font-size: 11px;
          color: #A0A8B4;
          margin-top: 2px;
          letter-spacing: 1px;
        }
      `}</style>
    </header>
  );
}
