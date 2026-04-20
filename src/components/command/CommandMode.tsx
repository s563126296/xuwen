import CommandSummaryBar from './CommandSummaryBar';
import CommandMap from './CommandMap';
import StrategyCommandPanel from './StrategyCommandPanel';
import CommandCommPanel from './CommandCommPanel';
import StrategyConfirmModal from './StrategyConfirmModal';
import PhotoViewerModal from './PhotoViewerModal';
import ChatWindow from './ChatWindow';
import VideoCallWindow from './VideoCallWindow';
import CommandReportModal from './CommandReportModal';
import EscalateConfirmModal from './EscalateConfirmModal';
import CongestionDetailModal from './CongestionDetailModal';
import { useCommandStore } from '../../stores/commandStore';

export default function CommandMode() {
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const hasExecuting = strategies.some((s) => s.status === 'executing' || s.status === 'done');
  const mainBottom = hasExecuting ? 310 : 240;

  return (
    <>
      {/* Summary bar: below header (80px), height ~48px */}
      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, zIndex: 101 }}>
        <CommandSummaryBar />
      </div>

      {/* Main content: map + strategy panel */}
      <div style={{
        position: 'absolute', top: 140, left: 16, right: 16, bottom: mainBottom,
        display: 'flex', gap: 12,
      }}>
        {/* Map: flex:1, ~70% */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <CommandMap />
          </div>
        </div>

        {/* Strategy panel: 300px */}
        <div style={{
          width: 300, overflowY: 'auto',
          background: 'rgba(10,15,25,0.95)',
          border: '1px solid rgba(0,208,233,0.12)',
          borderRadius: 6,
          backdropFilter: 'blur(10px)',
          padding: '12px 10px',
        }}>
          <StrategyCommandPanel />
        </div>
      </div>

      {/* Chat window */}
      <ChatWindow />

      {/* Video call window */}
      <VideoCallWindow />

      {/* Bottom: comms panel */}
      <CommandCommPanel />

      {/* Modals */}
      <StrategyConfirmModal />
      <PhotoViewerModal />
      <CommandReportModal />
      <EscalateConfirmModal />
      <CongestionDetailModal />
    </>
  );
}
