import { useState } from 'react';
import DataRangeBanner from './DataRangeBanner';
import AnalysisElementList from '../ai-analysis/panels/AnalysisElementList';
import StrategyRecommendationPanel from '../ai-analysis/panels/StrategyRecommendationPanel';
import AIAnalysisMap from '../ai-analysis/AIAnalysisMap';
import '../ai-analysis/ai-analysis-mode.css';

export default function AnalysisMode() {
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();

  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId);
    // TODO: 地图聚焦到对应区域
  };

  return (
    <div className="ai-analysis-mode">
      <DataRangeBanner />

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
