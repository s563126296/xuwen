import { RefObject } from 'react';
import { Users } from 'lucide-react';
import { ChatType, Person, STATUS_CONFIG } from './ChatTypes';
import type { CommandFeedItem } from '../../../stores/commandStore';

interface ChatMessageListProps {
  chatType: ChatType;
  selectedPersonRecord: Person | null;
  selectedMessages: CommandFeedItem[];
  messagesContainerRef: RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
  getSourceDotColor: (source: string) => string;
}

export default function ChatMessageList({
  chatType,
  selectedPersonRecord,
  selectedMessages,
  messagesContainerRef,
  messagesEndRef,
  getSourceDotColor,
}: ChatMessageListProps) {
  return (
    <>
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
    </>
  );
}
