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
import IncomingCallModal from './IncomingCallModal';
import { useCommandStore } from '../../stores/commandStore';
import { useIncomingCallHandler } from '../../hooks/useIncomingCallHandler';

export default function CommandMode() {
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);
  const startCall = useCommandStore((s) => s.startCall);
  const addCommandFeedItem = useCommandStore((s) => s.addCommandFeedItem);
  const hasExecuting = strategies.some((s) => s.status === 'executing' || s.status === 'done');
  const mainBottom = hasExecuting ? 230 : 190;

  const {
    showIncomingCall,
    incomingCallMessage,
    incomingCallPerson,
    setShowIncomingCall,
  } = useIncomingCallHandler(commandFeed, fieldPersons);

  const handleAcceptVideo = () => {
    setShowIncomingCall(false);
    if (incomingCallPerson) {
      startCall(incomingCallPerson.id);
      addCommandFeedItem(`已接通${incomingCallPerson.name}视频通话`);
    }
  };

  const handleAcceptVoice = () => {
    setShowIncomingCall(false);
    if (incomingCallPerson) {
      addCommandFeedItem(`已接通${incomingCallPerson.name}语音通话`);
    }
  };

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
          padding: '0 2px',
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

      {/* Incoming call modal */}
      {showIncomingCall && incomingCallPerson && (
        <IncomingCallModal
          person={incomingCallPerson}
          message={incomingCallMessage}
          onAcceptVideo={handleAcceptVideo}
          onAcceptVoice={handleAcceptVoice}
          onDecline={() => setShowIncomingCall(false)}
        />
      )}
    </>
  );
}
