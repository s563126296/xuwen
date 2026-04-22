import type { LucideIcon } from 'lucide-react';
import { Activity, Anchor, Gauge, ParkingCircle, Ship, Wind } from 'lucide-react';
import PortSemanticStraitMap from './PortSemanticStraitMap';
import StraitIndexPanel from './panels/StraitIndexPanel';
import WeatherImpactPanel from './panels/WeatherImpactPanel';
import PortCapacityPanel from './panels/PortCapacityPanel';
import { SchedulePanel } from './panels/SchedulePanel';
import { QueuePredictionPanel } from './panels/QueuePredictionPanel';
import { PortComparisonPanel } from './panels/PortComparisonPanel';
import CrossingStatsPanel from './panels/CrossingStatsPanel';
import WaitingAreaPanel from './panels/WaitingAreaPanel';
import VideoMonitorPanel from './panels/VideoMonitorPanel';
import PortSimulator from './PortSimulator';
import { usePortStore } from '../../stores/portStore';
import './port-mode.css';

interface PortMetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'cyan' | 'green' | 'amber' | 'red';
  caption: string;
}

function PortMetric({ icon: Icon, label, value, unit, tone = 'cyan', caption }: PortMetricProps) {
  return (
    <div className={`port-metric port-metric--${tone}`}>
      <div className="port-metric__icon">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="port-metric__body">
        <div className="port-metric__label">{label}</div>
        <div className="port-metric__value">
          {value}
          {unit && <span>{unit}</span>}
        </div>
        <div className="port-metric__caption">{caption}</div>
      </div>
    </div>
  );
}

export default function PortMode() {
  const straitIndex = usePortStore((s) => s.straitIndex);
  const weather = usePortStore((s) => s.weather);
  const portCapacity = usePortStore((s) => s.portCapacity);
  const queue = usePortStore((s) => s.queue);
  const crossingStats = usePortStore((s) => s.crossingStats);

  const totalAvailableSlots = portCapacity.xuwen.availableSlots + portCapacity.haian.availableSlots;
  const totalAvailableVessels = portCapacity.xuwen.availableVessels + portCapacity.haian.availableVessels;
  const avgLoadRate = Math.round((portCapacity.xuwen.loadRate + portCapacity.haian.loadRate) / 2);
  const statusTone = straitIndex.navigationStatus === 'open' ? 'green' : straitIndex.navigationStatus === 'restricted' ? 'amber' : 'red';
  const statusText = straitIndex.navigationStatus === 'open' ? '通航' : straitIndex.navigationStatus === 'restricted' ? '限航' : '停航';

  return (
    <>
      <PortSimulator />
      <section className="port-mode">
        <div className="port-mode__backdrop" />
        <div className="port-mode__harbor-grid" />

        <div className="port-mode__status-strip">
          <div className="port-mode__title-block">
            <div className="port-mode__title-row">
              <Anchor size={19} />
              <span>琼州海峡港航运行态势</span>
              <b className={`port-mode__status-dot port-mode__status-dot--${statusTone}`}>{statusText}</b>
            </div>
          </div>
          <div className="port-mode__metrics">
            <PortMetric
              icon={Gauge}
              label="海峡通行指数"
              value={straitIndex.score}
              unit="/100"
              tone={statusTone}
              caption={`风${straitIndex.windLevel}级 · 能见${straitIndex.visibility}km`}
            />
            <PortMetric
              icon={Ship}
              label="可调度船舶"
              value={totalAvailableVessels}
              unit="艘"
              tone="cyan"
              caption={`${totalAvailableSlots} 个可用车位`}
            />
            <PortMetric
              icon={ParkingCircle}
              label="当前待渡"
              value={queue.totalVehicles.toLocaleString()}
              unit="辆"
              tone={queue.estimatedWait > 60 ? 'amber' : 'cyan'}
              caption={`预计等待 ${queue.estimatedWait} 分钟`}
            />
            <PortMetric
              icon={Activity}
              label="今日过海"
              value={crossingStats.todayTotal.toLocaleString()}
              unit="辆"
              tone="green"
              caption={`两港平均装载率 ${avgLoadRate}%`}
            />
            <PortMetric
              icon={Wind}
              label="海况窗口"
              value={weather.windSpeed.toFixed(1)}
              unit="m/s"
              tone={weather.suspensionWarning ? 'red' : 'cyan'}
              caption={`浪高 ${straitIndex.waveHeight}m · ${weather.suspensionWarning ? '预警' : '稳定'}`}
            />
          </div>
        </div>

        <div className="port-mode__body">
          <aside className="port-mode__rail port-mode__rail--left">
            <div className="port-mode__panel-slot port-mode__panel-slot--index">
              <StraitIndexPanel />
            </div>
            <div className="port-mode__panel-slot port-mode__panel-slot--weather">
              <WeatherImpactPanel />
            </div>
            <div className="port-mode__panel-slot port-mode__panel-slot--capacity">
              <PortCapacityPanel />
            </div>
          </aside>

          <main className="port-mode__map-stage">
            <PortSemanticStraitMap />
          </main>

          <aside className="port-mode__rail port-mode__rail--right">
            <div className="port-mode__panel-slot port-mode__panel-slot--schedule">
              <SchedulePanel />
            </div>
            <div className="port-mode__panel-slot port-mode__panel-slot--queue">
              <QueuePredictionPanel />
            </div>
            <div className="port-mode__panel-slot port-mode__panel-slot--comparison">
              <PortComparisonPanel />
            </div>
          </aside>
        </div>

        <div className="port-mode__bottom-deck">
          <div className="port-mode__bottom-card port-mode__bottom-card--stats">
            <CrossingStatsPanel />
          </div>
          <div className="port-mode__bottom-card port-mode__bottom-card--waiting">
            <WaitingAreaPanel />
          </div>
          <div className="port-mode__bottom-card port-mode__bottom-card--video">
            <VideoMonitorPanel />
          </div>
        </div>
      </section>
    </>
  );
}
