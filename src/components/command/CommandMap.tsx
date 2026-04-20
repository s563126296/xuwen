import { useRef, useState } from 'react';
import MapVideoDock from './MapVideoDock';
import PersonMarker from './PersonMarker';
import IncomingCallModal from './IncomingCallModal';
import PersonPopup from './PersonPopup';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import { useAMapInit } from '../../hooks/useAMapInit';
import { useParticleAnimation } from '../../hooks/useParticleAnimation';
import { useStrategyPulseEffects } from '../../hooks/useStrategyPulseEffects';
import { useDronePatrol } from '../../hooks/useDronePatrol';
import { useIncomingCallHandler } from '../../hooks/useIncomingCallHandler';
import { usePersonClickHandler } from '../../hooks/usePersonClickHandler';
import type { FieldPerson } from '../../stores/commandStore';

export default function CommandMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);
  const commandFeed = useCommandStore((s) => s.commandState.commandFeed);
  const addCommandFeedItem = useCommandStore((s) => s.addCommandFeedItem);
  const startCall = useCommandStore((s) => s.startCall);
  const openChatWith = useCommandStore((s) => s.openChatWith);
  const strategies = useCommandStore((s) => s.commandState.strategies);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const isDroneDeployed = useCommandStore((s) => s.commandState.isDroneDeployed);

  const [selectedPerson, setSelectedPerson] = useState<FieldPerson | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  const {
    showIncomingCall,
    incomingCallMessage,
    incomingCallPerson,
    setShowIncomingCall,
  } = useIncomingCallHandler(commandFeed, fieldPersons);

  const {
    mapInstance,
    mapReady,
    diversionLineRef,
    diversionLabelRef,
    pulseLineRef,
    droneMarkerRef,
  } = useAMapInit(
    mapRef,
    () => {
      setSelectedPerson(null);
      setPopupPosition(null);
    },
    selectedPerson
  );

  const { handlePersonClick } = usePersonClickHandler(
    mapInstance,
    mapRef,
    selectedPerson,
    setSelectedPerson,
    setPopupPosition
  );

  useParticleAnimation(mapInstance.current, mapReady);
  useStrategyPulseEffects(mapReady, strategies, diversionLineRef, diversionLabelRef, pulseLineRef);
  useDronePatrol(mapReady, isDroneDeployed, droneMarkerRef, mapInstance);

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

  const handleDeclineCall = () => {
    setShowIncomingCall(false);
  };

  const handleStartCall = (personId: string) => {
    const person = fieldPersons.find(p => p.id === personId);
    if (person) {
      startCall(personId);
      addCommandFeedItem(`发起与${person.name}的视频通话`);
    }
  };

  const handleOpenChat = (personId: string) => {
    openChatWith(personId);
  };

  const closePopup = () => {
    setSelectedPerson(null);
    setPopupPosition(null);
  };

  return (
    <div
      className="card"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onClick={() => {
        if (selectedPerson) {
          setSelectedPerson(null);
          setPopupPosition(null);
        }
      }}
    >
      {/* 地图容器 */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

      {/* PLACEHOLDER_REST_JSX */}

      {/* 加载状态 */}
      {!mapReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: '#0D1B2A'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span style={{ fontSize: 14, color: '#475569' }}>加载高德地图...</span>
        </div>
      )}

      {/* 地图标题和聚焦提示 */}
      <div
        onClick={() => setActiveModal('congestion-detail')}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          padding: '8px 12px',
          borderRadius: 6,
          background: 'rgba(10,15,25,0.9)',
          border: '1px solid rgba(0,208,233,0.15)',
          cursor: 'pointer',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.15)'; }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>进港大道拥堵态势</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>点击查看详情 · 路段车辆/危化品/流入趋势</div>
      </div>

      <MapVideoDock />

      {/* 人员 Markers */}
      {mapReady && fieldPersons.map(person => (
        <PersonMarker
          key={person.id}
          person={person}
          map={mapInstance.current}
          onClick={handlePersonClick}
          isSelected={selectedPerson?.id === person.id}
        />
      ))}

      {/* PLACEHOLDER_MODALS */}

      {/* 来电弹窗 */}
      {showIncomingCall && incomingCallPerson && (
        <IncomingCallModal
          person={incomingCallPerson}
          message={incomingCallMessage}
          onAcceptVideo={handleAcceptVideo}
          onAcceptVoice={handleAcceptVoice}
          onDecline={handleDeclineCall}
        />
      )}

      {/* 人员操作弹窗 */}
      {selectedPerson && popupPosition && (
        <PersonPopup
          person={selectedPerson}
          position={popupPosition}
          onStartCall={handleStartCall}
          onOpenChat={handleOpenChat}
          onClose={closePopup}
        />
      )}

      <style>{`
        @keyframes dronePulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0,208,233,0.6); }
          50% { box-shadow: 0 0 20px rgba(0,208,233,1), 0 0 30px rgba(0,208,233,0.4); }
        }
        @keyframes personPopupFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes droneRotorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 地图控制按钮 */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 10
      }}>
        <button aria-label="放大地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16
        }} onClick={() => mapInstance.current?.zoomIn()}>+</button>
        <button aria-label="缩小地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16
        }} onClick={() => mapInstance.current?.zoomOut()}>-</button>
      </div>
    </div>
  );
}
