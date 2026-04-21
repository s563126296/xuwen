import React from 'react';
import { Compass, Wind, Eye, Waves, Navigation } from 'lucide-react';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.85)',
  border: '1px solid rgba(0,208,233,0.2)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(8px)',
  height: 200,
  display: 'flex',
  flexDirection: 'column',
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

const bigNumberStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
  color: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.5)',
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#2ED573';
  if (score >= 60) return '#F5A623';
  if (score >= 40) return '#FF6B35';
  return '#FF4757';
};

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    open: '畅通',
    restricted: '受限',
    closed: '停航',
  };
  return map[status] || status;
};

export const StraitIndexPanel: React.FC = () => {
  const { straitIndex } = usePortStore();
  const scoreColor = getScoreColor(straitIndex.score);

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        <Compass size={14} />
        海峡通行指数
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeDasharray={`${(straitIndex.score / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          <text x="60" y="55" textAnchor="middle" style={{ ...bigNumberStyle, fontSize: 32 }} fill="#fff">
            {straitIndex.score}
          </text>
          <text x="60" y="72" textAnchor="middle" style={{ fontSize: 12, fill: scoreColor, fontWeight: 600 }}>
            {getStatusText(straitIndex.navigationStatus)}
          </text>
        </svg>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Wind size={14} style={{ color: '#00D0E9', marginBottom: 2 }} />
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{straitIndex.windLevel}级</div>
            <div style={labelStyle}>风力</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Eye size={14} style={{ color: '#00D0E9', marginBottom: 2 }} />
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{straitIndex.visibility}km</div>
            <div style={labelStyle}>能见度</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Waves size={14} style={{ color: '#00D0E9', marginBottom: 2 }} />
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{straitIndex.waveHeight}m</div>
            <div style={labelStyle}>浪高</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Navigation size={14} style={{ color: '#00D0E9', marginBottom: 2 }} />
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{getStatusText(straitIndex.navigationStatus)}</div>
            <div style={labelStyle}>通航</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StraitIndexPanel;
