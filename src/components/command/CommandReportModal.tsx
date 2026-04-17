import Modal from '../Modal';
import { useDashboardStore } from '../../store/dashboardStore';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
}

function getStatusLabel(status: 'idle' | 'executing' | 'done' | 'failed'): string {
  switch (status) {
    case 'done': return '已完成';
    case 'executing': return '执行中';
    case 'idle': return '待执行';
    case 'failed': return '失败';
  }
}

function getStatusColor(status: 'idle' | 'executing' | 'done' | 'failed'): string {
  switch (status) {
    case 'done': return '#2ED573';
    case 'executing': return '#00D0E9';
    case 'idle': return '#64748B';
    case 'failed': return '#FF4757';
  }
}

export default function CommandReportModal() {
  const { commandState, setActiveModal } = useDashboardStore();
  const { congestionIndex, predictedIndex, strategies, commandFeed } = commandState;

  // Calculate metrics
  const initialIndex = 6.5; // Fixed initial value
  const finalIndex = congestionIndex;
  const indexDrop = initialIndex - finalIndex;
  const dropPercentage = Math.round((indexDrop / initialIndex) * 100);

  // Get trigger time (first message)
  const triggerTime = commandFeed.length > 0 ? commandFeed[commandFeed.length - 1].time : '15:23';

  // Get completion time (last step=4 message or current time)
  const completionMsg = commandFeed.find(f => f.step === 4);
  const completionTime = completionMsg?.time || '15:50';

  // Calculate duration (simplified - assume 27 minutes)
  const durationMinutes = 27;

  // Get key nodes (messages with step or isKeyAction)
  const keyNodes = commandFeed
    .filter(f => f.step !== undefined || f.icon === 'order' || f.icon === 'check')
    .reverse()
    .slice(0, 4);

  // Calculate achievement rate
  const targetDrop = initialIndex - predictedIndex;
  const actualDrop = initialIndex - finalIndex;
  const achievementRate = targetDrop > 0 ? Math.round((actualDrop / targetDrop) * 100) : 100;
  const isAchieved = achievementRate >= 70;

  // Get level label
  function getLevelLabel(index: number): string {
    if (index > 8) return '严重拥堵';
    if (index > 6) return '重度拥堵';
    if (index > 4) return '中度拥堵';
    if (index > 2) return '轻度拥堵';
    return '道路通畅';
  }

  return (
    <Modal id="command-report" title="指挥处置报告" width={600}>
      <div style={{
        background: 'rgba(13,27,42,0.9)',
        border: '1px solid rgba(0,208,233,0.25)',
        borderRadius: 6,
        padding: 20,
        backdropFilter: 'blur(10px)',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}>
        {/* Basic Info */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#00D0E9',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            基本信息
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>触发时间</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{triggerTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>处置完成</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{completionTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>总用时</span>
              <span style={{ fontSize: 12, color: '#E2E8F0' }}>{formatDuration(durationMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Congestion Overview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#00D0E9',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            拥堵概况
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>初始指数</span>
              <span style={{ fontSize: 12, color: '#FF4757' }}>
                {initialIndex.toFixed(1)}（{getLevelLabel(initialIndex)}）
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>最终指数</span>
              <span style={{ fontSize: 12, color: '#F5A623' }}>
                {finalIndex.toFixed(1)}（{getLevelLabel(finalIndex)}）
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>降幅</span>
              <span style={{ fontSize: 12, color: '#2ED573', fontWeight: 600 }}>
                ↓{indexDrop.toFixed(1)}（{dropPercentage}%）
              </span>
            </div>
          </div>
        </div>

        {/* Executed Strategies */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#00D0E9',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            执行策略
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {strategies.map((strategy) => (
              <div key={strategy.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  color: getStatusColor(strategy.status),
                }}>
                  •
                </span>
                <span style={{ fontSize: 12, color: '#E2E8F0', flex: 1 }}>
                  {strategy.id} {strategy.name}
                </span>
                <span style={{
                  fontSize: 11,
                  color: getStatusColor(strategy.status),
                }}>
                  {getStatusLabel(strategy.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Nodes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#00D0E9',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            关键节点
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {keyNodes.map((node) => (
              <div key={node.id} style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#64748B', minWidth: 40 }}>
                  {node.time}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  {node.content}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Effect Evaluation */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#00D0E9',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            效果评价
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{
              height: 20,
              background: 'rgba(100,116,139,0.2)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(achievementRate, 100)}%`,
                background: isAchieved
                  ? 'linear-gradient(90deg, #2ED573, #26C165)'
                  : 'linear-gradient(90deg, #F5A623, #E09615)',
                transition: 'width 0.3s ease',
              }} />
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 11,
                fontWeight: 600,
                color: '#FFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                达标率 {achievementRate}%
              </span>
            </div>
          </div>

          {/* Conclusion */}
          <div style={{
            fontSize: 12,
            color: isAchieved ? '#2ED573' : '#F5A623',
            textAlign: 'center',
          }}>
            {isAchieved
              ? '策略执行有效，拥堵在预期时间内缓解'
              : '策略效果低于预期，建议追加措施'}
          </div>
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, borderTop: '1px solid rgba(0,208,233,0.1)' }}>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              padding: '8px 32px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'rgba(0,208,233,0.15)',
              border: '1px solid rgba(0,208,233,0.4)',
              color: '#00D0E9',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.25)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(0,208,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,208,233,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
}
