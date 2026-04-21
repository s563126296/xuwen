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
            <Activity size={20} color="#060d1a" />
          </div>
          <div>
            <div className="logo-text">徐闻智慧交通大屏</div>
            <div className="header-subtitle">琼州海峡北岸智慧交通综合管控平台</div>
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
        .header-left { flex: 1; }
        .header-center { flex: 1; display: flex; justify-content: center; align-items: center; }
        .header-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--color-primary, #4da6ff) 0%, #2563EB 100%);
          border-radius: var(--radius-md, 12px);
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--glow-primary, 0 0 12px rgba(77,166,255,0.35));
        }
        .logo-text {
          font-family: var(--font-label, 'Rajdhani'), sans-serif;
          font-size: 20px; font-weight: 600;
          color: var(--text-highlight, rgba(255,255,255,0.98));
          letter-spacing: 2px;
          text-shadow: 0 0 15px var(--color-primary-glow, rgba(77,166,255,0.5));
        }
        .header-subtitle {
          font-family: 'Noto Sans SC', sans-serif;
          font-size: 10px;
          color: var(--text-tertiary, rgba(140,160,180,0.45));
          letter-spacing: 2px; margin-top: 2px;
        }
        .header-time { text-align: right; }
        .time-value {
          font-family: var(--font-display, 'Orbitron'), sans-serif;
          font-size: 24px; font-weight: 600;
          color: var(--color-primary, #4da6ff);
          text-shadow: 0 0 20px var(--color-primary-glow, rgba(77,166,255,0.5));
          letter-spacing: 3px;
        }
        .time-label {
          display: block;
          font-family: var(--font-data, 'JetBrains Mono'), monospace;
          font-size: 10px;
          color: var(--text-tertiary, rgba(140,160,180,0.45));
          margin-top: 2px; letter-spacing: 1px;
        }
      `}</style>
    </header>
  );
}
