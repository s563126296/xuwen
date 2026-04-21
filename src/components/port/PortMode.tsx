import StraitSchematicMap from './schematic/StraitSchematicMap';
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

export default function PortMode() {
  return (
    <>
      <PortSimulator />
      <style>{`
        @keyframes portFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div style={{ animation: 'portFadeIn 0.5s ease-out' }}>
        {/* Main 3-column layout */}
        <div
          style={{
            position: 'absolute',
            top: 84,
            left: 16,
            right: 16,
            bottom: 148,
            display: 'flex',
            gap: 12,
          }}
        >
          {/* Left column */}
          <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ height: 200, flexShrink: 0 }}>
              <StraitIndexPanel />
            </div>
            <div style={{ height: 240, flexShrink: 0 }}>
              <WeatherImpactPanel />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PortCapacityPanel />
            </div>
          </div>

          {/* Center: Strait Schematic Map */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <StraitSchematicMap />
          </div>

          {/* Right column */}
          <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ height: 260, flexShrink: 0 }}>
              <SchedulePanel />
            </div>
            <div style={{ height: 200, flexShrink: 0 }}>
              <QueuePredictionPanel />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PortComparisonPanel />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 16,
            right: 16,
            height: 120,
            display: 'flex',
            gap: 12,
          }}
        >
          <CrossingStatsPanel />
          <WaitingAreaPanel />
          <VideoMonitorPanel />
        </div>
      </div>
    </>
  );
}
