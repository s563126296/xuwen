import React from 'react';
import { CloudRain, Eye, Waves, ArrowUpDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(10,30,50,0.9) 100%)',
  border: '1px solid rgba(0,208,233,0.3)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(12px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 0 20px rgba(0,208,233,0.15), inset 0 0 20px rgba(0,208,233,0.05)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.5)',
};

const getTideText = (status: string): string => {
  const map: Record<string, string> = {
    rising: '涨潮',
    falling: '退潮',
    high: '高潮',
    low: '低潮',
  };
  return map[status] || status;
};

export const WeatherImpactPanel: React.FC = () => {
  const { weather } = usePortStore();

  return (
    <div style={panelStyle}>
      {/* 边框流光 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 8,
        padding: '1px',
        background: 'linear-gradient(90deg, transparent, #00D0E9, transparent)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: 'borderFlow 3s linear infinite',
        pointerEvents: 'none',
      }} />

      <div style={titleStyle}>
        <CloudRain size={14} />
        海洋气象
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'minmax(82px, 1fr) minmax(42px, 0.55fr)', gap: 8, minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: 10, minHeight: 0 }}>
          <svg width="90" height="90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,208,233,0.2)" strokeWidth="1" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0,208,233,0.1)" strokeWidth="1" />
            <text x="50" y="12" textAnchor="middle" style={{ fontSize: 10, fill: '#00D0E9' }}>N</text>
            <text x="50" y="93" textAnchor="middle" style={{ fontSize: 10, fill: '#00D0E9' }}>S</text>
            <text x="90" y="54" textAnchor="middle" style={{ fontSize: 10, fill: '#00D0E9' }}>E</text>
            <text x="10" y="54" textAnchor="middle" style={{ fontSize: 10, fill: '#00D0E9' }}>W</text>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="#F5A623"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${weather.windDirection} 50 50)`}
            />
            <polygon
              points="50,15 47,22 53,22"
              fill="#F5A623"
              transform={`rotate(${weather.windDirection} 50 50)`}
            />
            <text
              x="50"
              y="52"
              textAnchor="middle"
              style={{ fontSize: 14, fontWeight: 700, fill: '#fff', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}
            >
              {weather.windSpeed.toFixed(1)}
            </text>
            <text x="50" y="62" textAnchor="middle" style={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }}>m/s</text>
          </svg>

          <div style={{ display: 'grid', gap: 6, alignContent: 'center', minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.035)', borderRadius: 6, padding: '6px 8px' }}>
              <Eye size={14} style={{ color: '#00D0E9' }} />
              <span style={labelStyle}>能见度</span>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                {weather.forecast[0]?.visibility || 0} km
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.035)', borderRadius: 6, padding: '6px 8px' }}>
              <Waves size={14} style={{ color: '#00D0E9' }} />
              <span style={labelStyle}>浪高</span>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                {weather.forecast[0]?.waveHeight || 0} m
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.035)', borderRadius: 6, padding: '6px 8px' }}>
              <ArrowUpDown size={14} style={{ color: '#00D0E9' }} />
              <span style={labelStyle}>潮汐</span>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                {getTideText(weather.tideStatus)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weather.forecast}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                width={25}
              />
              <Line
                type="monotone"
                dataKey="windLevel"
                stroke="#00D0E9"
                strokeWidth={2}
                dot={{ r: 3, fill: '#00D0E9' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 停航预警 */}
        {weather.suspensionWarning && (
          <div
            style={{
              background: 'rgba(255,71,87,0.2)',
              border: '1px solid #FF4757',
              borderRadius: 4,
              padding: '6px 10px',
              textAlign: 'center',
              fontSize: 12,
              color: '#FF4757',
              fontWeight: 600,
              animation: 'blink 1.5s infinite',
            }}
          >
            停航预警
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default WeatherImpactPanel;
