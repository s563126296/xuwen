import AIStatusBar from './AIStatusBar';
import AIAnalysisMap from './AIAnalysisMap';
import InsightPanel from './panels/InsightPanel';
import CorrelationPanel from './panels/CorrelationPanel';
import DecisionAssistPanel from './panels/DecisionAssistPanel';
import './ai-analysis-mode.css';

export default function AIAnalysisMode() {
  return (
    <div className="ai-analysis-mode">
      <AIStatusBar />

      <div className="ai-analysis-content">
        <aside className="ai-analysis-side ai-analysis-side--left">
          <InsightPanel />
          <CorrelationPanel />
        </aside>

        <main className="ai-analysis-center">
          <AIAnalysisMap />
        </main>

        <aside className="ai-analysis-side ai-analysis-side--right">
          <DecisionAssistPanel />
        </aside>
      </div>
    </div>
  );
}
