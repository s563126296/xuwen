import React, { useState } from 'react';
import { Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import CollapsibleCard from '../../common/CollapsibleCard';

const getLoadColor = (rate: number): string => {
  if (rate < 50) return '#2ED573';
  if (rate < 75) return '#F5A623';
  return '#FF4757';
};

type PortTab = 'xuwen' | 'haian';

export const PortCapacityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortTab>('xuwen');
  const { portCapacity } = usePortStore();

  const leftExpanded = usePortPanelStore((s) => s.leftExpanded);
  const toggleLeft = usePortPanelStore((s) => s.toggleLeft);
  const isExpanded = leftExpanded.includes('capacity');

  const data = activeTab === 'xuwen' ? portCapacity.xuwen : portCapacity.haian;
  const loadColor = getLoadColor(data.loadRate);

  const trendData = data.hourlyTrend.map((val, i) => ({
    label: i === 3 ? '现在' : `${-(3 - i)}h`,
    value: val,
  }));

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '2px 6px', fontSize: 9, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
    background: active ? 'rgba(0,208,233,0.2)' : 'transparent',
    color: active ? '#00D0E9' : 'rgba(255,255,255,0.5)',
    border: active ? '1px solid rgba(0,208,233,0.3)' : '1px solid transparent',
    transition: 'all 0.2s ease',
  });

  const xw = portCapacity.xuwen;
  const ha = portCapacity.haian;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      徐闻 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{xw.availableVessels}艘</span>
      /<span style={{ color: '#4da6ff' }}>{xw.loadRate}%</span> | 海安 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{ha.availableVessels}艘</span>
      /<span style={{ color: '#4da6ff' }}>{ha.loadRate}%</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="港口运力"
      icon={<Ship size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleLeft('capacity')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={(e) => e.stopPropagation()}>
        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={tabStyle(activeTab === 'xuwen')} onClick={() => setActiveTab('xuwen')}>徐闻港</div>
          <div style={tabStyle(activeTab === 'haian')} onClick={() => setActiveTab('haian')}>海安新港</div>
        </div>

        {/* 数字卡片 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 4 }}>可运船舶</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>
              <CountUp end={data.availableVessels} duration={1.5} />
              <span style={{ fontSize: 11, color: '#A0A8B4', fontWeight: 400, marginLeft: 4 }}>艘</span>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 4 }}>可运车位</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>
              <CountUp end={data.availableSlots} duration={1.5} />
              <span style={{ fontSize: 11, color: '#A0A8B4', fontWeight: 400, marginLeft: 4 }}>位</span>
            </div>
          </div>
        </div>

        {/* 装载率进度条 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>装载率</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: loadColor, fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>{data.loadRate}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(0,208,233,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${data.loadRate}%`, height: '100%', background: `linear-gradient(90deg, ${loadColor}cc, ${loadColor})`, borderRadius: 4, transition: 'width 0.5s ease', boxShadow: `0 0 8px ${loadColor}` }} />
          </div>
        </div>

        {/* 运力消化趋势 */}
        <div style={{ height: 80 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>运力消化趋势</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={25} />
              <Bar dataKey="value" fill="#00D0E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default PortCapacityPanel;
