import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';

const VEHICLE_COLORS = { car: '#00D0E9', truck: '#F5A623', bus: '#2ED573' };

export default function CrossingStatsPanel() {
  const { crossingStats } = usePortStore();

  const hourlyData = crossingStats.hourlyDistribution.map((count, hour) => ({ hour, count }));
  const pieData = [
    { name: '客车', value: crossingStats.byType.car, color: VEHICLE_COLORS.car },
    { name: '货车', value: crossingStats.byType.truck, color: VEHICLE_COLORS.truck },
    { name: '大巴', value: crossingStats.byType.bus, color: VEHICLE_COLORS.bus },
  ];
  const total = crossingStats.byType.car + crossingStats.byType.truck + crossingStats.byType.bus;
  const isUp = crossingStats.yoyChange >= 0;

  return (
    <div className="module-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 10px' }}>
      {/* 标题行 + 核心数字 同行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexShrink: 0 }}>
        <TrendingUp size={12} style={{ color: '#4da6ff' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>车辆过海</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>
            <CountUp end={crossingStats.todayTotal} duration={1.5} separator="," />
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>辆</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
            {isUp ? <ArrowUp size={10} color="#2ED573" /> : <ArrowDown size={10} color="#FF4757" />}
            <span style={{ fontSize: 10, color: isUp ? '#2ED573' : '#FF4757', fontFamily: 'DIN, sans-serif' }}>
              {isUp ? '+' : ''}{crossingStats.yoyChange}%
            </span>
          </span>
        </div>
      </div>

      {/* 内容区：柱状图 + 饼图图例 */}
      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        {/* 柱状图 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} interval={5} />
              <Bar dataKey="count" fill="#00D0E9" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 饼图 + 图例 */}
        <div style={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div style={{ width: 56, height: 56 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={14} outerRadius={26} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {pieData.map((item) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                {item.name} {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
