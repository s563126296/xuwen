import { CheckCircle, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import { useUIStore } from '../../stores/uiStore';
import { useCommandStore } from '../../stores/commandStore';
import type { AiSummary } from '../../stores/overviewStore';

const levelConfig = {
  green: {
    bg: 'rgba(46, 213, 115, 0.08)',
    border: 'rgba(46, 213, 115, 0.2)',
    color: '#2ED573',
    topBorder: '#2ED573',
    Icon: CheckCircle,
  },
  yellow: {
    bg: 'rgba(245, 166, 35, 0.08)',
    border: 'rgba(245, 166, 35, 0.2)',
    color: '#F5A623',
    topBorder: '#F5A623',
    Icon: AlertTriangle,
  },
  orange: {
    bg: 'rgba(255, 107, 53, 0.08)',
    border: 'rgba(255, 107, 53, 0.2)',
    color: '#FF6B35',
    topBorder: '#FF6B35',
    Icon: AlertTriangle,
  },
  red: {
    bg: 'rgba(220, 38, 38, 0.1)',
    border: 'rgba(220, 38, 38, 0.3)',
    color: '#DC2626',
    topBorder: '#DC2626',
    Icon: AlertOctagon,
  },
} as const;

const badgeStyles: Record<string, { bg: string; border: string; color: string }> = {
  flow: { bg: 'rgba(0,208,233,0.1)', border: 'rgba(0,208,233,0.2)', color: '#00D0E9' },
  port: { bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.2)', color: '#FF6B35' },
  resilience: { bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.2)', color: '#F5A623' },
};

const forecastBorderColor = { info: '#00D0E9', warn: '#F5A623', danger: '#FF6B35' };
const priorityColor = { high: '#FF6B35', medium: '#F5A623', low: '#00D0E9' };

export default function AiSummaryBar() {
  const aiSummary = useOverviewStore((s) => s.aiSummary);
  const toggleAiSummaryExpanded = useOverviewStore((s) => s.toggleAiSummaryExpanded);
  const setSystemMode = useUIStore((s) => s.setSystemMode);
  const enterCommandMode = useCommandStore((s) => s.enterCommandMode);
  const setActiveModal = useUIStore((s) => s.setActiveModal);

  if (!aiSummary) return null;

  const { level, expanded } = aiSummary;
  const config = levelConfig[level];
  const Icon = config.Icon;

  const handleActionClick = (action: AiSummary['actions'][0]) => {
    if (action.mode === 'command') {
      enterCommandMode(action);
    } else if (action.mode) {
      setSystemMode(action.mode as any);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 72,
        left: 360,
        right: 360,
        zIndex: 30,
        overflow: 'hidden',
      }}
    >
      {/* Collapsed bar */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label="AI态势研判"
        onClick={toggleAiSummaryExpanded}
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          background: expanded ? '#0D1220' : config.bg,
          borderBottom: expanded ? 'none' : `1px solid ${config.border}`,
          borderTop: expanded ? `2px solid ${config.topBorder}` : 'none',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        {/* Level icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: `${config.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 12, flexShrink: 0,
        }}>
          <Icon size={16} color={config.color} />
        </div>

        {/* Conclusion */}
        <span style={{ fontSize: 13, fontWeight: 500, color: config.color }}>
          {aiSummary.conclusion}
        </span>
        <span style={{ color: `${config.color}40`, margin: '0 12px', fontSize: 11 }}>·</span>

        {/* v2.0: 30min Risk badge */}
        {aiSummary.riskForecast && (
          <>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 24,
              padding: '0 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              background: aiSummary.riskForecast.next30min === 'high' ? 'rgba(255,71,87,0.1)' : aiSummary.riskForecast.next30min === 'medium' ? 'rgba(245,166,35,0.1)' : 'rgba(46,213,115,0.1)',
              border: `1px solid ${aiSummary.riskForecast.next30min === 'high' ? 'rgba(255,71,87,0.2)' : aiSummary.riskForecast.next30min === 'medium' ? 'rgba(245,166,35,0.2)' : 'rgba(46,213,115,0.2)'}`,
              color: aiSummary.riskForecast.next30min === 'high' ? '#FF4757' : aiSummary.riskForecast.next30min === 'medium' ? '#F5A623' : '#2ED573',
            }}>
              <AlertCircle size={12} />
              30min风险:{aiSummary.riskForecast.next30min === 'high' ? '高' : aiSummary.riskForecast.next30min === 'medium' ? '中' : '低'}
            </span>
            <span style={{ color: `${config.color}40`, margin: '0 12px', fontSize: 11 }}>·</span>
          </>
        )}

        {/* Suggestion hint */}
        <span style={{ fontSize: 12, color: '#00D0E9' }}>
          {aiSummary.suggestionHint}
        </span>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {aiSummary.badges.map((b, i) => {
            const bs = badgeStyles[b.type] || badgeStyles.flow;
            const isResilience = b.type === 'resilience';
            return (
              <span
                key={i}
                role={isResilience ? 'button' : undefined}
                tabIndex={isResilience ? 0 : undefined}
                aria-label={isResilience ? '查看韧性指标说明' : undefined}
                onClick={isResilience ? (e) => { e.stopPropagation(); setActiveModal('resilience-info'); } : undefined}
                onMouseEnter={isResilience ? (e) => {
                  e.currentTarget.style.borderColor = bs.color;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                } : undefined}
                onMouseLeave={isResilience ? (e) => {
                  e.currentTarget.style.borderColor = bs.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                } : undefined}
                style={{
                  padding: '3px 10px', borderRadius: 4,
                  fontSize: 11, fontWeight: 600, fontFamily: 'DIN, monospace',
                  background: bs.bg, border: `1px solid ${bs.border}`, color: bs.color,
                  cursor: isResilience ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {b.label}
              </span>
            );
          })}

          {/* v2.0: Confidence badge */}
          {aiSummary.predictionConfidence !== undefined && (
            <span
              style={{
                height: 24,
                padding: '0 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'DIN, monospace',
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.2)',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              可信度 {aiSummary.predictionConfidence}%
            </span>
          )}
        </div>

        {/* Expand icon */}
        <div style={{ marginLeft: 16, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} color="#A0A8B4" /> : <ChevronDown size={14} color="#A0A8B4" />}
        </div>
      </div>

      {/* Expanded panel */}
      <div style={{
        maxHeight: expanded ? 480 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
        background: '#0D1220',
        borderBottom: expanded ? `1px solid ${config.border}` : 'none',
        boxShadow: expanded ? '0 8px 40px rgba(0,0,0,0.7)' : 'none',
      }}>
        {/* Expanded header */}
        <div style={{
          padding: '0 32px', height: 36,
          display: 'flex', alignItems: 'center',
          background: `${config.color}08`,
          borderBottom: `1px solid ${config.color}15`,
        }}>
          <span style={{ fontSize: 12, color: config.color, fontWeight: 500 }}>
            {aiSummary.headerTitle}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#A0A8B4' }}>AI 态势研判</span>
        </div>

        {/* Three columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {/* Left: metrics */}
          <div style={{ padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: 1 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00D0E9' }} />当前态势
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {aiSummary.metrics.map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '8px 10px',
                }}>
                  <div style={{ fontFamily: 'DIN, monospace', fontWeight: 700, fontSize: 20, color: m.color, lineHeight: 1.2 }}>
                    {m.value}
                    {m.label === '应急韧性' && <span style={{ fontSize: 12, color: '#A0A8B4' }}>/100</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#A0A8B4', marginTop: 2 }}>
                    {m.label}
                    {m.tag && (
                      <span style={{
                        display: 'inline-block', fontSize: 9, padding: '1px 5px', borderRadius: 3, marginLeft: 4,
                        background: m.tagType === 'up' ? 'rgba(255,71,87,0.12)' : m.tagType === 'down' ? 'rgba(46,213,115,0.12)' : 'rgba(0,208,233,0.1)',
                        color: m.tagType === 'up' ? '#FF4757' : m.tagType === 'down' ? '#2ED573' : '#00D0E9',
                      }}>
                        {m.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: forecasts */}
          <div style={{ padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: 1 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5A623' }} />趋势预判 (2h)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiSummary.forecasts.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 10px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: 8, borderLeft: `3px solid ${forecastBorderColor[f.level]}`,
                }}>
                  <span style={{
                    fontFamily: 'DIN, monospace', fontSize: 12, fontWeight: 600,
                    color: forecastBorderColor[f.level], flexShrink: 0, minWidth: 36,
                  }}>
                    {f.time}
                  </span>
                  <span style={{ fontSize: 12, color: '#C9CDD4', lineHeight: 1.5 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: 1 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2ED573' }} />建议操作
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiSummary.actions.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,208,233,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(0,208,233,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); handleActionClick(a); }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor[a.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#E0E4E8', fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#A0A8B4', marginTop: 1 }}>{a.description}</div>
                  </div>
                  <button
                    aria-label={a.title}
                    onClick={(e) => { e.stopPropagation(); handleActionClick(a); }}
                    style={{
                      padding: '3px 10px', borderRadius: 4, fontSize: 10,
                      background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.25)',
                      color: '#00D0E9', cursor: 'pointer', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,208,233,0.2)'; e.currentTarget.style.borderColor = '#00D0E9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,208,233,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,208,233,0.25)'; }}
                  >
                    {a.mode === 'command' ? '执行' : a.action === 'locate' ? '定位' : '查看'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* v2.0 Phase 2: Influence Factors Section */}
        {aiSummary.influenceFactors && (
          <div style={{
            padding: '12px 32px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 8 }}>
              影响因子
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: '港口积压', value: aiSummary.influenceFactors.port },
                { label: '流量高峰', value: aiSummary.influenceFactors.traffic },
                { label: '天气影响', value: aiSummary.influenceFactors.weather },
                { label: '节假日', value: aiSummary.influenceFactors.event },
              ].map((factor, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#C9CDD4' }}>{factor.label}</span>
                    <span style={{ fontSize: 11, color: '#00D0E9', fontFamily: 'DIN, monospace', fontWeight: 600 }}>
                      {factor.value}%
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${factor.value}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00D0E9, #00A8C5)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* v2.0 Phase 2: Similar Cases Section */}
        {aiSummary.similarCases && aiSummary.similarCases.length > 0 && (
          <div style={{
            padding: '10px 32px',
            background: 'rgba(26,37,64,0.4)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>
              相似案例：{aiSummary.similarCases[0].date} 周一晚高峰（相似度 {aiSummary.similarCases[0].similarity}%）
              <span style={{ color: '#00D0E9', marginLeft: 8 }}>
                → {aiSummary.similarCases[0].strategy} 缓解 {aiSummary.similarCases[0].effectTime} 分钟
              </span>
            </span>
          </div>
        )}

        {/* v2.0 Phase 2: AI Learning Stats Section */}
        {aiSummary.learningStats && (
          <div style={{
            padding: '10px 32px',
            background: 'rgba(168,85,247,0.06)',
            borderTop: '1px solid rgba(168,85,247,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span style={{ fontSize: 11, color: '#A855F7', fontWeight: 500 }}>AI 学习成果：</span>
            <span style={{ fontSize: 11, color: '#C9CDD4' }}>
              已学习 <span style={{ color: '#A855F7', fontWeight: 600 }}>{aiSummary.learningStats.casesLearned}</span> 个场景
            </span>
            <span style={{ color: '#94A3B8', fontSize: 11 }}>|</span>
            <span style={{ fontSize: 11, color: '#C9CDD4' }}>
              本周采纳率 <span style={{ color: '#A855F7', fontWeight: 600 }}>{aiSummary.learningStats.weeklyAdoptionRate}%</span>
            </span>
            <span style={{ color: '#94A3B8', fontSize: 11 }}>|</span>
            <span style={{ fontSize: 11, color: '#C9CDD4' }}>
              预测准确率 <span style={{ color: '#A855F7', fontWeight: 600 }}>{aiSummary.learningStats.predictionAccuracy}%</span>
            </span>
          </div>
        )}

        {/* Compare bar */}
        <div style={{
          padding: '8px 32px',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          fontSize: 11, color: '#A0A8B4',
          display: 'flex', gap: 20, alignItems: 'center',
        }}>
          <span>vs 去年同期:</span>
          {aiSummary.compares.map((c, i) => (
            <span key={i}>
              {c.label} <span style={{ color: c.good ? '#2ED573' : '#FF4757' }}>{c.value}</span>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', color: '#2ED573' }}>{aiSummary.compareConclusion}</span>
        </div>
      </div>
    </div>
  );
}
