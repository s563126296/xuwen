export default function WeatherCard() {
  return (
    <div className="card weather-card animate-in delay-5">
      <div className="card-header">
        <span className="card-title">天气信息</span>
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
        </div>
      </div>
      <div className="weather-current">
        <div className="weather-icon">☀️</div>
        <div>
          <div className="weather-temp">26<span>°C</span></div>
          <div className="weather-desc">晴 · 东南风 2级</div>
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-detail">
          <div className="weather-detail-label">湿度</div>
          <div className="weather-detail-value">72%</div>
        </div>
        <div className="weather-detail">
          <div className="weather-detail-label">能见度</div>
          <div className="weather-detail-value">15km</div>
        </div>
        <div className="weather-detail">
          <div className="weather-detail-label">气压</div>
          <div className="weather-detail-value">1012hPa</div>
        </div>
        <div className="weather-detail">
          <div className="weather-detail-label">紫外线</div>
          <div className="weather-detail-value">中等</div>
        </div>
      </div>

      <style>{`
        .weather-current { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .weather-icon { font-size: 48px; line-height: 1; }
        .weather-temp { font-family: 'Orbitron', sans-serif; font-size: 36px; font-weight: 700; color: var(--text-primary); }
        .weather-temp span { font-size: 18px; opacity: 0.7; margin-left: 4px; }
        .weather-desc { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
        .weather-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .weather-detail { padding: 12px; background: var(--bg-secondary); border-radius: 8px; }
        .weather-detail-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
        .weather-detail-value { font-size: 14px; font-weight: 500; color: var(--text-primary); }
      `}</style>
    </div>
  );
}
