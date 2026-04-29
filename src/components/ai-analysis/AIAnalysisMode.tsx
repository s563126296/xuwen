import AIStatusBar from './AIStatusBar';
import QueryFilterPanel from '../analysis/QueryFilterPanel';
import HistoryEventList from '../analysis/HistoryEventList';
import MainViewArea from '../analysis/MainViewArea';
import StatsSummaryPanel from '../analysis/StatsSummaryPanel';
import QuickFilterPanel from '../analysis/QuickFilterPanel';

export default function AIAnalysisMode() {
  return (
    <>
      <AIStatusBar />
      <div style={{
        position: 'absolute',
        top: 136,
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
          <QueryFilterPanel />
          <HistoryEventList />
        </div>

        {/* Center */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <MainViewArea />
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
          <StatsSummaryPanel />
          <QuickFilterPanel />
        </div>
      </div>
    </>
  );
}
