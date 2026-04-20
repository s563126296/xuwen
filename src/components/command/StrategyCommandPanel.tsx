import { Phone, Camera, Plus, Settings, Zap, Signal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import type { CommandFeedItem, CommandStrategy, StrategyPermission } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';
import ExecutionResourcePanel from './ExecutionResourcePanel';
import HistoryStatsPanel from './HistoryStatsPanel';

const cornerStyles = `
.cmd-panel-section { position: relative; }
.cmd-panel-section::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 8px; height: 8px;
  border-top: 2px solid rgba(0,208,233,0.4);
  border-left: 2px solid rgba(0,208,233,0.4);
}
.cmd-panel-section::after {
  content: ''; position: absolute; bottom: 0; right: 0;
  width: 8px; height: 8px;
  border-bottom: 2px solid rgba(0,208,233,0.4);
  border-right: 2px solid rgba(0,208,233,0.4);
}
.cmd-exec-btn-recommended:hover {
  box-shadow: 0 0 8px rgba(0,208,233,0.3) !important;
}
.cmd-alt-btn:hover {
  background: rgba(0,208,233,0.15) !important;
  border-color: rgba(0,208,233,0.4) !important;
}
`;

const dinFont = 'DIN Alternate, Orbitron, monospace';

// Map strategy ID to responsible person
function getResponsible(strategyId: string): string {
  if (strategyId === 'S-01' || strategyId === 'S-02') return '张三';
  if (strategyId === 'S-04' || strategyId === 'S-05') return '李四';
  return '王五';
}

// Estimate elapsed time from currentStep
function getElapsedTime(currentStep: number): string {
  if (currentStep <= 3) return '刚开始';
  if (currentStep === 4) return '约 1 分钟';
  if (currentStep === 5) return '约 3 分钟';
  return '已完成';
}

function getLatestFieldFeedback(commandFeed: CommandFeedItem[]): string {
  const fieldMsg = commandFeed.find(
    (f) => (f.type === 'field' || f.icon === 'photo' || f.icon === 'phone')
  );
  if (!fieldMsg) return '暂无现场反馈';

  const text = fieldMsg.content.length > 20
    ? fieldMsg.content.slice(0, 20) + '...'
    : fieldMsg.content;
  return `${fieldMsg.time} ${text}`;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      borderLeft: '3px solid #00D0E9',
      paddingLeft: 8,
      borderBottom: '1px solid rgba(0,208,233,0.1)',
      paddingBottom: 6,
      marginBottom: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#E0E8FF' }}>{title}</span>
    </div>
  );
}

function PermissionBadge({ permission }: { permission: StrategyPermission }) {
  if (permission === 'approve') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(255,71,87,0.15)', color: '#FF4757',
      }}>
        <ShieldAlert size={12} color="#FF4757" />需审批
      </span>
    );
  }
  if (permission === 'confirm') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 6px', borderRadius: 9999, fontSize: 10,
        background: 'rgba(245,158,11,0.15)', color: '#F5A623',
      }}>
        <ShieldCheck size={12} color="#F5A623" />需确认
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 9999, fontSize: 10,
      background: 'rgba(16,185,129,0.15)', color: '#2ED573',
    }}>
      <Shield size={12} color="#2ED573" />自动执行
    </span>
  );
}

