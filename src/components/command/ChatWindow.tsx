import { useChatWindow } from './chat/useChatWindow';
import ChatMinimizedButton from './chat/ChatMinimizedButton';
import ChatHeader from './chat/ChatHeader';
import ChatSidebar from './chat/ChatSidebar';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';

export default function ChatWindow() {
  const {
    minimized,
    setMinimized,
    closed,
    setClosed,
    chatType,
    selectedPerson,
    animationState,
    messagesContainerRef,
    messagesEndRef,
    unreadCount,
    departments,
    selectedPersonRecord,
    selectedMessages,
    commandFeed,
    handleSelectGroup,
    handleSelectPerson,
    handleQuickReply,
    handleStartCall,
    getSourceDotColor,
  } = useChatWindow();

  if (closed) {
    return <ChatMinimizedButton unreadCount={unreadCount} onClick={() => setClosed(false)} variant="closed" />;
  }

  if (minimized) {
    return <ChatMinimizedButton unreadCount={unreadCount} onClick={() => setMinimized(false)} variant="minimized" />;
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 328,
        bottom: 16,
        width: 320,
        height: 400,
        zIndex: 102,
        transform: animationState === 'entering' ? 'translateX(-20px)' : 'translateX(0)',
        opacity: animationState === 'entering' ? 0 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(10,15,25,0.95)',
        border: '1px solid rgba(0,208,233,0.2)',
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ChatHeader onMinimize={() => setMinimized(true)} onClose={() => setClosed(true)} />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <ChatSidebar
          chatType={chatType}
          selectedPerson={selectedPerson}
          departments={departments}
          commandFeed={commandFeed}
          onSelectGroup={handleSelectGroup}
          onSelectPerson={handleSelectPerson}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <ChatMessageList
            chatType={chatType}
            selectedPersonRecord={selectedPersonRecord}
            selectedMessages={selectedMessages}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            getSourceDotColor={getSourceDotColor}
          />

          <ChatInputArea
            chatType={chatType}
            selectedPersonRecord={selectedPersonRecord}
            onQuickReply={handleQuickReply}
            onStartCall={handleStartCall}
          />
        </div>
      </div>
    </div>
  );
}
