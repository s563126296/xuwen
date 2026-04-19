import DataRangeBanner from './DataRangeBanner';
import QueryFilterPanel from './QueryFilterPanel';
import HistoryEventList from './HistoryEventList';
import MainViewArea from './MainViewArea';
import StatsSummaryPanel from './StatsSummaryPanel';
import QuickFilterPanel from './QuickFilterPanel';

export default function AnalysisMode() {
  return (
    <>
      <DataRangeBanner />
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
