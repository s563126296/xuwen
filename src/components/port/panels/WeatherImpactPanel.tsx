import React from 'react';
import { CloudRain, Eye, Waves, ArrowUpDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import CollapsibleCard from '../../common/CollapsibleCard';

const getTideText = (status: string): string => {
  const map: Record<string, string> = { rising: '涨潮', falling: '退潮', high: '高潮', low: '低潮' };
  return map[status] || status;
};

export const WeatherImpactPanel: React.FC = () => {
  const { weather } = usePortStore();

  const leftExpanded = usePortPanelStore((s) => s.leftExpanded);
  const toggleLeft = usePortPanelStore((s) => s.toggleLeft);
  const isExpanded = leftExpanded.includes('weather');

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      风速 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{weather.windSpeed.toFixed(1)}m/s</span> ·
      能见度 <span style={{ color: '#4da6ff' }}>{weather.forecast[0]?.visibility || 0}km</span> ·
      {weather.suspensionWarning && <span style={{ color: '#FF4757', fontWeight: 600 }}> 停航预警</span>}
      {!weather.suspensionWarning && <span> {weather.temperature}°C</span>}
    </div>
  );

  return (
    <CollapsibleCard
      title="海洋气象"
      icon={<CloudRain size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleLeft('weather')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* 风速行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '4px 8px' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>风速</span>
          <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{weather.windSpeed.toFixed(1)} m/s</span>
          <span style={{ fontSize: 16, color: '#F5A623' }}>
            {(() => {
              const d = weather.windDirection;
              if (d >= 337.5 || d < 22.5) return '\u2191';
              if (d >= 22.5 && d < 67.5) return '\u2197';
              if (d >= 67.5 && d < 112.5) return '\u2192';
              if (d >= 112.5 && d < 157.5) return '\u2198';
              if (d >= 157.5 && d < 202.5) return '\u2193';
              if (d >= 202.5 && d < 247.5) return '\u2199';
              if (d >= 247.5 && d < 292.5) return '\u2190';
              return '\u2196';
            })()}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{weather.windDirection}°</span>
        </div>

        {/* 两列信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[
            { icon: Eye, label: '能见度', value: `${weather.forecast[0]?.visibility || 0} km` },
            { icon: Waves, label: '浪高', value: `${weather.forecast[0]?.waveHeight || 0} m` },
            { icon: ArrowUpDown, label: '潮汐', value: getTideText(weather.tideStatus) },
            { icon: CloudRain, label: '温度', value: `${weather.temperature}°C` },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '4px 8px' }}>
              <item.icon size={12} style={{ color: '#4da6ff' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginLeft: 'auto' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* 折线图 */}
        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weather.forecast}>
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={20} />
              <Line type="monotone" dataKey="windLevel" stroke="#00D0E9" strokeWidth={1.5} dot={{ r: 2, fill: '#00D0E9' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 停航预警 */}
        {weather.suspensionWarning && (
          <div style={{
            background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: 6, padding: '4px 8px', textAlign: 'center',
            fontSize: 10, color: '#FF4757', fontWeight: 600,
          }}>
            停航预警
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default WeatherImpactPanel;
