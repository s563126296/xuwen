import { AlertTriangle, X } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import { useUIStore } from '../../stores/uiStore';

export default function AiAlertPopup() {
  const activeAlert = useOverviewStore((s) => s.activeAlert);
  const clearActiveAlert = useOverviewStore((s) => s.clearActiveAlert);
  const setSystemMode = useUIStore((s) => s.setSystemMode);

  if (!activeAlert) return null;

  const handleDismiss = () => {
    clearActiveAlert();
  };

  const handleTakeAction = () => {
    // Switch to command mode
    setSystemMode('command');
    clearActiveAlert();
  };

  return (
    <div style={{
      position: 'absolute',
      top: 200,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 600,
      zIndex: 100,
      animation: 'slideInDown 0.3s ease-out',
    }}>
      {/* Popup content */}
      <div style={{
        background: 'linear-gradient(135deg, #2D1B4E, #1A1F3A)',
        border: '2px solid #A855F7',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#FF4757" />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
              AI 主动预警
            </span>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Alert title */}
          <div style={{ fontSize: 14, color: '#E0E8FF', marginBottom: 16 }}>
            {activeAlert.content}
          </div>

          {/* Influence factors */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>
              影响因子：
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeAlert.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${f.weight}%`,
                      height: '100%',
                      background: '#00D0E9',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 80 }}>
                    {f.name} {f.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestion */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(0, 208, 233, 0.08)',
            border: '1px solid rgba(0, 208, 233, 0.2)',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, color: '#00D0E9', marginBottom: 4 }}>
              💡 建议
            </div>
            <div style={{ fontSize: 13, color: '#E0E8FF' }}>
              {activeAlert.suggestion}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={handleDismiss}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#94A3B8',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              稍后查看
            </button>
            <button
              onClick={handleTakeAction}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#00D0E9',
                color: '#0A0F19',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              立即处置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
