import { useState, useMemo, useRef } from 'react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { playMessageSound } from '../../utils/soundEffects';

const DEPARTMENTS = ['公安交警', '民政局', '交通运输局', '港口管理方', '城管局', '应急管理局'] as const;

const QUICK_COMMANDS = [
  { label: '请立即到位', content: '请立即前往指定位置到位执勤' },
  { label: '请汇报进展', content: '请汇报当前任务执行进展' },
  { label: '任务已确认', content: '收到，任务已确认，正在执行' },
  { label: '需要增援', content: '当前力量不足，请求增派人员支援' },
  { label: '物资不足', content: '现场物资即将耗尽，请尽快补充' },
  { label: '情况紧急', content: '现场情况紧急，请立即响应' },
];

// Parse @mentions from content string
function parseMentions(content: string): string[] {
  const matches = content.match(/@([^\s@]+)/g);
  if (!matches) return [];
  return matches
    .map((m) => m.slice(1))
    .filter((m) => (DEPARTMENTS as readonly string[]).includes(m));
}

// Highlight @mentions in content
function renderContent(content: string) {
  const parts = content.split(/(@[^\s@]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@') && (DEPARTMENTS as readonly string[]).includes(part.slice(1))) {
      return (
        <span key={i} style={{ color: '#F5A623', fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function EmergencyCommPanel() {
  const communications = useEmergencyStore((s) => s.emergencyState.communications);
  const contacts = useEmergencyStore((s) => s.emergencyState.contacts);
  const setEmergencyState = useEmergencyStore((s) => s.setEmergencyState);
  const startVideoConference = useEmergencyStore((s) => s.startVideoConference);

  const [selectedChannel, setSelectedChannel] = useState<string>('全部');
  const [inputText, setInputText] = useState('');
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter messages by selected channel
  const filteredMessages = useMemo(() => {
    if (selectedChannel === '全部') return communications;
    return communications.filter(
      (m) =>
        m.target === selectedChannel ||
        m.source === selectedChannel ||
        m.mentions?.includes(selectedChannel)
    );
  }, [communications, selectedChannel]);

  // Unread count per department (messages not from 指挥中心 targeting that dept)
  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const dept of DEPARTMENTS) {
      counts[dept] = communications.filter(
        (m) => (m.target === dept || m.source === dept) && m.source !== '指挥中心'
      ).length;
    }
    return counts;
  }, [communications]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    playMessageSound();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const mentions = parseMentions(inputText);
    const newItem = {
      id: `ec-${Date.now()}`,
      type: 'command' as const,
      source: '指挥中心',
      target: selectedChannel !== '全部' ? selectedChannel : undefined,
      time: timeStr,
      content: inputText.trim(),
      mentions: mentions.length > 0 ? mentions : undefined,
    };
    setEmergencyState({ communications: [...communications, newItem] });
    setInputText('');
    setShowMentionPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
    if (e.key === 'Escape') setShowMentionPicker(false);
  };

  const insertMention = (dept: string) => {
    const input = inputRef.current;
    if (!input) {
      setInputText((prev) => prev + `@${dept} `);
      setShowMentionPicker(false);
      return;
    }
    const start = input.selectionStart ?? inputText.length;
    const before = inputText.slice(0, start);
    const after = inputText.slice(start);
    const newText = `${before}@${dept} ${after}`;
    setInputText(newText);
    setShowMentionPicker(false);
    // Restore focus
    setTimeout(() => {
      input.focus();
      const pos = start + dept.length + 2;
      input.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div
      className="card"
      style={{
        flex: '50 0 0',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>H. 融合通信</div>
        <button
          onClick={() => {
            const allContactIds = contacts.map((c) => c.id).slice(0, 6);
            startVideoConference(allContactIds);
          }}
          style={{
            fontSize: 10, padding: '3px 8px', background: 'transparent',
            border: '1px solid rgba(0,208,233,0.4)', color: '#00D0E9',
            borderRadius: 4, cursor: 'pointer', lineHeight: 1.4,
          }}
        >
          发起会商
        </button>
      </div>

      {/* Body: channel list + message area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Channel list */}
        <div
          style={{
            width: 80,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: '0 4px 4px',
            overflowY: 'auto', paddingRight: 8,
            borderRight: '1px solid rgba(148,163,184,0.1)',
          }}
        >
          {/* All channel */}
          <button
            onClick={() => setSelectedChannel('全部')}
            style={{
              padding: '6px 4px',
              background: selectedChannel === '全部' ? 'rgba(0,208,233,0.12)' : 'transparent',
              border: 'none',
              borderLeft: selectedChannel === '全部' ? '3px solid #00D0E9' : '3px solid transparent',
              borderRadius: 3,
              color: selectedChannel === '全部' ? '#00D0E9' : '#94A3B8',
              fontSize: 10,
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%',
            }}
          >
            全部
          </button>

          {/* Department channels */}
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedChannel === dept;
            const unread = unreadCounts[dept] ?? 0;
            return (
              <button
                key={dept}
                onClick={() => setSelectedChannel(dept)}
                style={{
                  position: 'relative',
                  padding: '6px 4px',
                  background: isSelected ? 'rgba(0,208,233,0.12)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid #00D0E9' : '3px solid transparent',
                  borderRadius: 3,
                  color: isSelected ? '#00D0E9' : '#94A3B8',
                  fontSize: 10,
                  cursor: 'pointer',
                  textAlign: 'center',
                  width: '100%',
                  lineHeight: 1.3,
                }}
              >
                {dept.length > 4 ? dept.slice(0, 4) + '\n' + dept.slice(4) : dept}
                {unread > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: '#FF4757',
                      color: '#fff',
                      fontSize: 8,
                      borderRadius: 8,
                      padding: '0 3px',
                      minWidth: 12,
                      textAlign: 'center',
                      lineHeight: '12px',
                    }}
                  >
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Message area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto', paddingRight: 8,
              padding: '6px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {filteredMessages.length === 0 && (
              <div style={{ color: '#475569', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
                暂无消息
              </div>
            )}
            {filteredMessages.map((item) => {
              const isOwn = item.source === '指挥中心';
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Source + time */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      marginBottom: 2,
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                    }}
                  >
                    {!isOwn && (
                      <span
                        style={{
                          fontSize: 9,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'rgba(46,213,115,0.15)',
                          color: '#2ED573',
                          fontWeight: 600,
                        }}
                      >
                        {item.source}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: '#475569' }}>{item.time}</span>
                  </div>
                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '6px 8px',
                      borderRadius: isOwn ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
                      background: isOwn ? 'rgba(0,208,233,0.18)' : 'rgba(30,41,59,0.8)',
                      border: isOwn ? '1px solid rgba(0,208,233,0.3)' : '1px solid rgba(148,163,184,0.1)',
                      fontSize: 11,
                      color: item.urgent ? '#FCA5A5' : '#CBD5E1',
                      lineHeight: 1.5,
                      wordBreak: 'break-all',
                    }}
                  >
                    {renderContent(item.content)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input area */}
          <div style={{ flexShrink: 0, padding: '6px 10px 8px', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
            {/* Quick commands */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => setInputText(cmd.content)}
                  style={{
                    padding: '2px 6px',
                    background: 'rgba(0,208,233,0.08)',
                    border: '1px solid rgba(0,208,233,0.25)',
                    borderRadius: 3,
                    color: '#94A3B8',
                    fontSize: 9,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cmd.label}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
              {/* @mention picker */}
              {showMentionPicker && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 40,
                    background: '#1E293B',
                    border: '1px solid rgba(0,208,233,0.3)',
                    borderRadius: 6,
                    padding: 4,
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: 100,
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => insertMention(dept)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 3,
                        color: '#CBD5E1',
                        fontSize: 11,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,208,233,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  background: 'rgba(13,27,42,0.8)',
                  border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: 4,
                  color: '#E2E8F0',
                  fontSize: 11,
                  outline: 'none',
                  minWidth: 0,
                }}
              />
              <button
                onClick={() => setShowMentionPicker((v) => !v)}
                style={{
                  padding: '5px 8px',
                  background: showMentionPicker ? 'rgba(245,166,35,0.2)' : 'rgba(13,27,42,0.8)',
                  border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: 4,
                  color: '#F5A623',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                @
              </button>
              <button
                onClick={handleSend}
                style={{
                  padding: '5px 10px',
                  background: inputText.trim() ? '#00D0E9' : 'rgba(0,208,233,0.2)',
                  border: 'none',
                  borderRadius: 4,
                  color: inputText.trim() ? '#0F172A' : '#475569',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                }}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
