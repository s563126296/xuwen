import { Navigation } from 'lucide-react';
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
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
          <div className="logo-icon">
            <Navigation size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: 4,
            textShadow: '0 0 20px rgba(0, 208, 233, 0.4)',
          }}>徐闻智慧交通</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </div>

      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <span className="time-value">{hours}:{minutes}:{seconds}</span>
          <span className="time-label">{year}.{month}.{day} 星期{weekday}</span>
        </div>
        <HeaderWeather />
      </div>

      <style>{`
        .header-left { flex: 0 0 auto; }
        .header-center { flex: 1; display: flex; justify-content: center; align-items: center; }
        .header-right { flex: 0 0 auto; display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
        .logo { display: flex; align-items: center; gap: 14px; white-space: nowrap; }
        .logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #00D0E9 0%, #0066FF 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(0, 208, 233, 0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          position: relative;
        }
        .logo-icon::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          border: 1px solid rgba(0, 208, 233, 0.3);
        }
        .logo-text-group {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .logo-text {
          font-family: 'Noto Sans SC', sans-serif;
          font-size: 24px; font-weight: 700;
          color: rgba(255,255,255,0.95);
          letter-spacing: 4px;
          text-shadow: 0 0 20px rgba(0, 208, 233, 0.4);
        }
        .logo-badge {
          font-family: var(--font-data, 'JetBrains Mono'), monospace;
          font-size: 10px; font-weight: 500;
          color: rgba(0, 208, 233, 0.6);
          letter-spacing: 2px;
          border: 1px solid rgba(0, 208, 233, 0.2);
          padding: 2px 6px;
          border-radius: 3px;
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
