import { useRef, useEffect } from 'react';
import { useCommandStore } from '../../stores/commandStore';
import { Info, Bot, UserCheck, Camera, Phone, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

const iconMap = {
  info: { Icon: Info, color: '#00D0E9' },
  ai: { Icon: Bot, color: '#A78BFA' },
  user: { Icon: UserCheck, color: '#2ED573' },
  photo: { Icon: Camera, color: '#F59E0B' },
  phone: { Icon: Phone, color: '#EF4444' },
  check: { Icon: CheckCircle, color: '#2ED573' },
  warning: { Icon: AlertTriangle, color: '#F59E0B' },
  order: { Icon: FileText, color: '#00D0E9' },
};

const typeBg: Record<string, string> = {
  system: 'rgba(0,208,233,0.06)',
  ai: 'rgba(168,85,247,0.08)',
  command: 'rgba(46,213,115,0.06)',
  field: 'rgba(255,255,255,0.03)',
  approval: 'rgba(46,213,115,0.08)',
  alert: 'rgba(255,71,87,0.10)',
};

const typeBorderLeft: Record<string, string> = {
  system: '2px solid rgba(0,208,233,0.6)',
  ai: '2px solid rgba(168,85,247,0.6)',
  command: '2px solid rgba(46,213,115,0.6)',
  field: '2px solid rgba(148,163,184,0.3)',
  approval: '2px solid rgba(46,213,115,0.6)',
  alert: '2px solid rgba(255,71,87,0.7)',
};

const typeBorder: Record<string, string> = {
  system: 'rgba(0,208,233,0.15)',
  ai: 'rgba(168,85,247,0.2)',
  command: 'rgba(46,213,115,0.15)',
  field: 'rgba(255,255,255,0.06)',
  approval: 'rgba(46,213,115,0.2)',
  alert: 'rgba(255,71,87,0.25)',
};

const typeLabel: Record<string, { text: string; color: string }> = {
  system: { text: '系统', color: '#00D0E9' },
  ai: { text: 'AI', color: '#A78BFA' },
  command: { text: '指挥', color: '#2ED573' },
  field: { text: '现场', color: '#94A3B8' },
  approval: { text: '审批', color: '#2ED573' },
  alert: { text: '告警', color: '#FF4757' },
};

export default function CommandCommPanel() {
  const { commandFeed } = useCommandStore((s) => s.commandState);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [commandFeed.length]);

  const panelHeight = 180;

  return (
    <div className="cmd-comm-panel" style={{
      position: 'absolute', bottom: 12, left: 16, right: 16, height: panelHeight,
      background: 'rgba(12, 25, 48, 0.82)',
      borderRadius: 12,
      border: '1px solid rgba(100, 180, 255, 0.08)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 20px rgba(77, 166, 255, 0.05)',
      backdropFilter: 'blur(40px) saturate(150%)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,208,233,0.08)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Left cyan bar decoration */}
          <div style={{
            width: 3, height: 14, borderRadius: 1,
            background: 'linear-gradient(180deg, #00D0E9, rgba(0,208,233,0.3))',
          }} />
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#E2E8F0',
            letterSpacing: '0.5px',
          }}>执行动态</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>{commandFeed.length} 条记录</span>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <div className="cmd-live-dot" style={{
              width: 6, height: 6, borderRadius: '50%', background: '#2ED573',
            }} />
            <span style={{
              fontSize: 10, color: '#2ED573', fontWeight: 600,
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>实时</span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#475569' }}>← 滑动查看历史</span>
      </div>

      {/* Timeline scroll area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowX: 'auto', overflowY: 'hidden',
        display: 'flex', alignItems: 'stretch', gap: 0,
        padding: '6px 12px',
        scrollBehavior: 'smooth',
      }}>
        {commandFeed.map((item, i) => {
          const iconInfo = iconMap[item.icon || 'info'] || iconMap.info;
          const ItemIcon = iconInfo.Icon;
          const isUrgent = !!item.urgent;
          const isAlert = item.type === 'alert';
          const isApproval = item.type === 'approval';
          const isHighlighted = false;
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
              {/* Event card */}
              <div
                id={`msg-${item.id}`}
                className={isUrgent || isAlert ? 'cmd-urgent-card' : undefined}
                style={{
                  width: 200, padding: '6px 10px', borderRadius: 6,
                  background: isUrgent ? typeBg.alert : (typeBg[item.type] || typeBg.field),
                  border: isHighlighted
                    ? '1px solid #00D0E9'
                    : `1px solid ${isUrgent ? typeBorder.alert : (typeBorder[item.type] || typeBorder.field)}`,
                  borderLeft: isUrgent
                    ? '3px solid #FF4757'
                    : (typeBorderLeft[item.type] || typeBorderLeft.field),
                  boxShadow: isHighlighted ? '0 0 10px rgba(0,208,233,0.3)' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  cursor: 'default',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isHighlighted) {
                    e.currentTarget.style.borderColor = iconInfo.color;
                    e.currentTarget.style.boxShadow = `0 0 12px ${iconInfo.color}22`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHighlighted) {
                    e.currentTarget.style.borderColor = isUrgent ? typeBorder.alert : (typeBorder[item.type] || typeBorder.field);
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Time + source */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ItemIcon size={12} color={iconInfo.color} />
                  <span style={{
                    fontSize: 9, padding: '0 4px', borderRadius: 3,
                    background: `${(typeLabel[item.type] || typeLabel.field).color}15`,
                    color: (typeLabel[item.type] || typeLabel.field).color,
                    fontWeight: 600,
                  }}>
                    {(typeLabel[item.type] || typeLabel.field).text}
                  </span>
                  <span style={{
                    fontSize: 11, color: 'rgba(0,208,233,0.8)',
                    fontFamily: '"DIN Alternate", "DIN", "Consolas", "Monaco", monospace',
                    fontWeight: 600,
                    textShadow: '0 0 6px rgba(0,208,233,0.3)',
                  }}>{item.time}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{item.source}</span>
                  {isApproval && (
                    <CheckCircle size={11} color="#2ED573" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }} />
                  )}
                </div>
                {/* Content */}
                <div style={{
                  fontSize: 11,
                  color: isUrgent || isAlert ? '#FCA5A5' : '#C9CDD4',
                  fontWeight: isUrgent || isAlert ? 600 : 400,
                  lineHeight: 1.5, flex: 1,
                }}>
                  {isUrgent && (
                    <span style={{
                      fontSize: 9, padding: '0 4px', borderRadius: 3, marginRight: 4,
                      background: 'rgba(255,71,87,0.2)', color: '#FF4757', fontWeight: 700,
                    }}>紧急</span>
                  )}
                  {item.content}
                </div>
              </div>

              {/* Connector line */}
              {i < commandFeed.length - 1 && (
                <div style={{
                  width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{
                    width: 16, height: 1,
                    background: 'linear-gradient(90deg, rgba(0,240,255,0.1), rgba(0,208,233,0.3), rgba(0,240,255,0.1))',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        /* Top light decoration */
        .cmd-comm-panel { position: relative; }
        .cmd-comm-panel::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(77, 166, 255, 0.35), transparent);
          z-index: 1; pointer-events: none;
        }
        /* Live indicator pulse */
        .cmd-live-dot {
          animation: cmdLivePulse 2s infinite;
        }
        @keyframes cmdLivePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46,213,115,0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 6px 3px rgba(46,213,115,0.3); }
        }
        /* Urgent card pulse */
        .cmd-urgent-card {
          animation: urgentPulse 2s infinite;
        }
        @keyframes urgentPulse {
          0%, 100% { opacity: 1; border-color: rgba(255,71,87,0.4); }
          50% { opacity: 0.7; border-color: rgba(255,71,87,0.8); box-shadow: 0 0 8px rgba(255,71,87,0.3); }
        }
      `}</style>
    </div>
  );
}
