import { useCommandStore } from '../../stores/commandStore';
import { Check, Circle, Loader } from 'lucide-react';

interface StrategyFlowBarProps {
  currentStep: number; // 1-6 from store
  onStepClick: (stepId: number) => void;
}

const nextStepHints: Record<number, string> = {
  1: '下一步：系统生成指令单',
  2: '下一步：等待现场人员响应',
  3: '下一步：等待现场反馈（预计 2 分钟）',
  4: '下一步：等待效果数据验证',
  5: '策略执行完成',
  6: '策略执行完成',
};

const stepDuration: Record<number, string> = {
  1: '0-1 分钟',
  2: '1-5 分钟',
  3: '5-20 分钟',
  4: '20-30 分钟',
};

export default function StrategyFlowBar({ currentStep, onStepClick }: StrategyFlowBarProps) {
  const { commandFeed } = useCommandStore((s) => s.commandState);

  // Map currentStep (1-6) to flow step (1-4)
  const getFlowStep = (storeStep: number): number => {
    if (storeStep <= 2) return 1; // 策略确认
    if (storeStep === 3) return 2; // 指令下发
    if (storeStep === 4) return 3; // 现场执行
    return 4; // 效果验证 (5-6)
  };

  const activeFlowStep = getFlowStep(currentStep);

  // Get timestamp for a step from commandFeed
  const getStepTime = (stepId: number): string => {
    const msg = commandFeed.find((f) => f.step === stepId);
    return msg?.time ?? '--:--';
  };

  const getElapsedTime = (stepId: number): string => {
    if (stepId !== activeFlowStep) return '';
    const msg = commandFeed.find((f) => f.step === stepId);
    if (!msg) return '';

    const [hour, min] = msg.time.split(':').map(Number);
    const now = new Date();
    const msgTime = new Date();
    msgTime.setHours(hour, min, 0, 0);

    const diffMs = now.getTime() - msgTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return '刚开始';
    if (diffMin < 60) return `已用 ${diffMin} 分钟`;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `已用 ${hours}h${mins}m`;
  };

  // Get status for each flow step
  const getStepStatus = (stepId: number): 'done' | 'active' | 'pending' => {
    if (stepId < activeFlowStep) return 'done';
    if (stepId === activeFlowStep) return 'active';
    return 'pending';
  };

  const steps = [
    { id: 1, label: '策略确认' },
    { id: 2, label: '指令下发' },
    { id: 3, label: '现场执行' },
    { id: 4, label: '效果验证' },
  ];

  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid rgba(0,208,233,0.08)',
      background: 'rgba(0,208,233,0.02)',
    }}>
      {/* Flow steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const time = getStepTime(step.id);
          const isActive = status === 'active';
          const isDone = status === 'done';

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Step card */}
              <div
                onClick={() => onStepClick(step.id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: isDone
                    ? 'rgba(46,213,115,0.08)'
                    : isActive
                    ? 'rgba(0,208,233,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  border: isActive
                    ? '1px solid rgba(0,208,233,0.5)'
                    : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animation: isActive ? 'flowPulse 2s infinite' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDone
                    ? 'rgba(46,213,115,0.12)'
                    : isActive
                    ? 'rgba(0,208,233,0.12)'
                    : 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDone
                    ? 'rgba(46,213,115,0.08)'
                    : isActive
                    ? 'rgba(0,208,233,0.08)'
                    : 'rgba(255,255,255,0.02)';
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDone
                    ? 'rgba(46,213,115,0.2)'
                    : isActive
                    ? 'rgba(0,208,233,0.2)'
                    : 'rgba(148,163,184,0.1)',
                  flexShrink: 0,
                }}>
                  {isDone ? (
                    <Check size={12} color="#2ED573" />
                  ) : isActive ? (
                    <Loader size={12} color="#00D0E9" />
                  ) : (
                    <Circle size={8} color="#64748B" />
                  )}
                </div>

                {/* Label & Time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isDone ? '#2ED573' : isActive ? '#00D0E9' : '#94A3B8',
                    marginBottom: 2,
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: isDone || isActive ? '#94A3B8' : '#64748B',
                    fontFamily: 'monospace',
                  }}>
                    {time}
                    {isActive && getElapsedTime(step.id) && (
                      <span style={{ marginLeft: 4, color: '#00D0E9' }}>
                        ({getElapsedTime(step.id)})
                      </span>
                    )}
                  </div>
                  {!isDone && (
                    <div style={{
                      fontSize: 10,
                      color: '#94A3B8',
                      marginTop: 3,
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}>
                      预计 {stepDuration[step.id]}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow connector */}
              {idx < steps.length - 1 && (
                <div style={{
                  width: 16,
                  height: 1,
                  background: isDone
                    ? 'rgba(46,213,115,0.3)'
                    : 'rgba(148,163,184,0.2)',
                  margin: '0 4px',
                  flexShrink: 0,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Next step hint */}
      <div style={{
        fontSize: 10,
        color: '#64748B',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#00D0E9',
        }} />
        {nextStepHints[currentStep]}
      </div>

      <style>{`
        @keyframes flowPulse {
          0%, 100% {
            border-color: rgba(0,208,233,0.5);
            box-shadow: 0 0 0 0 rgba(0,208,233,0.3);
          }
          50% {
            border-color: rgba(0,208,233,0.8);
            box-shadow: 0 0 8px 2px rgba(0,208,233,0.2);
          }
        }
      `}</style>
    </div>
  );
}
