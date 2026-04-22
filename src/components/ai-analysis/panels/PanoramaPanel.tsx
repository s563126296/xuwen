import { Activity } from 'lucide-react';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useAIAnalysisStore } from '../../../stores';

export default function PanoramaPanel() {
  const healthRadar = useAIAnalysisStore((s) => s.healthRadar);
  const portCityTrend = useAIAnalysisStore((s) => s.portCityTrend);

  const radarData = healthRadar.map((d) => ({
    dimension: d.dimension,
    value: d.value,
    threshold: d.threshold,
  }));

  const trendData = portCityTrend.slice(0, 12).map((point) => ({
    time: point.time,
    port: Math.round(point.portPressure),
    city: Math.round(point.cityPressure),
  }));

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <Activity size={15} />
        <h3>运行健康全景</h3>
        <span className="ai-panel__badge">全景</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 健康雷达 */}
        <div className="health-radar">
          <div className="health-radar__title">交通健康雷达</div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(180,200,220,0.1)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: 'rgba(180,200,220,0.65)', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'rgba(180,200,220,0.35)', fontSize: 9 }}
              />
              <Radar
                name="当前值"
                dataKey="value"
                stroke="#4DA6FF"
                fill="#4DA6FF"
                fillOpacity={0.2}
              />
              <Radar
                name="阈值"
                dataKey="threshold"
                stroke="#FB923C"
                fill="none"
                strokeDasharray="4 4"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 港口-城区联动趋势 */}
        <div className="port-city-trend">
          <div className="port-city-trend__title">港口-城区联动趋势</div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={trendData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(180,200,220,0.06)" strokeDasharray="3 5" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 9 }}
                interval={2}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(180,200,220,0.45)', fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6, 13, 26, 0.96)',
                  border: '1px solid rgba(77, 166, 255, 0.28)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Line type="monotone" dataKey="port" stroke="#4DA6FF" strokeWidth={2} dot={false} name="港口压力" />
              <Line type="monotone" dataKey="city" stroke="#A78BFA" strokeWidth={2} dot={false} name="城区压力" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
