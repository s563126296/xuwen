import { Phone, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CommandStrategy } from '../../../stores/commandStore';
import { playClickSound } from '../../../utils/soundEffects';
import { dinFont, getResponsible, getElapsedTime } from './strategyConstants';

export default function ActiveStrategyCard({
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
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${dotPct}%`,
            background: 'linear-gradient(90deg, rgba(0,208,233,0.3), rgba(0,208,233,0.6))',
            borderRadius: 3,
          }} />
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
                onClick={() => { playClickSound(); }}
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
