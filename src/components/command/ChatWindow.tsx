import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Minimize2, Phone, Video, Users, X } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { playMessageSound, playClickSound } from '../../utils/soundEffects';

interface Person {
  id: string;
  name: string;
  department: string;
  status: 'idle' | 'executing' | 'moving' | 'calling';
}

const PERSONS: Person[] = [
  { id: 'zhang', name: '张三', department: '交警一队', status: 'executing' },
  { id: 'li', name: '李四', department: '交警一队', status: 'idle' },
  { id: 'wang', name: '王五', department: '拖车公司', status: 'moving' },
];

const STATUS_CONFIG: Record<Person['status'], { color: string; label: string }> = {
  idle: { color: '#2ED573', label: '空闲' },
  executing: { color: '#00D0E9', label: '执行中' },
  moving: { color: '#F5A623', label: '移动中' },
  calling: { color: '#FF4757', label: '通话中' },
};

const QUICK_REPLIES = ['收到', '已协调', '继续执行', '需支援'];

type ChatType = 'group' | 'private';

export default function ChatWindow() {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [chatType, setChatType] = useState<ChatType>('group');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'entering' | 'entered'>('entering');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const commandState = useCommandStore((s) => s.commandState);
  const addCommandFeedItem = useCommandStore((s) => s.addCommandFeedItem);
  const startCall = useCommandStore((s) => s.startCall);
  const { commandFeed } = commandState;
  const activeChatPersonId = useCommandStore((s) => s.commandState.activeChatPersonId);

  const unreadCount = commandFeed.filter((item) => item.type === 'field').length;

  const departments = useMemo(() => {
    return Array.from(new Set(PERSONS.map((person) => person.department)));
  }, []);

  const selectedPersonRecord = useMemo(() => {
    if (!selectedPerson) return null;
    return PERSONS.find((person) => person.id === selectedPerson) ?? null;
  }, [selectedPerson]);

  const selectedMessages = useMemo(() => {
    const sortedByTimeline = [...commandFeed].reverse();

    if (chatType === 'group') {
      return sortedByTimeline;
    }

    if (!selectedPersonRecord) {
      return [];
    }

    return sortedByTimeline.filter(
      (item) => item.source === selectedPersonRecord.name || item.type === 'command'
    );
  }, [chatType, commandFeed, selectedPersonRecord]);

  useEffect(() => {
    if (minimized || closed) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedMessages, minimized, closed]);

  // Play message sound when new messages arrive
  useEffect(() => {
    if (selectedMessages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
      playMessageSound();
    }
    prevMessageCountRef.current = selectedMessages.length;
  }, [selectedMessages.length]);

  // Entrance animation
  useEffect(() => {
    if (!closed && !minimized) {
      setAnimationState('entering');
      setTimeout(() => setAnimationState('entered'), 50);
    }
  }, [closed, minimized]);

  // 响应 store 中的 activeChatPersonId 变化
  useEffect(() => {
    if (activeChatPersonId) {
      setClosed(false);
      setMinimized(false);
      setChatType('private');
      setSelectedPerson(activeChatPersonId);
    }
  }, [activeChatPersonId]);

  const handleSelectGroup = () => {
    setChatType('group');
    setSelectedPerson(null);
  };

  const handleSelectPerson = (personId: string) => {
    setChatType('private');
    setSelectedPerson(personId);
  };

  const handleQuickReply = (text: string) => {
    playClickSound();
    if (chatType === 'group') {
      addCommandFeedItem(`[群组] ${text}`);
      return;
    }

    if (selectedPersonRecord) {
      addCommandFeedItem(text);
    }
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    playClickSound();
    if (!selectedPersonRecord) return;

    if (type === 'voice') {
      addCommandFeedItem(`发起与${selectedPersonRecord.name}的语音通话`);
      return;
    }

    startCall(selectedPersonRecord.id);
    addCommandFeedItem(`发起与${selectedPersonRecord.name}的视频通话`);
  };

  const getSourceDotColor = (source: string) => {
    const person = PERSONS.find((item) => item.name === source);
    if (person) {
      return STATUS_CONFIG[person.status].color;
    }
    return '#64748B';
  };

  if (closed) {
    return (
      <button
        onClick={() => setClosed(false)}
        style={{
          position: 'absolute',
          left: 16,
          bottom: 250,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(0,208,233,0.15)',
          border: '1px solid rgba(0,208,233,0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 102,
        }}
      >
        <MessageSquare size={20} color="#00D0E9" />
      </button>
    );
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'absolute',
          left: 16,
          bottom: 250,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(10,15,25,0.95)',
          border: '1px solid rgba(0,208,233,0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 102,
        }}
      >
        <MessageSquare size={20} color="#00D0E9" />
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: '#FF4757',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        bottom: 250,
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
      <div
        style={{
          height: 40,
          padding: '0 12px',
          background: 'rgba(0,208,233,0.05)',
          borderBottom: '1px solid rgba(0,208,233,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageSquare size={14} color="#00D0E9" />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>指挥通信</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setMinimized(true)}
            style={{
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Minimize2 size={14} />
          </button>

          <button
            onClick={() => setClosed(true)}
            style={{
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div
          style={{
            width: 120,
            borderRight: '1px solid rgba(0,208,233,0.15)',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleSelectGroup}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: 'none',
              borderLeft: chatType === 'group' ? '3px solid #00D0E9' : '3px solid transparent',
              background: chatType === 'group' ? 'rgba(0,208,233,0.1)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Users size={13} color="#00D0E9" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>指挥群组</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginLeft: 19 }}>{PERSONS.length} 人在线</div>
          </button>

          <div style={{ height: 1, background: 'rgba(0,208,233,0.1)', margin: '4px 0' }} />

          {departments.map((department) => (
            <div key={department}>
              <div
                style={{
                  fontSize: 10,
                  color: '#64748B',
                  padding: '6px 10px 3px',
                  fontWeight: 500,
                }}
              >
                {department}
              </div>

              {PERSONS.filter((person) => person.department === department).map((person) => {
                const isSelected = chatType === 'private' && selectedPerson === person.id;
                const unread = commandFeed.filter(
                  (item) => item.source === person.name && item.type === 'field'
                ).length;

                return (
                  <button
                    key={person.id}
                    onClick={() => handleSelectPerson(person.id)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #00D0E9' : '3px solid transparent',
                      background: isSelected ? 'rgba(0,208,233,0.1)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: STATUS_CONFIG[person.status].color,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#E2E8F0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {person.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>
                        {STATUS_CONFIG[person.status].label}
                      </div>
                    </div>

                    {unread > 0 && (
                      <div
                        style={{
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          background: '#FF4757',
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 3px',
                          flexShrink: 0,
                        }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              padding: '6px 10px',
              borderBottom: '1px solid rgba(0,208,233,0.08)',
              fontSize: 12,
              fontWeight: 600,
              color: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            {chatType === 'group' ? (
              <>
                <Users size={13} color="#00D0E9" />
                <span>群组会话</span>
              </>
            ) : selectedPersonRecord ? (
              <>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: STATUS_CONFIG[selectedPersonRecord.status].color,
                  }}
                />
                <span>与 {selectedPersonRecord.name} 私聊</span>
              </>
            ) : (
              <span style={{ color: '#64748B' }}>请选择联系人</span>
            )}
          </div>

          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {selectedMessages.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  fontSize: 12,
                }}
              >
                暂无消息
              </div>
            )}

            {selectedMessages.map((message) => {
              const isOwn = message.type === 'command';
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '6px 9px',
                      borderRadius: 6,
                      background: isOwn ? 'rgba(0,208,233,0.15)' : 'rgba(13,27,42,0.8)',
                      border: isOwn
                        ? '1px solid rgba(0,208,233,0.2)'
                        : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 2,
                        fontSize: 10,
                        color: '#94A3B8',
                      }}
                    >
                      {chatType === 'group' && (
                        <>
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: getSourceDotColor(message.source),
                            }}
                          />
                          <span style={{ color: '#E2E8F0' }}>{message.source}</span>
                          <span>·</span>
                        </>
                      )}

                      {chatType === 'private' && (
                        <>
                          <span style={{ color: '#E2E8F0' }}>{message.source}</span>
                          <span>·</span>
                        </>
                      )}

                      <span>{message.time}</span>
                    </div>

                    <div style={{ fontSize: 12, color: '#E2E8F0', lineHeight: 1.5 }}>{message.content}</div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(0,208,233,0.15)',
              padding: '8px 8px 6px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    border: '1px solid rgba(0,208,233,0.25)',
                    background: 'rgba(0,208,233,0.08)',
                    color: '#00D0E9',
                    cursor: 'pointer',
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleStartCall('voice')}
                disabled={chatType !== 'private' || !selectedPersonRecord}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: 11,
                  borderRadius: 4,
                  border: '1px solid rgba(0,208,233,0.25)',
                  background: 'rgba(0,208,233,0.1)',
                  color: chatType === 'private' && selectedPersonRecord ? '#00D0E9' : '#64748B',
                  cursor: chatType === 'private' && selectedPersonRecord ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Phone size={12} />
                语音
              </button>

              <button
                onClick={() => handleStartCall('video')}
                disabled={chatType !== 'private' || !selectedPersonRecord}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: 11,
                  borderRadius: 4,
                  border: '1px solid rgba(0,208,233,0.25)',
                  background: 'rgba(0,208,233,0.1)',
                  color: chatType === 'private' && selectedPersonRecord ? '#00D0E9' : '#64748B',
                  cursor: chatType === 'private' && selectedPersonRecord ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Video size={12} />
                视频
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
