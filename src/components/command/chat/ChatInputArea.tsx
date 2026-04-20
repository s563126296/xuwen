import { Phone, Video } from 'lucide-react';
import { ChatType, QUICK_REPLIES, Person } from './ChatTypes';

interface ChatInputAreaProps {
  chatType: ChatType;
  selectedPersonRecord: Person | null;
  onQuickReply: (text: string) => void;
  onStartCall: (type: 'voice' | 'video') => void;
}

export default function ChatInputArea({
  chatType,
  selectedPersonRecord,
  onQuickReply,
  onStartCall,
}: ChatInputAreaProps) {
  return (
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
            onClick={() => onQuickReply(reply)}
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
          onClick={() => onStartCall('voice')}
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
          onClick={() => onStartCall('video')}
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
  );
}
