import EmergencyBanner from './EmergencyBanner';
import EmergencyForecastPanel from './EmergencyForecastPanel';
import SpecialVehiclePanel from './SpecialVehiclePanel';
import SupplyDemandPanel from './SupplyDemandPanel';
import ResourceDispatchPanel from './ResourceDispatchPanel';
import EmergencyMap from './EmergencyMap';
import EmergencyTaskBoard from './EmergencyTaskBoard';
import EmergencyPlanPanel from './EmergencyPlanPanel';
import EmergencyCommPanel from './EmergencyCommPanel';
import EmergencyTimeline from './EmergencyTimeline';
import EmergencySimulator from './EmergencySimulator';
import EmergencyReportModal from './EmergencyReportModal';
import EmergencyPlanLibraryModal from './EmergencyPlanLibraryModal';
import EmergencyPlanDetailModal from './EmergencyPlanDetailModal';
import SpecialVehicleDetailModal from './SpecialVehicleDetailModal';
import EmergencyVideoConference from './EmergencyVideoConference';
import { useUIStore } from '../../stores/uiStore';

export default function EmergencyMode() {
  const activeModal = useUIStore((s) => s.activeModal);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  return (
    <>
      <style>{`
        @keyframes emergencyFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <EmergencySimulator />
      {activeModal === 'emergency-report' && (
        <EmergencyReportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'plan-library' && (
        <EmergencyPlanLibraryModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'plan-detail' && (
        <EmergencyPlanDetailModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'special-vehicle-detail' && (
        <SpecialVehicleDetailModal onClose={() => setActiveModal(null)} />
      )}
      <EmergencyVideoConference />
      <div style={{ animation: 'emergencyFadeIn 0.5s ease-out' }}>
        {/* Top alert banner: below header (80px) */}
        <div style={{ position: 'absolute', top: 84, left: 0, right: 0, zIndex: 110 }}>
          <EmergencyBanner />
        </div>

        {/* Main 3-column layout */}
        <div
          style={{
            position: 'absolute',
            top: 184,
            left: 16,
            right: 16,
            bottom: 144,
            display: 'flex',
            gap: 12,
          }}
        >
          {/* Left column */}
          <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <EmergencyForecastPanel />
            <SpecialVehiclePanel />
            <SupplyDemandPanel />
          </div>

          {/* Center: map */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <EmergencyMap />
          </div>

          {/* Right column */}
          <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <EmergencyTaskBoard />
            <ResourceDispatchPanel />
            <EmergencyPlanPanel />
            <EmergencyCommPanel />
          </div>
        </div>

        {/* Bottom timeline */}
        <EmergencyTimeline />
      </div>
    </>
  );
}
