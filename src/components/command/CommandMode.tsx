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
import EmergencyPanels from './EmergencyPanels';
import StrategyTimelinePanel from './StrategyTimelinePanel';
import { useCommandStore } from '../../stores/commandStore';
import { useIncomingCallHandler } from '../../hooks/useIncomingCallHandler';

export default function CommandMode() {
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);
  const commandScene = useCommandStore((s) => s.commandState.commandScene);
  const strategyTimeline = useCommandStore((s) => s.commandState.strategyTimeline);
  const setCommandScene = useCommandStore((s) => s.setCommandScene);
  const startCall = useCommandStore((s) => s.startCall);
  const addCommandFeedItem = useCommandStore((s) => s.addCommandFeedItem);
  const hasExecuting = strategies.some((s) => s.status === 'executing' || s.status === 'done');
  const timelineHeight = strategyTimeline ? 140 : 0;
  const timelineGap = strategyTimeline ? 12 : 0;
  const mainBottom = hasExecuting ? 230 + timelineHeight + timelineGap : 190 + timelineHeight + timelineGap;

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
          {/* v2.0: Emergency panels (visible in emergency scene) */}
          {commandScene === 'emergency' && <EmergencyPanels />}
        </div>
      </div>

      {/* Strategy timeline: below map, above comm panel */}
      {strategyTimeline && (
        <div style={{
          position: 'absolute',
          left: 16,
          right: 328,
          bottom: hasExecuting ? 242 : 202,
          height: 140,
          zIndex: 100,
        }}>
          <StrategyTimelinePanel />
        </div>
      )}

      {/* v2.0: Scene toggle (dev mode) */}
      <div style={{
        position: 'absolute', top: 92, right: 40, zIndex: 102,
        display: 'flex', gap: 4,
      }}>
        {(['congestion', 'emergency'] as const).map((scene) => (
          <button
            key={scene}
            onClick={() => setCommandScene(scene)}
            style={{
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 500,
              color: commandScene === scene ? (scene === 'emergency' ? '#FF4757' : '#00D0E9') : '#64748B',
              backgroundColor: commandScene === scene
                ? (scene === 'emergency' ? 'rgba(255,71,87,0.1)' : 'rgba(0,208,233,0.08)')
                : 'rgba(10,15,25,0.8)',
              border: commandScene === scene
                ? `1px solid ${scene === 'emergency' ? 'rgba(255,71,87,0.4)' : 'rgba(0,208,233,0.4)'}`
                : '1px solid rgba(100,180,255,0.1)',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {scene === 'congestion' ? '拥堵' : '应急'}
          </button>
        ))}
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
