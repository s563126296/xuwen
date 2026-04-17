import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';

const typeColor = {
  system: '#00D0E9',
  department: '#2ED573',
  port: '#F5A623',
  alert: '#FF4757',
} as const;

const typeOptions = [
  { value: 'system', label: '系统' },
  { value: 'department', label: '部门' },
  { value: 'port', label: '港口' },
  { value: 'alert', label: '警报' },
] as const;

export default function EmergencyCommPanel() {
  const communications = useDashboardStore((s) => s.emergencyState.communications);
  const setEmergencyState = useDashboardStore((s) => s.setEmergencyState);
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<'system' | 'department' | 'port' | 'alert'>('system');

  const handleSend = () => {
    if (!inputText.trim()) return;
    playClickSound();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem = {
      id: `ec-${Date.now()}`,
      source: '指挥中心',
      time: timeStr,
      content: inputText.trim(),
      type: selectedType,
    };
    setEmergencyState({ communications: [...communications, newItem] });
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="card" style={{ padding: 14, flex: '30 0 0', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12, flexShrink: 0 }}>H. 通信记录</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {communications.map((item) => (
          <div key={item.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', borderLeft: `3px solid ${typeColor[item.type]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 600 }}>{item.source}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>{item.time}</div>
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: item.urgent ? '#FCA5A5' : '#CBD5E1' }}>{item.content}</div>
          </div>
        ))}
      </div>
      {/* Input bar */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexShrink: 0 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入通信记录..."
          style={{
            flex: 1,
            padding: '6px 8px',
            background: 'rgba(13,27,42,0.8)',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: 4,
            color: '#E2E8F0',
            fontSize: 11,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          style={{
            padding: '6px 6px',
            background: 'rgba(13,27,42,0.8)',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: 4,
            color: '#E2E8F0',
            fontSize: 11,
            outline: 'none',
            flexShrink: 0,
          }}
        >
          {typeOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSend}
          style={{
            padding: '6px 12px',
            background: inputText.trim() ? '#00D0E9' : 'rgba(0,208,233,0.3)',
            border: 'none',
            borderRadius: 4,
            color: inputText.trim() ? '#0F172A' : '#64748B',
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
  );
}
