import AIStatusBar from './AIStatusBar';
import DecisionSandbox from './DecisionSandbox';
import AIAnalysisMap from './AIAnalysisMap';
import InsightPanel from './panels/InsightPanel';
import CorrelationPanel from './panels/CorrelationPanel';
import AlertRadarPanel from './panels/AlertRadarPanel';
import RiskPropagationPanel from './panels/RiskPropagationPanel';
import DecisionAssistPanel from './panels/DecisionAssistPanel';
import PanoramaPanel from './panels/PanoramaPanel';
import TimelineController from './TimelineController';
import './ai-analysis-mode.css';

export default function AIAnalysisMode() {
  return (
    <div className="ai-analysis-mode">
      {/* AI状态条 */}
      <AIStatusBar />

      {/* 主内容区：四象限 + 中央区域 */}
      <div className="ai-analysis-content">
        {/* 左侧象限 */}
        <aside className="ai-analysis-quadrant ai-analysis-quadrant--left">
          <InsightPanel />
          <CorrelationPanel />
        </aside>

        {/* 中央区域 */}
        <main className="ai-analysis-center">
          <DecisionSandbox />
          <AIAnalysisMap />
        </main>

        {/* 右侧象限 */}
        <aside className="ai-analysis-quadrant ai-analysis-quadrant--right">
          <AlertRadarPanel />
          <RiskPropagationPanel />
          <DecisionAssistPanel />
          <PanoramaPanel />
        </aside>
      </div>

      {/* 时间轴控制器 */}
      <TimelineController />
    </div>
  );
}
