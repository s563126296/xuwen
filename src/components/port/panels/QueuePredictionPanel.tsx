import React from 'react';
import { Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from 'recharts';
import CountUp from 'react-countup';
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

export const QueuePredictionPanel: React.FC = () => {
  const queue = usePortStore((state) => state.queue);
  const totalByType = queue.byType.car + queue.byType.truck + queue.byType.hazmat;
  const currentPointIndex = Math.floor(queue.trend.length / 2);

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
        <Users size={14} />
        待舶队列
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#00D0E9', lineHeight: 1 }}>
            <CountUp end={queue.totalVehicles} duration={1.5} />
            <span style={{ fontSize: 12, marginLeft: 4, color: '#999' }}>辆</span>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>当前排队车辆</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F5A623', lineHeight: 1 }}>
            <CountUp end={queue.estimatedWait} duration={1.5} />
            <span style={{ fontSize: 12, marginLeft: 4, color: '#999' }}>分钟</span>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>预计等待时长</div>
        </div>
      </div>

      <div style={{ height: 60, marginBottom: 12, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={queue.trend}>
            <defs>
              <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D0E9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D0E9" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <ReferenceLine
              x={queue.trend[currentPointIndex]?.time}
              stroke="rgba(245,166,35,0.8)"
              strokeDasharray="2 2"
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00D0E9"
              strokeWidth={2}
              fill="url(#queueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ position: 'relative', height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: `${(queue.byType.car / totalByType) * 100}%`, height: '100%', background: '#00D0E9' }} />
          <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff', zIndex: 1 }}>
            小客车 {queue.byType.car}
          </div>
        </div>
        <div style={{ position: 'relative', height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: `${(queue.byType.truck / totalByType) * 100}%`, height: '100%', background: '#F5A623' }} />
          <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff', zIndex: 1 }}>
            货车 {queue.byType.truck}
          </div>
        </div>
        <div style={{ position: 'relative', height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: `${(queue.byType.hazmat / totalByType) * 100}%`, height: '100%', background: '#FF4757' }} />
          <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff', zIndex: 1 }}>
            危化品 {queue.byType.hazmat}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