// === B. Alternative Strategy Card ===
function AltStrategyCard({
  strategy,
  hasExecuting,
  isFirst,
}: {
  strategy: CommandStrategy;
  hasExecuting: boolean;
  isFirst: boolean;
}) {
  const { setActiveModal, setPendingStrategy } = useDashboardStore();
  const stars = '★'.repeat(strategy.difficulty) + '☆'.repeat(Math.max(0, 5 - strategy.difficulty));

  return (
    <div style={{
      padding: 10,
      background: 'rgba(13,27,42,0.8)',
      border: isFirst ? '1px solid rgba(0,208,233,0.2)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6,
      backdropFilter: 'blur(10px)',
      marginBottom: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {isFirst && (
          <span style={{
            padding: '1px 5px', fontSize: 10, borderRadius: 3,
            background: 'rgba(0,208,233,0.15)', color: '#00D0E9', fontWeight: 500,
          }}>🤖 AI 推荐</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', flex: 1 }}>
          {strategy.id} {strategy.name}
        </span>
      </div>

      {/* Effect description */}
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>{strategy.effect}</div>

      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <PermissionBadge permission={strategy.permission} />
        <span style={{ fontSize: 11, color: '#F5A623', letterSpacing: 1 }}>{stars}</span>
      </div>

      {/* Effect time */}
      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>
        生效时间：<span style={{ color: '#94A3B8' }}>{strategy.effectTime}</span>
      </div>

      {/* Execute button */}
      <button
        onClick={() => {
          playClickSound();
          setPendingStrategy(strategy.id);
          setActiveModal('strategy-confirm');
        }}
        className="cmd-alt-btn"
        style={{
          width: '100%', padding: '5px 0', fontSize: 11, borderRadius: 4,
          background: 'transparent', color: '#00D0E9',
          border: '1px solid rgba(0,208,233,0.25)', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {hasExecuting ? '追加执行' : '执行此方案'}
      </button>
    </div>
  );
}

// === C. Custom Strategy Templates ===
const CUSTOM_TEMPLATES = [
  { id: 'adjust-diversion', label: '调整分流比例', icon: Signal },
  { id: 'add-police', label: '增加警力', icon: Shield },
  { id: 'adjust-signal', label: '调整信号灯时长', icon: Zap },
  { id: 'send-guidance', label: '发送诱导屏信息', icon: Settings },
];

function CustomStrategyGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {CUSTOM_TEMPLATES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => {
            playClickSound();
          }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '10px 6px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(13,27,42,0.6)',
            border: '1px solid rgba(0,208,233,0.1)',
            color: '#94A3B8', fontSize: 11,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,208,233,0.08)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,208,233,0.25)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,27,42,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,208,233,0.1)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Icon size={16} color="#00D0E9" />
          <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// === A. Current Executing Strategy Card ===
function ActiveStrategyCard({
  strategy,
  currentStep,
  congestionIndex,
  predictedIndex,
  activeStepLabel,
  hasIncomingCall,
  hasUnreadPhoto,
  linkedCamera,
  latestFeedback,
  onAcceptCall,
  onViewPhoto,
}: {
  strategy: CommandStrategy;
  currentStep: number;
  congestionIndex: number;
  predictedIndex: number;
  activeStepLabel: string;
  hasIncomingCall: boolean;
  hasUnreadPhoto: boolean;
  linkedCamera: string;
  latestFeedback: string;
  onAcceptCall?: () => void;
  onViewPhoto?: () => void;
}) {
  const INITIAL_INDEX = 6.5;
  const range = INITIAL_INDEX - predictedIndex;
  const current = congestionIndex;

  // Achievement calculation (only relevant when done)
  const targetDrop = INITIAL_INDEX - predictedIndex;
  const actualDrop = INITIAL_INDEX - congestionIndex;
  const achievementRate = targetDrop > 0 ? Math.round((actualDrop / targetDrop) * 100) : 100;
  const isAchieved = achievementRate >= 70;
  const elapsedLabel = getElapsedTime(currentStep);
  // Clamp dot position between 0% and 100%
  const dotPct = range > 0
    ? Math.max(0, Math.min(100, ((INITIAL_INDEX - current) / range) * 100))
    : 0;
  const drop = (INITIAL_INDEX - current).toFixed(1);

  return (
    <div style={{
      padding: 12,
      background: 'rgba(13,27,42,0.9)',
      border: '1px solid rgba(0,208,233,0.25)',
      borderRadius: 6,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 12px rgba(0,208,233,0.08)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>
            {strategy.id} {strategy.name}
          </span>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
            责任人：<span style={{ color: '#94A3B8' }}>{getResponsible(strategy.id)}</span>
          </div>
          {strategy.triggerCondition && (
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
              触发条件：<span style={{ color: '#94A3B8' }}>{strategy.triggerCondition}</span>
            </div>
          )}
        </div>
        <span style={{
          padding: '2px 8px', fontSize: 10, borderRadius: 9999,
          background: strategy.status === 'done' ? 'rgba(46,213,115,0.15)' : 'rgba(0,208,233,0.15)',
          color: strategy.status === 'done' ? '#2ED573' : '#00D0E9',
          fontWeight: 600,
        }}>
          {strategy.status === 'done' ? '已完成' : '执行中'}
        </span>
      </div>

      {/* Status + elapsed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          当前步骤：<span style={{ color: '#00D0E9' }}>{activeStepLabel || '—'}</span>
        </span>
        <span style={{ fontSize: 11, color: '#64748B' }}>已用时：{getElapsedTime(currentStep)}</span>
      </div>

      {/* Effect progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#64748B' }}>初始 {INITIAL_INDEX}</span>
          <span style={{ fontSize: 10, color: '#64748B' }}>目标 {predictedIndex}</span>
        </div>
        <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
          {/* Fill bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${dotPct}%`,
            background: 'linear-gradient(90deg, rgba(0,208,233,0.3), rgba(0,208,233,0.6))',
            borderRadius: 3,
          }} />
          {/* Cyan dot */}
          <div style={{
            position: 'absolute', top: '50%', left: `${dotPct}%`,
            transform: 'translate(-50%, -50%)',
            width: 10, height: 10, borderRadius: '50%',
            background: '#00D0E9',
            boxShadow: '0 0 6px rgba(0,208,233,0.8)',
          }} />
        </div>
        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
          当前 <span style={{ color: '#00D0E9', fontFamily: dinFont }}>{current}</span>
          {' '}↓<span style={{ color: '#2ED573', fontFamily: dinFont }}>{drop}</span>
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
          预计生效：<span style={{ color: '#00D0E9' }}>{strategy.effectTime}</span>
        </div>
      </div>

      {/* 状态提示 */}
      <div style={{
        marginTop: 10,
        padding: 8,
        background: 'rgba(0,208,233,0.05)',
        borderRadius: 4,
        fontSize: 10,
        color: '#94A3B8',
      }}>
        <div style={{ marginBottom: 4 }}>
          已联动视频：<span style={{ color: '#00D0E9' }}>{linkedCamera}</span>
        </div>
        <div>
          最近反馈：<span style={{ color: '#94A3B8' }}>{latestFeedback}</span>
        </div>
      </div>

      {/* Achievement result (only when done) */}
      {strategy.status === 'done' && (
        <div style={{
          marginTop: 10,
          padding: 10,
          background: isAchieved ? 'rgba(46,213,115,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${isAchieved ? 'rgba(46,213,115,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius: 4,
        }}>
          {isAchieved ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <CheckCircle2 size={14} color="#2ED573" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2ED573' }}>策略执行有效</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>
                拥堵指数：<span style={{ color: '#E2E8F0' }}>{INITIAL_INDEX.toFixed(1)} → {congestionIndex.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>
                用时：<span style={{ color: '#E2E8F0' }}>{elapsedLabel}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <AlertCircle size={14} color="#F5A623" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#F5A623' }}>效果未达标</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>
                预测：降至 <span style={{ color: '#E2E8F0' }}>{predictedIndex.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>
                实际：降至 <span style={{ color: '#E2E8F0' }}>{congestionIndex.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>
                达标率：<span style={{ color: '#F5A623', fontWeight: 600 }}>{achievementRate}%</span>
              </div>
              <div style={{
                fontSize: 10,
                color: '#FCD34D',
                marginBottom: 8,
                padding: 6,
                background: 'rgba(245,158,11,0.1)',
                borderRadius: 3,
              }}>
                系统分析：缓解速度低于预期
              </div>
              <button
                onClick={() => { playClickSound(); /* TODO: show additional strategies */ }}
                style={{
                  width: '100%',
                  padding: '6px 0',
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 4,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  color: '#F5A623',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.15)';
                }}
              >
                查看追加方案
              </button>
            </>
          )}
        </div>
      )}

      {/* 条件动作（只在有事件时显示）*/}
      {(hasIncomingCall || hasUnreadPhoto) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {hasIncomingCall && (
            <button
              onClick={() => { playClickSound(); onAcceptCall?.(); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '6px 0',
                fontSize: 11,
                borderRadius: 4,
                background: 'rgba(255,71,87,0.15)',
                color: '#FF4757',
                border: '1px solid rgba(255,71,87,0.3)',
                cursor: 'pointer',
                animation: 'pulse 2s infinite',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Phone size={12} />接听来电
            </button>
          )}
          {hasUnreadPhoto && (
            <button
              onClick={() => { playClickSound(); onViewPhoto?.(); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '6px 0',
                fontSize: 11,
                borderRadius: 4,
                background: 'rgba(245,158,11,0.15)',
                color: '#F5A623',
                border: '1px solid rgba(245,158,11,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Camera size={12} />查看照片
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ name, rate, color }: { name: string; rate: number; color: string }) {
  const rateColor = rate > 80 ? '#2ED573' : rate > 60 ? '#F5A623' : '#FF4757';
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: '#CBD5E1', flex: 1 }}>{name}</span>
      <span style={{
        fontSize: 11, fontWeight: 600, color: rateColor,
        fontFamily: dinFont, textShadow: `0 0 6px ${rateColor}33`,
      }}>成功率 {rate}%</span>
    </div>
  );
}

export default function StrategyCommandPanel() {
  const cmd = useDashboardStore((s) => s.commandState);
  const commandFeed = useDashboardStore((s) => s.commandState.commandFeed);
  const fieldPersons = useDashboardStore((s) => s.commandState.fieldPersons);
  const startCall = useDashboardStore((s) => s.startCall);
  const setActiveModal = useDashboardStore((s) => s.setActiveModal);

  const strategies = cmd.strategies;
  const activeStrategy = strategies.find((s) => s.status === 'executing' || s.status === 'done');
  const altStrategies = strategies.filter((s) => s.status === 'idle').slice(0, 3);
  const hasExecuting = strategies.some((s) => s.status === 'executing');

  const activeStepLabel = cmd.executionSteps.find((s) => s.status === 'active')?.label ?? '';

  const hasIncomingCall = commandFeed.some((f) => f.icon === 'phone' && f.type === 'field');
  const hasUnreadPhoto = commandFeed.some((f) => f.icon === 'photo' && f.type === 'field');

  function getLinkedCamera(strategyId: string): string {
    if (strategyId === 'S-02') return '华四村 cam-02';
    if (strategyId === 'S-01') return '城区路口 cam-01';
    if (strategyId === 'S-07') return '高速入口 cam-03';
    return '港口入口 cam-05';
  }

  const handleAcceptCall = () => {
    const phoneMsg = commandFeed.find((f) => f.icon === 'phone');
    if (phoneMsg) {
      const person = fieldPersons.find((p) => p.name === phoneMsg.source);
      if (person) {
        startCall(person.id);
      }
    }
  };

  const handleViewPhoto = () => {
    setActiveModal('photo-viewer');
  };

  const latestFeedback = getLatestFieldFeedback(commandFeed);

  return (
    <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '100%' }}>
      <style>{cornerStyles}</style>

      {/* A. Current Executing Strategy */}
      {activeStrategy && (
        <div className="card cmd-panel-section" style={{ padding: 14 }}>
          <SectionHeader title="当前执行策略" />
          <ActiveStrategyCard
            strategy={activeStrategy}
            currentStep={cmd.currentStep}
            congestionIndex={cmd.congestionIndex}
            predictedIndex={cmd.predictedIndex}
            activeStepLabel={activeStepLabel}
            hasIncomingCall={hasIncomingCall}
            hasUnreadPhoto={hasUnreadPhoto}
            linkedCamera={getLinkedCamera(activeStrategy.id)}
            latestFeedback={latestFeedback}
            onAcceptCall={handleAcceptCall}
            onViewPhoto={handleViewPhoto}
          />
        </div>
      )}

      {/* B. Alternative Strategies */}
      {altStrategies.length > 0 && (
        <div className="card cmd-panel-section" style={{ padding: 14 }}>
          <SectionHeader title="备选策略" />
          {altStrategies.map((s, idx) => (
            <AltStrategyCard
              key={s.id}
              strategy={s}
              hasExecuting={hasExecuting}
              isFirst={idx === 0}
            />
          ))}
        </div>
      )}

      {/* History Effects */}
      <div className="card cmd-panel-section" style={{ padding: 14 }}>
        <SectionHeader title="历史策略效果" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>策略采纳率</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#2ED573', fontFamily: dinFont, textShadow: '0 0 6px rgba(16,185,129,0.2)' }}>82%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>平均缓解时间</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', fontFamily: dinFont, textShadow: '0 0 6px rgba(0,240,255,0.1)' }}>28 分钟</span>
        </div>
        <div style={{ height: 1, background: '#1E293B', margin: '6px 0' }} />
        {cmd.historyEffects.map((h) => (
          <HistoryItem key={h.name} name={h.name} rate={h.rate} color={h.color} />
        ))}
      </div>

      {/* C. Custom Strategy Templates */}
      <div className="card cmd-panel-section" style={{ padding: 14 }}>
        <SectionHeader title="自定义策略" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <Plus size={12} color="#64748B" />
          <span style={{ fontSize: 11, color: '#64748B' }}>选择模板快速创建</span>
        </div>
        <CustomStrategyGrid />
      </div>

      {/* E4. Execution Resources */}
      <ExecutionResourcePanel />

      {/* I. History Stats */}
      <HistoryStatsPanel />
    </div>
  );
}
