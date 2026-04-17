import { Sun, Cloud, CloudRain, CloudFog, Wind, Eye, Waves } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const iconMap = {
  sun: Sun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-fog': CloudFog,
};

export default function HeaderWeather() {
  const weather = useDashboardStore((s) => s.currentWeather);
  const WeatherIcon = iconMap[weather.conditionIcon];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: '6px 14px',
      background: 'rgba(0, 208, 233, 0.06)',
      border: '1px solid rgba(0, 208, 233, 0.15)',
      borderRadius: 10,
      minWidth: 160,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <WeatherIcon size={16} color="#00D0E9" />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#00D0E9', fontFamily: 'DIN, sans-serif' }}>
          {weather.temperature}°C
        </span>
        <span style={{ fontSize: 12, color: '#C9CDD4' }}>{weather.condition}</span>
        <span style={{ fontSize: 12, color: '#A0A8B4', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Wind size={11} color="#A0A8B4" />{weather.windDirection}风{weather.windLevel}级
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#A0A8B4' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Eye size={10} />能见度 {weather.visibility}km
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Waves size={10} />浪高 {weather.waveHeight}m
        </span>
      </div>
    </div>
  );
}
