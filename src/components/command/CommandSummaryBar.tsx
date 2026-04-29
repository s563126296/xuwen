import { AlertTriangle } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { useUIStore } from '../../stores/uiStore';
import { useOverviewStore } from '../../stores/overviewStore';

const INITIAL_INDEX = 6.5;

function getLevel(index: number) {
  if (index > 8) return { label: '严重拥堵', color: '#FF4757' };
  if (index > 6) return { label: '重度拥堵', color: '#FF4757' };
  if (index > 4) return { label: '中度拥堵', color: '#F5A623' };
  if (index > 2) return { label: '轻度拥堵', color: '#F5A623' };
  return { label: '道路通畅', color: '#2ED573' };
}

export default function CommandSummaryBar() {
  const cmd = useCommandStore((s) => s.commandState);
  const selectedPort = useUIStore((s) => s.selectedPort);
  const setSelectedPort = useUIStore((s) => s.setSelectedPort);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const causes = useCommandStore((s) => s.commandState.causes);
  const commandScene = useCommandStore((s) => s.commandState.commandScene);

  // Sync with overview mode data
  const portData = useOverviewStore((s) => s.portData);
  const portDigestion = useOverviewStore((s) => s.portDigestion);
  const corridorPressure = useOverviewStore((s) => s.corridorPressure);
  const systemResilience = useOverviewStore((s) => s.systemResilience);

  // Use overview data if available, fallback to command state
  const displayCongestionIndex = portData.xuwen?.congestionIndex ?? cmd.congestionIndex;
  const displayWaitingVehicles = portDigestion.xuwen?.waitingVehicles ?? 0;
  const maxCorridorPressure = Math.max(
    corridorPressure.north?.pressure ?? 0,
    corridorPressure.south?.pressure ?? 0,
    corridorPressure.east?.pressure ?? 0,
    corridorPressure.west?.pressure ?? 0
  );
  const resilienceScore = systemResilience?.score ?? 0;

  const { label, color } = getLevel(displayCongestionIndex);

  // Scene-aware bar color
  const isEmergencyScene = commandScene === 'emergency';

  // Check if any strategy is done
  const hasExecuted = cmd.strategies.some(s => s.status === 'done');
  const isRelieved = hasExecuted && displayCongestionIndex <= 3.0;

  // Get executed strategy for name display
  const executedStrategy = cmd.strategies.find(s => s.status === 'done');

  // Get recommended/executing strategies
  const activeStrategies = cmd.strategies
    .filter(s => s.recommended || s.status === 'executing' || s.status === 'done')
    .slice(0, 2);

  // Breathing animation for severe congestion (index > 6)
  const shouldPulse = displayCongestionIndex > 6 && !isRelieved;

  // Achievement calculation for escalation check
  const targetDrop = INITIAL_INDEX - cmd.predictedIndex;
  const actualDrop = INITIAL_INDEX - cmd.congestionIndex;
  const achievementRate = targetDrop > 0 ? Math.round((actualDrop / targetDrop) * 100) : 100;

  // Check if escalation should be shown
  const hasUrgentAlert = cmd.commandFeed.some(f => f.type === 'alert' && f.urgent);
  const shouldShowEscalate =
    displayCongestionIndex > 8.0 ||
    (hasExecuted && achievementRate < 50) ||
    hasUrgentAlert;

  // Effective bar color: green when relieved, red when emergency scene
  const barColor = isRelieved ? '#2ED573' : isEmergencyScene ? '#FF4757' : color;

  const handleEscalate = () => {
    setActiveModal('escalate-confirm');
  };

  return (
    <div
      className="command-summary-bar"
      style={{
        position: 'relative',
        height: 52,
        background: `linear-gradient(90deg, ${barColor}15 0%, rgba(10,15,25,0.95) 50%, rgba(10,15,25,0.95) 100%)`,
        borderBottom: `1px solid ${barColor}40`,
        boxShadow: `0 2px 12px ${barColor}20`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        margin: '0 20px',
        gap: 24,
        animation: shouldPulse ? 'cmdBarPulse 2.5s ease-in-out infinite' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <style>
        {`
          @keyframes cmdBarPulse {
            0%, 100% { box-shadow: 0 2px 12px ${barColor}20; }
            50% { box-shadow: 0 2px 24px ${barColor}50, 0 0 40px ${barColor}15; }
          }

          @keyframes escalatePulse {
            0%, 100% { box-shadow: 0 0 6px rgba(255,71,87,0.3); }
            50% { box-shadow: 0 0 16px rgba(255,71,87,0.6), 0 0 28px rgba(255,71,87,0.2); }
          }

          .command-summary-bar::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 16px;
            height: 16px;
            border-top: 2px solid #00D0E9;
            border-left: 2px solid #00D0E9;
            pointer-events: none;
          }

          .command-summary-bar::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 16px;
            height: 16px;
            border-bottom: 2px solid #00D0E9;
            border-right: 2px solid #00D0E9;
            pointer-events: none;
          }
        `}
      </style>

      {/* Left section: Congestion index + level + metrics */}
      <div style={{ flex: '0 0 40%', display: 'flex', alignItems: 'center', gap: 12 }}>
        {isRelieved ? (
          <>
            {/* Relieved state: green theme */}
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: '"DIN Alternate", "DIN", "Roboto Mono", monospace',
                color: '#2ED573',
                textShadow: '0 0 12px #2ED573',
                lineHeight: 1,
              }}
            >
              {displayCongestionIndex.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#2ED573',
                backgroundColor: 'rgba(46,213,115,0.18)',
                boxShadow: '0 0 8px rgba(46,213,115,0.25)',
                padding: '2px 10px',
                borderRadius: 20,
                border: '1px solid rgba(46,213,115,0.4)',
                lineHeight: '20px',
              }}
            >
              道路通畅
            </span>
            <span style={{ fontSize: 12, color: '#2ED573' }}>
              拥堵已缓解（指数 {displayCongestionIndex.toFixed(1)}，持续下降中）
            </span>
          </>
        ) : (
          <>
            {/* Normal state */}
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: '"DIN Alternate", "DIN", "Roboto Mono", monospace',
                color,
                textShadow: `0 0 12px ${color}`,
                lineHeight: 1,
              }}
            >
              {displayCongestionIndex.toFixed(1)}
            </span>

            {/* Level badge */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color,
                backgroundColor: `${color}18`,
                boxShadow: `0 0 8px ${color}25`,
                padding: '2px 10px',
                borderRadius: 20,
                border: `1px solid ${color}40`,
                lineHeight: '20px',
              }}
            >
              {label}
            </span>

            {/* Metrics synced from overview AI summary */}
            <span style={{ fontSize: 12, color: '#64748B' }}>
              待渡 {displayWaitingVehicles} 辆
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              通道压力 {maxCorridorPressure}%
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              韧性 {resilienceScore}
            </span>
          </>
        )}
      </div>

      {/* Center section: Strategy recommendation or execution result */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {isEmergencyScene && !isRelieved && (
          <>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 4,
              background: 'rgba(255, 71, 87, 0.15)',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              fontSize: 11, color: '#FF4757', fontWeight: 600,
            }}>
              <AlertTriangle size={10} />
              应急场景
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              特殊车辆 {cmd.specialVehicles.filter(v => v.status !== 'normal').length} 辆预警 · 任务 {cmd.emergencyTasks.filter(t => t.status !== 'completed').length} 项进行中
            </span>
          </>
        )}
        {!isEmergencyScene && isRelieved && executedStrategy ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#2ED573',
              textShadow: '0 0 6px rgba(46,213,115,0.3)',
            }}
          >
            策略 {executedStrategy.id} {executedStrategy.name} 执行有效
          </span>
        ) : !isEmergencyScene ? (
          <>
            {causes.length > 0 && (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                原因：
                <span style={{ color: causes[0].color, fontWeight: 500 }}>
                  {causes[0].label}（{causes[0].confidence}%）
                </span>
              </span>
            )}
            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
            {activeStrategies.length > 0 && (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                建议：
                <span style={{ color: '#00D0E9', fontWeight: 500, textShadow: '0 0 6px rgba(0,208,233,0.3)' }}>
                  {activeStrategies.map(s => s.name).join(' + ')}
                </span>
              </span>
            )}
          </>
        ) : null}
      </div>

      {/* Right section: Action buttons */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isRelieved && cmd.estimatedRelief && (
          <span style={{ fontSize: 12, color: '#64748B' }}>
            预计{cmd.estimatedRelief}缓解
          </span>
        )}

        {/* Port switcher */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['xuwen', 'haian'] as const).map((port) => {
            const active = selectedPort === port;
            const portLabel = port === 'xuwen' ? '徐闻港' : '海安新港';
            return (
              <button
                key={port}
                onClick={() => setSelectedPort(port)}
                style={{
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 500,
                  color: active ? '#00D0E9' : '#64748B',
                  backgroundColor: active ? 'rgba(0,208,233,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0,208,233,0.5)' : '1px solid rgba(0,208,233,0.12)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 0 6px rgba(0,208,233,0.15)' : 'none',
                }}
              >
                {portLabel}
              </button>
            );
          })}
        </div>

        {/* Escalate button */}
        {shouldShowEscalate && (
          <button
            onClick={handleEscalate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: '#FF4757',
              backgroundColor: 'rgba(255,71,87,0.15)',
              border: '1px solid rgba(255,71,87,0.4)',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
              animation: 'escalatePulse 2s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,71,87,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,71,87,0.15)';
            }}
          >
            <AlertTriangle size={12} />
            升级为应急模式
          </button>
        )}
      </div>
    </div>
  );
}
