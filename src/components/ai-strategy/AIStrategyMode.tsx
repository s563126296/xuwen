import DataRangeBanner from '../analysis/DataRangeBanner';
import QueryFilterPanel from '../analysis/QueryFilterPanel';
import HistoryEventList from '../analysis/HistoryEventList';
import StatsSummaryPanel from '../analysis/StatsSummaryPanel';
import QuickFilterPanel from '../analysis/QuickFilterPanel';
import AIStrategyMainView from './AIStrategyMainView';

export default function AIStrategyMode() {
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
          <AIStrategyMainView />
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
