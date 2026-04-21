import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.85)',
  border: '1px solid rgba(0,208,233,0.2)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(8px)',
  height: 260,
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

export const SchedulePanel: React.FC = () => {
  const schedule = usePortStore((state) => state.schedule);
  const [countdown, setCountdown] = useState<number>(0);

  const nextSchedule = schedule[0];
  const upcomingSchedules = schedule.slice(1, 8);

  useEffect(() => {
    if (!nextSchedule) return;

    const calculateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = nextSchedule.time.split(':').map(Number);
      const scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);

      if (scheduleTime < now) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
      }

      const diff = Math.floor((scheduleTime.getTime() - now.getTime()) / 60000);
      setCountdown(diff);
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 60000);

    return () => clearInterval(timer);
  }, [nextSchedule]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'loading':
        return { background: 'rgba(245,166,35,0.2)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' };
      case 'departed':
        return { background: 'rgba(46,213,115,0.2)', color: '#2ED573', border: '1px solid rgba(46,213,115,0.3)' };
      default:
        return { background: 'rgba(128,128,128,0.2)', color: '#999', border: '1px solid rgba(128,128,128,0.3)' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'loading': return '装载中';
      case 'departed': return '已发船';
      default: return '候船中';
    }
  };

  if (!nextSchedule) return null;

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>
        <Clock size={14} />
        班次时刻表
      </div>

      <div style={{
        background: 'rgba(0,208,233,0.1)',
        borderLeft: '3px solid #00D0E9',
        padding: '10px 12px',
        marginBottom: 12,
        borderRadius: 4,
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#00D0E9', marginBottom: 4 }}>
          {nextSchedule.time}
        </div>
        <div style={{ fontSize: 12, color: '#ccc', marginBottom: 6 }}>
          {nextSchedule.lane} · {nextSchedule.vesselName}
        </div>
        <div style={{ fontSize: 11, color: '#F5A623' }}>
          距发船 {countdown} 分钟
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {upcomingSchedules.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: 11,
            }}
          >
            <div style={{ width: 50, color: '#00D0E9', fontWeight: 600 }}>
              {item.time}
            </div>
            <div style={{ flex: 1, color: '#ccc', marginLeft: 8 }}>
              {item.lane}
            </div>
            <div style={{ width: 90, color: '#999', fontSize: 10, marginLeft: 8 }}>
              {item.vesselName}
            </div>
            <div style={{ width: 60, color: '#aaa', textAlign: 'right', marginLeft: 8 }}>
              {item.remainingSlots}/{item.totalSlots}
            </div>
            <div
              style={{
                ...getStatusStyle(item.status),
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                marginLeft: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {getStatusText(item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
