import React, { useState } from 'react';
import { Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.85)',
  border: '1px solid rgba(0,208,233,0.2)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(8px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
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

const getLoadColor = (rate: number): string => {
  if (rate < 50) return '#2ED573';
  if (rate < 75) return '#F5A623';
  return '#FF4757';
};

type PortTab = 'xuwen' | 'haian';

export const PortCapacityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortTab>('xuwen');
  const { portCapacity } = usePortStore();

  const data = activeTab === 'xuwen' ? portCapacity.xuwen : portCapacity.haian;
  const loadColor = getLoadColor(data.loadRate);

  const trendData = data.hourlyTrend.map((val, i) => ({
    label: i === 3 ? '现在' : `${-(3 - i)}h`,
    value: val,
  }));

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '4px 0',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
    borderRadius: 4,
    cursor: 'pointer',
    background: active ? 'rgba(0,208,233,0.2)' : 'transparent',
    color: active ? '#00D0E9' : 'rgba(255,255,255,0.5)',
    border: active ? '1px solid rgba(0,208,233,0.3)' : '1px solid transparent',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        <Ship size={14} />
        港口运力
      </div>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexShrink: 0 }}>
        <div style={tabStyle(activeTab === 'xuwen')} onClick={() => setActiveTab('xuwen')}>
          徐闻港
        </div>
        <div style={tabStyle(activeTab === 'haian')} onClick={() => setActiveTab('haian')}>
          海安新港
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {/* 两个大数字卡片 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1,
            background: 'rgba(0,208,233,0.05)',
            borderRadius: 6,
            padding: '8px 10px',
            textAlign: 'center',
          }}>
            <div style={bigNumberStyle}>
              {data.availableVessels}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>艘</span>
            </div>
            <div style={labelStyle}>可运船舶</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(0,208,233,0.05)',
            borderRadius: 6,
            padding: '8px 10px',
            textAlign: 'center',
          }}>
            <div style={bigNumberStyle}>
              {data.availableSlots}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>位</span>
            </div>
            <div style={labelStyle}>可运车位</div>
          </div>
        </div>

        {/* 装载率进度条 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={labelStyle}>装载率</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: loadColor, fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>
              {data.loadRate}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: 'rgba(0,208,233,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${data.loadRate}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${loadColor}, ${loadColor}dd)`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* 运力消化趋势 */}
        <div style={{ flex: 1, minHeight: 60 }}>
          <div style={{ ...labelStyle, marginBottom: 6 }}>运力消化趋势</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                width={30}
              />
              <Bar dataKey="value" fill="#00D0E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


export default PortCapacityPanel;
