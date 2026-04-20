import TrendPredictionPanel from './TrendPredictionPanel';
import CausalReasoningPanel from './CausalReasoningPanel';
import AIRecommendationPanel from './AIRecommendationPanel';
import SafetyPanel from './SafetyPanel';
import MapContainer from '../map/MapContainer';

export default function AIDecisionMode() {
  return (
    <div style={{
      position: 'absolute',
      top: 84,
      bottom: 16,
      left: 16,
      right: 16,
      display: 'flex',
      gap: 12,
    }}>
      {/* Left column */}
      <div style={{
        width: 340,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflow: 'hidden',
      }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <TrendPredictionPanel />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CausalReasoningPanel />
        </div>
      </div>

      {/* Center - Map */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <MapContainer />
        </div>
      </div>

      {/* Right column */}
      <div style={{
        width: 340,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflow: 'hidden',
      }}>
        <div style={{ flex: 1.2, minHeight: 0 }}>
          <AIRecommendationPanel />
        </div>
        <div style={{ flex: 0.8, minHeight: 0 }}>
          <SafetyPanel />
        </div>
      </div>
    </div>
  );
}
