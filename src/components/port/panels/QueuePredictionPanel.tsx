import React from 'react';
import { Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from 'recharts';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import CollapsibleCard from '../../common/CollapsibleCard';

export const QueuePredictionPanel: React.FC = () => {
  const queue = usePortStore((state) => state.queue);
  const totalByType = queue.byType.car + queue.byType.truck + queue.byType.hazmat;
  const currentPointIndex = Math.floor(queue.trend.length / 2);

  const rightExpanded = usePortPanelStore((s) => s.rightExpanded);
  const toggleRight = usePortPanelStore((s) => s.toggleRight);
  const isExpanded = rightExpanded.includes('queue');

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      排队 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{queue.totalVehicles}辆</span> ·
      预计等待 <span style={{ color: '#F5A623', fontWeight: 600 }}>{queue.estimatedWait}分钟</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="待舶队列"
      icon={<Users size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleRight('queue')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 大数字 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#00D0E9', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace", lineHeight: 1 }}>
              <CountUp end={queue.totalVehicles} duration={1.5} />
              <span style={{ fontSize: 11, marginLeft: 4, color: '#999', fontWeight: 400 }}>辆</span>
            </div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>当前排队</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F5A623', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace", lineHeight: 1 }}>
              <CountUp end={queue.estimatedWait} duration={1.5} />
              <span style={{ fontSize: 11, marginLeft: 4, color: '#999', fontWeight: 400 }}>分钟</span>
            </div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>预计等待</div>
          </div>
        </div>

        {/* 趋势图 */}
        <div style={{ height: 50 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={queue.trend}>
              <defs>
                <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D0E9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D0E9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <ReferenceLine x={queue.trend[currentPointIndex]?.time} stroke="rgba(245,166,35,0.8)" strokeDasharray="2 2" />
              <Area type="monotone" dataKey="count" stroke="#00D0E9" strokeWidth={1.5} fill="url(#queueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 车型分布 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: '小客车', count: queue.byType.car, color: '#00D0E9' },
            { label: '货车', count: queue.byType.truck, color: '#F5A623' },
            { label: '危化品', count: queue.byType.hazmat, color: '#FF4757' },
          ].map((item) => (
            <div key={item.label} style={{ position: 'relative', height: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: `${(item.count / totalByType) * 100}%`, height: '100%', background: item.color, opacity: 0.7 }} />
              <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff', zIndex: 1 }}>
                {item.label} {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleCard>
  );
};
