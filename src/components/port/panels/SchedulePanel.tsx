import React, { useState, useEffect } from 'react';
import { Clock, X, Ship, MapPin, Users as UsersIcon } from 'lucide-react';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';
import { usePortPanelStore } from '../../../stores/portPanelStore';
import type { ScheduleItem } from '../../../stores/portStore';
import CollapsibleCard from '../../common/CollapsibleCard';
import '../modals/detail-modal.css';

function ScheduleDetailModal({ item, onClose }: { item: ScheduleItem; onClose: () => void }) {
  const loadRate = Math.round(((item.totalSlots - item.remainingSlots) / item.totalSlots) * 100);
  const loadColor = loadRate > 80 ? '#FF4757' : loadRate > 60 ? '#F5A623' : '#2ED573';
  const getStatusText = (status: string) => {
    switch (status) { case 'loading': return '装载中'; case 'departed': return '已发船'; default: return '候船中'; }
  };
  const getStatusColor = (status: string) => {
    switch (status) { case 'loading': return '#F5A623'; case 'departed': return '#2ED573'; default: return '#999'; }
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal__header">
          <h3><Ship size={18} color="#00D0E9" /> 班次详情</h3>
          <button className="detail-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="detail-modal__content">
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, background: 'rgba(0,208,233,0.08)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#00D0E9', fontFamily: "'DIN Alternate', 'Roboto Mono', monospace" }}>{item.time}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>发船时间</div>
            </div>
            <div style={{ flex: 1, background: `${getStatusColor(item.status)}15`, borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: getStatusColor(item.status) }}>{getStatusText(item.status)}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>当前状态</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { icon: Ship, label: '船舶名称', value: item.vesselName },
              { icon: MapPin, label: '航线', value: item.lane },
              { icon: UsersIcon, label: '剩余车位', value: `${item.remainingSlots} / ${item.totalSlots}` },
              { icon: Clock, label: '装载率', value: `${loadRate}%`, color: loadColor },
            ].map((row) => (
              <div key={row.label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(0,208,233,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <row.icon size={14} color="#00D0E9" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'color' in row && row.color ? row.color : '#fff' }}>{row.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>车辆装载进度</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: loadColor }}>{loadRate}%</span>
            </div>
            <div style={{ width: '100%', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${loadRate}%`, height: '100%', background: `linear-gradient(90deg, ${loadColor}99, ${loadColor})`, borderRadius: 6, transition: 'width 0.5s ease', boxShadow: `0 0 12px ${loadColor}66` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SchedulePanel: React.FC = () => {
  const schedule = usePortStore((state) => state.schedule);
  const [countdown, setCountdown] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  const rightExpanded = usePortPanelStore((s) => s.rightExpanded);
  const toggleRight = usePortPanelStore((s) => s.toggleRight);
  const isExpanded = rightExpanded.includes('schedule');

  const nextSchedule = schedule[0];
  const upcomingSchedules = schedule.slice(1, 10);

  useEffect(() => {
    if (!nextSchedule) return;
    const calculateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = nextSchedule.time.split(':').map(Number);
      const scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);
      if (scheduleTime < now) scheduleTime.setDate(scheduleTime.getDate() + 1);
      const diff = Math.floor((scheduleTime.getTime() - now.getTime()) / 60000);
      setCountdown(diff);
    };
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 60000);
    return () => clearInterval(timer);
  }, [nextSchedule]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'loading': return { background: 'rgba(245,166,35,0.2)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' };
      case 'departed': return { background: 'rgba(46,213,115,0.2)', color: '#2ED573', border: '1px solid rgba(46,213,115,0.3)' };
      default: return { background: 'rgba(128,128,128,0.2)', color: '#999', border: '1px solid rgba(128,128,128,0.3)' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) { case 'loading': return '装载中'; case 'departed': return '已发船'; default: return '候船中'; }
  };

  if (!nextSchedule) return null;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      下班 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{nextSchedule.time}</span> ·
      {nextSchedule.lane} · 距发船 <span style={{ color: '#F5A623', fontWeight: 600 }}>{countdown}分钟</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="班次时刻表"
      icon={<Clock size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      expanded={isExpanded}
      onToggle={() => toggleRight('schedule')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* 下班船 */}
        <div
          style={{
            background: 'rgba(0,208,233,0.1)', borderLeft: '3px solid #00D0E9',
            padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
            transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', gap: 8,
          }}
          onClick={() => setSelectedItem(nextSchedule)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,208,233,0.18)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,208,233,0.1)'; }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#00D0E9', lineHeight: 1 }}>{nextSchedule.time}</div>
          <div style={{ fontSize: 10, color: '#ccc', flex: 1 }}>{nextSchedule.lane} · {nextSchedule.vesselName}</div>
          <div style={{ fontSize: 10, color: '#F5A623', whiteSpace: 'nowrap' }}>
            距发船<CountUp end={countdown} duration={1} />分钟
          </div>
        </div>

        {/* 后续班次 */}
        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
          {upcomingSchedules.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', padding: '4px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10,
                cursor: 'pointer', transition: 'background 0.15s ease', borderRadius: 3,
              }}
              onClick={() => setSelectedItem(item)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,208,233,0.06)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ width: 50, color: '#00D0E9', fontWeight: 600 }}>{item.time}</div>
              <div style={{ flex: 1, color: '#ccc', marginLeft: 8 }}>{item.lane}</div>
              <div style={{ width: 90, color: '#999', fontSize: 10, marginLeft: 8 }}>{item.vesselName}</div>
              <div style={{ width: 60, color: '#aaa', textAlign: 'right', marginLeft: 8 }}>{item.remainingSlots}/{item.totalSlots}</div>
              <div style={{ ...getStatusStyle(item.status), padding: '2px 6px', borderRadius: 3, fontSize: 10, marginLeft: 8, whiteSpace: 'nowrap' }}>
                {getStatusText(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && <ScheduleDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </CollapsibleCard>
  );
};
