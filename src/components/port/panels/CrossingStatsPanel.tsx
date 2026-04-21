import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

const VEHICLE_COLORS = {
  car: '#00D0E9',
  truck: '#F5A623',
  bus: '#2ED573',
};

export default function CrossingStatsPanel() {
  const { crossingStats } = usePortStore();

  const hourlyData = crossingStats.hourlyDistribution.map((count, hour) => ({
    hour,
    count,
  }));

  const pieData = [
    { name: '小客车', value: crossingStats.byType.car, color: VEHICLE_COLORS.car },
    { name: '货车', value: crossingStats.byType.truck, color: VEHICLE_COLORS.truck },
    { name: '客车', value: crossingStats.byType.bus, color: VEHICLE_COLORS.bus },
  ];

  const total = crossingStats.byType.car + crossingStats.byType.truck + crossingStats.byType.bus;
  const isUp = crossingStats.yoyChange >= 0;

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
        <TrendingUp size={14} />
        车辆过海统计
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', minHeight: 0 }}>
        {/* 左侧：今日总量 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
          <div style={bigNumberStyle}>
            <CountUp end={crossingStats.todayTotal} duration={1.5} separator="," />
            <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>辆</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginTop: 4,
          }}>
            {isUp ? <ArrowUp size={12} color="#2ED573" /> : <ArrowDown size={12} color="#FF4757" />}
            <span style={{
              fontSize: 11,
              color: isUp ? '#2ED573' : '#FF4757',
              fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
            }}>
              {isUp ? '+' : ''}{crossingStats.yoyChange}%
            </span>
            <span style={labelStyle}>同比</span>
          </div>
        </div>

        {/* 中部：小时分布柱状图 */}
        <div style={{ flex: 1, height: 60, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={false}
                tickLine={false}
                interval={5}
              />
              <Bar dataKey="count" fill="#00D0E9" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 右侧：车型饼图 */}
        <div style={{ width: 80, height: 70, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={16}
                outerRadius={28}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            marginTop: 2,
          }}>
            {pieData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                  {item.name} {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
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
}
