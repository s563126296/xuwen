import React, { useState } from 'react';
import { Compass, Wind, Eye, Waves, Navigation } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import DetailModal from '../modals/DetailModal';
import CollapsibleCard from '../../common/CollapsibleCard';

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#2ED573';
  if (score >= 60) return '#F5A623';
  if (score >= 40) return '#FF6B35';
  return '#FF4757';
};

const getStatusText = (status: string): string => {
  const map: Record<string, string> = { open: '畅通', restricted: '受限', closed: '停航' };
  return map[status] || status;
};

const generateHistory = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const h = new Date(now.getTime() - (23 - i) * 3600000);
    const hour = h.getHours();
    const base = hour >= 6 && hour <= 18 ? 78 : 65;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      score: base + Math.floor(Math.random() * 15),
      wind: 3 + Math.floor(Math.random() * 3),
      visibility: 10 + Math.random() * 5,
      wave: 0.6 + Math.random() * 0.6,
    };
  });
};

const historyData = generateHistory();

const indicatorStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px',
  cursor: 'pointer', transition: 'background 0.2s',
};

export const StraitIndexPanel: React.FC = () => {
  const { straitIndex } = usePortStore();
  const scoreColor = getScoreColor(straitIndex.score);
  const [open, setOpen] = useState(false);

  const leftExpanded = usePortPanelStore((s) => s.leftExpanded);
  const toggleLeft = usePortPanelStore((s) => s.toggleLeft);
  const isExpanded = leftExpanded.includes('strait-index');

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      指数 <span style={{ color: scoreColor, fontWeight: 600 }}>{straitIndex.score}</span> ·
      风力 <span style={{ color: '#4da6ff' }}>{straitIndex.windLevel}级</span> ·
      能见度 <span style={{ color: '#4da6ff' }}>{straitIndex.visibility}km</span> ·
      <span style={{ color: straitIndex.navigationStatus === 'open' ? '#2ED573' : '#FF4757' }}> {getStatusText(straitIndex.navigationStatus)}</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="海峡通行指数"
      icon={<Compass size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleLeft('strait-index')}
    >
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        {/* 综合评分 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${straitIndex.score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: '#0A0F19',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: scoreColor,
              fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
            }}>
              {straitIndex.score}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginBottom: 2 }}>
              {getStatusText(straitIndex.navigationStatus)}
            </div>
            <div style={{ fontSize: 10, color: '#999' }}>
              {straitIndex.score >= 80 ? '通行条件良好' : straitIndex.score >= 60 ? '通行条件一般' : '通行条件较差'}
            </div>
          </div>
        </div>

        {/* 4个指标 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={indicatorStyle}>
            <Wind size={12} color="#4da6ff" />
            <div>
              <div style={{ fontSize: 10, color: '#999' }}>风力</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{straitIndex.windLevel}级</div>
            </div>
          </div>
          <div style={indicatorStyle}>
            <Eye size={12} color="#4da6ff" />
            <div>
              <div style={{ fontSize: 10, color: '#999' }}>能见度</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{straitIndex.visibility}km</div>
            </div>
          </div>
          <div style={indicatorStyle}>
            <Waves size={12} color="#4da6ff" />
            <div>
              <div style={{ fontSize: 10, color: '#999' }}>浪高</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{straitIndex.waveHeight}m</div>
            </div>
          </div>
          <div style={indicatorStyle}>
            <Navigation size={12} color="#4da6ff" />
            <div>
              <div style={{ fontSize: 10, color: '#999' }}>通航</div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{getStatusText(straitIndex.navigationStatus)}</div>
            </div>
          </div>
        </div>

        {/* 24h趋势 */}
        <div style={{ height: 60, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <XAxis dataKey="time" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis domain={[40, 100]} hide />
              <Tooltip
                contentStyle={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(0,208,233,0.3)', borderRadius: 6, fontSize: 10 }}
                labelStyle={{ color: '#00D0E9' }}
              />
              <Line type="monotone" dataKey="score" stroke="#00D0E9" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DetailModal */}
      <DetailModal
        isOpen={open}
        title="海峡通行指数详情"
        onClose={() => setOpen(false)}
      >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(0,208,233,0.08)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor, fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>
                {straitIndex.score}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>综合评分</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              <div style={{ fontSize: 14, color: '#fff' }}>风力 {straitIndex.windLevel}级</div>
              <div style={{ fontSize: 14, color: '#fff' }}>能见度 {straitIndex.visibility}km</div>
              <div style={{ fontSize: 14, color: '#fff' }}>浪高 {straitIndex.waveHeight}m</div>
              <div style={{ fontSize: 14, color: '#fff' }}>流速 {getStatusText(straitIndex.navigationStatus)}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, height: 120 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>24小时趋势</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: 'rgba(10,15,25,0.95)', border: '1px solid rgba(0,208,233,0.3)', borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="score" stroke="#00D0E9" strokeWidth={2} dot={false} name="评分" />
                <Line type="monotone" dataKey="wind" stroke="#F5A623" strokeWidth={1} dot={false} name="风力" />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </DetailModal>
    </CollapsibleCard>
  );
};

export default StraitIndexPanel;
