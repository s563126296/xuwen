// 琼州海峡示意图主容器
import { RadioTower, Ship, Waves, Wind } from 'lucide-react';
import { usePortStore } from '../../../stores/portStore';
import { SVG_WIDTH, SVG_HEIGHT } from './hooks/useCoordinateMap';
import SeaBackground from './layers/SeaBackground';
import Coastlines from './layers/Coastlines';
import PortStructures from './layers/PortStructures';
import ShippingLanes from './layers/ShippingLanes';
import VesselRenderer from './layers/VesselRenderer';

export default function StraitSchematicMap() {
  const straitIndex = usePortStore((s) => s.straitIndex);
  const weather = usePortStore((s) => s.weather);
  const vessels = usePortStore((s) => s.vessels);
  const selectedVessel = usePortStore((s) => s.selectedVessel);

  const sailingCount = vessels.filter((vessel) => vessel.status === 'sailing').length;
  const selectedVesselName = vessels.find((vessel) => vessel.id === selectedVessel)?.name ?? '未锁定目标';
  const navigationLabel =
    straitIndex.navigationStatus === 'open' ? '通航窗口稳定' : straitIndex.navigationStatus === 'restricted' ? '通航窗口受限' : '停航管制';

  return (
    <div className="strait-map">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="strait-map__svg"
        role="img"
        aria-label="琼州海峡港航仿真示意图"
      >
        <SeaBackground />
        <Coastlines />
        <PortStructures />
        <ShippingLanes />
        <VesselRenderer />

        <g className="strait-map__sensor-layer">
          {[
            { x: 162, y: 318, label: '潮位站' },
            { x: 476, y: 350, label: '风浪浮标' },
            { x: 872, y: 328, label: 'AIS基站' },
            { x: 1034, y: 436, label: '雷达哨位' },
          ].map((sensor) => (
            <g key={sensor.label} transform={`translate(${sensor.x} ${sensor.y})`}>
              <circle r="18" fill="none" stroke="rgba(0,208,233,0.22)" strokeDasharray="3 7">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="18s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" fill="#8ff4ff" />
              <line x1="0" y1="-18" x2="0" y2="-34" stroke="rgba(143,244,255,0.35)" strokeDasharray="2 4" />
              <text x="0" y="-42" textAnchor="middle" fill="rgba(210,245,255,0.68)" fontSize="12">
                {sensor.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="strait-map__header">
        <div>
          <div className="strait-map__eyebrow">SCHEMATIC OPERATIONS MAP</div>
          <div className="strait-map__title">徐闻-海口港航联动示意图</div>
        </div>
        <div className="strait-map__header-stats">
          <span><Ship size={13} /> AIS {sailingCount} 艘</span>
          <span><RadioTower size={13} /> {navigationLabel}</span>
        </div>
      </div>

      <div className="strait-map__weather-card">
        <div className="strait-map__weather-item">
          <Wind size={15} />
          <span>风速</span>
          <b>{weather.windSpeed.toFixed(1)}m/s</b>
        </div>
        <div className="strait-map__weather-item">
          <Waves size={15} />
          <span>浪高</span>
          <b>{straitIndex.waveHeight}m</b>
        </div>
        <div className="strait-map__weather-item">
          <RadioTower size={15} />
          <span>目标</span>
          <b>{selectedVesselName}</b>
        </div>
      </div>

      <div className="strait-map__legend">
        <span><i className="legend-dot legend-dot--cyan" />徐闻侧港区</span>
        <span><i className="legend-dot legend-dot--amber" />海南侧港区</span>
        <span><i className="legend-line legend-line--primary" />主航道</span>
        <span><i className="legend-line legend-line--secondary" />轮渡/铁路航道</span>
      </div>

      <div className="strait-map__timeline">
        {['靠泊确认', '闸口放行', '装载复核', '离泊过峡', '到港消化'].map((step, index) => (
          <div className="strait-map__timeline-step" key={step}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
