import ShutdownRiskPanel from './panels/ShutdownRiskPanel';
import ResilienceRadar from './panels/ResilienceRadar';
import AiSummaryPanel from './panels/AiSummaryPanel';

export default function BigScreenRight() {
  return (
    <div className="bs-right">
      <ShutdownRiskPanel />
      <ResilienceRadar />
      <AiSummaryPanel />
    </div>
  );
}
