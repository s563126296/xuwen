import EmergencyBanner from './EmergencyBanner';
import EmergencyForecastPanel from './EmergencyForecastPanel';
import SpecialVehiclePanel from './SpecialVehiclePanel';
import SupplyDemandPanel from './SupplyDemandPanel';
import EmergencyMap from './EmergencyMap';
import EmergencyTaskBoard from './EmergencyTaskBoard';
import EmergencyPlanPanel from './EmergencyPlanPanel';
import EmergencyCommPanel from './EmergencyCommPanel';
import EmergencyTimeline from './EmergencyTimeline';

export default function EmergencyMode() {
  return (
    <>
      {/* Top alert banner: below header (80px) */}
      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, zIndex: 110 }}>
        <EmergencyBanner />
      </div>

      {/* Main 3-column layout */}
      <div
        style={{
          position: 'absolute',
          top: 152,
          left: 16,
          right: 16,
          bottom: 184,
          display: 'flex',
          gap: 12,
        }}
      >
        {/* Left column */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EmergencyForecastPanel />
          <SpecialVehiclePanel />
          <SupplyDemandPanel />
        </div>

        {/* Center: map */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EmergencyMap />
        </div>

        {/* Right column */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EmergencyTaskBoard />
          <EmergencyPlanPanel />
          <EmergencyCommPanel />
        </div>
      </div>

      {/* Bottom timeline */}
      <EmergencyTimeline />
    </>
  );
}
