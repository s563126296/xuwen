import { Users, Package, MessageCircle, MapPin } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { playClickSound } from '../../utils/soundEffects';
import CollapsibleCard from '../common/CollapsibleCard';

const statusColors = {
  executing: '#2ED573',
  enroute: '#F5A623',
  standby: '#94A3B8',
} as const;

const statusLabels = {
  executing: '执行中',
  enroute: '在途',
  standby: '待命',
} as const;

export default function ExecutionResourcePanel() {
  const executionResources = useCommandStore((s) => s.commandState.executionResources);
  const openChatWith = useCommandStore((s) => s.openChatWith);
  const fieldPersons = useCommandStore((s) => s.commandState.fieldPersons);

  const handleLocate = (_personId: string) => {
    playClickSound();
    // TODO: Implement map location logic
  };

  const countByStatus = (status: keyof typeof statusLabels) =>
    executionResources.personnel.filter((p) => p.status === status).length;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      执行中 <span style={{ fontFamily: 'DIN, sans-serif', color: '#2ED573' }}>{countByStatus('executing')}</span> · 在途 <span style={{ fontFamily: 'DIN, sans-serif', color: '#F5A623' }}>{countByStatus('enroute')}</span> · 待命 <span style={{ fontFamily: 'DIN, sans-serif', color: '#94A3B8' }}>{countByStatus('standby')}</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="执行资源"
      icon={<Package size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={true}
    >
      {/* Personnel */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={10} />
          关联人员 ({executionResources.personnel.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {executionResources.personnel.map((person) => (
            <div
              key={person.id}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: 8, borderRadius: 4,
                background: 'rgba(0,0,0,0.2)', border: `1px solid ${statusColors[person.status]}33`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: statusColors[person.status],
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0' }}>{person.name}</span>
                  <span style={{ fontSize: 10, color: '#64748B' }}>{person.dept}</span>
                </div>
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 3,
                  background: `${statusColors[person.status]}22`,
                  color: statusColors[person.status],
                }}>
                  {statusLabels[person.status]}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>{person.task}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    const fieldPerson = fieldPersons.find((p) => p.name === person.name);
                    if (fieldPerson) openChatWith(fieldPerson.id);
                  }}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 9, borderRadius: 3, cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(0,208,233,0.3)', color: '#00D0E9',
                  }}
                >
                  <MessageCircle size={10} style={{ display: 'inline', marginRight: 3 }} />
                  聊天
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLocate(person.id); }}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 9, borderRadius: 3, cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(148,163,184,0.3)', color: '#94A3B8',
                  }}
                >
                  <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                  定位
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>物资状态</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {executionResources.materials.map((mat, idx) => {
            const ratio = mat.ready / mat.total;
            const color = ratio >= 0.8 ? '#2ED573' : ratio >= 0.5 ? '#F5A623' : '#FF4757';
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#94A3B8', width: 50 }}>{mat.name}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 2, background: color }} />
                </div>
                <span style={{ fontSize: 9, color, width: 60, textAlign: 'right' }}>
                  {mat.ready}/{mat.total}{mat.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
        <button
          onClick={(e) => { e.stopPropagation(); playClickSound(); alert('增派警力功能（Mock）'); }}
          style={{
            flex: 1, padding: '6px 0', fontSize: 10, borderRadius: 4, cursor: 'pointer',
            background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.3)', color: '#00D0E9',
          }}
        >
          + 增派警力
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); playClickSound(); alert('调度拖车功能（Mock）'); }}
          style={{
            flex: 1, padding: '6px 0', fontSize: 10, borderRadius: 4, cursor: 'pointer',
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623',
          }}
        >
          + 调度拖车
        </button>
      </div>
    </CollapsibleCard>
  );
}
