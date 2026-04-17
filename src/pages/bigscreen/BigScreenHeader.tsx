import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import Counter from './components/Counter';

const LEVEL_MAP: Record<string, string> = {
  green: '畅通',
  yellow: '关注',
  orange: '预警',
  red: '严重',
};

const WEATHER_ICON_MAP: Record<string, string> = {
  sun: '☀',
  cloud: '☁',
  'cloud-rain': '🌧',
  'cloud-fog': '🌫',
};

export default function BigScreenHeader() {
  const [time, setTime] = useState(new Date());
  const {
    currentWeather,
    portDigestion,
    corridorPressure,
    urbanHealth,
    aiSummary,
    predictions,
  } = useDashboardStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const weatherStr = `${WEATHER_ICON_MAP[currentWeather.conditionIcon] || ''} ${currentWeather.condition} ${currentWeather.temperature}°C`;

  const kpis = useMemo(() => {
    // Congestion index: last non-predicted value
    const realPredictions = predictions.filter((p) => !p.isPredicted);
    const congestionIndex =
      realPredictions.length > 0
        ? realPredictions[realPredictions.length - 1].index
        : 0;

    // Port waiting: sum of both ports
    const portWaiting =
      portDigestion.xuwen.waitingVehicles + portDigestion.haian.waitingVehicles;

    // Corridor pressure: average of 4 directions
    const directions = ['north', 'south', 'east', 'west'] as const;
    const avgPressure = Math.round(
      directions.reduce((sum, d) => sum + corridorPressure[d].pressure, 0) /
        directions.length
    );

    return [
      { label: '今日车流', value: '12,847' },
      { label: '拥堵指数', value: congestionIndex.toFixed(1) },
      { label: '港口等待', value: String(portWaiting) },
      { label: '通道压力', value: `${avgPressure}%` },
      { label: '城区健康', value: String(urbanHealth.score) },
      {
        label: 'AI研判',
        value: LEVEL_MAP[aiSummary.level] || aiSummary.level,
      },
    ];
  }, [predictions, portDigestion, corridorPressure, urbanHealth, aiSummary]);

  return (
    <div className="bs-header">
      <div className="bs-header-top">
        <h1 className="bs-title">徐闻县智慧交通管控平台</h1>
        <div className="bs-header-info">
          <span className="bs-time">{timeStr}</span>
          <span className="bs-weather">{weatherStr}</span>
        </div>
      </div>
      <div className="bs-kpi-bar">
        {kpis.map((kpi) => (
          <div className="bs-kpi-item" key={kpi.label}>
            <span className="bs-kpi-value"><Counter value={kpi.value} /></span>
            <span className="bs-kpi-label">{kpi.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
