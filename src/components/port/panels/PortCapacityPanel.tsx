import React, { useState } from 'react';
import { Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(10,30,50,0.9) 100%)',
  border: '1px solid rgba(0,208,233,0.3)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(12px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
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
              <CountUp end={data.availableVessels} duration={1.5} />
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
              <CountUp end={data.availableSlots} duration={1.5} />
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
            position: 'relative',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: `${data.loadRate}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${loadColor}cc, ${loadColor}ff, ${loadColor}cc)`,
              backgroundSize: '200% 100%',
              animation: 'progressShine 2s ease-in-out infinite',
              position: 'relative',
              boxShadow: `0 0 10px ${loadColor}, inset 0 0 5px ${loadColor}`,
              transition: 'width 0.5s ease',
            }}>
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '30%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${loadColor}ff)`,
                animation: 'progressGlow 1.5s ease-in-out infinite',
              }} />
            </div>
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

      <style>{`
        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes progressShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes progressGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};


export default PortCapacityPanel;
