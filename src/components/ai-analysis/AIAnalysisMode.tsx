import { useState } from 'react';
import AIStatusBar from './AIStatusBar';
import AIAnalysisMap from './AIAnalysisMap';
import AnalysisElementList from './panels/AnalysisElementList';
import StrategyRecommendationPanel from './panels/StrategyRecommendationPanel';
import './ai-analysis-mode.css';

export default function AIAnalysisMode() {
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();

  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId);
    // TODO: 地图聚焦到对应区域
  };

  return (
    <div className="ai-analysis-mode">
      <AIStatusBar />

      <div className="ai-analysis-content">
        <aside className="ai-analysis-side ai-analysis-side--left">
          <AnalysisElementList
            onElementClick={handleElementClick}
            selectedElementId={selectedElementId}
          />
        </aside>

        <main className="ai-analysis-center">
          <AIAnalysisMap />
        </main>

        <aside className="ai-analysis-side ai-analysis-side--right">
          <StrategyRecommendationPanel selectedElementId={selectedElementId} />
        </aside>
      </div>
    </div>
  );
}
