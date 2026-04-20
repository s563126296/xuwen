import { Users } from 'lucide-react';
import { ChatType, PERSONS, STATUS_CONFIG } from './ChatTypes';
import type { CommandFeedItem } from '../../../stores/commandStore';

interface ChatSidebarProps {
  chatType: ChatType;
  selectedPerson: string | null;
  departments: string[];
  commandFeed: CommandFeedItem[];
  onSelectGroup: () => void;
  onSelectPerson: (personId: string) => void;
}

export default function ChatSidebar({
  chatType,
  selectedPerson,
  departments,
  commandFeed,
  onSelectGroup,
  onSelectPerson,
}: ChatSidebarProps) {
  return (
    <div
      style={{
        width: 120,
        borderRight: '1px solid rgba(0,208,233,0.15)',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onSelectGroup}
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
                onClick={() => onSelectPerson(person.id)}
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
  );
}
