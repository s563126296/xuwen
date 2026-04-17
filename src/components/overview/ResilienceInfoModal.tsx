import { Shield, AlertTriangle, ArrowUpCircle, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const levels = [
  { range: '80-100', label: '优秀', color: '#2ED573', desc: '系统弹性充足，可应对多重突发' },
  { range: '60-79', label: '良好', color: '#00D0E9', desc: '有一定余量，可应对单一突发' },
  { range: '40-59', label: '警戒', color: '#F5A623', desc: '余量不足，突发事件可能导致大面积拥堵' },
  { range: '0-39', label: '危险', color: '#FF4757', desc: '系统已接近极限，任何突发都可能瘫痪' },
];

const dimensions = [
  { key: 'corridorRedundancy', label: '通道冗余', icon: ArrowUpCircle, desc: '备用道路的剩余容量。主路堵了，有没有替代路线可以分流' },
  { key: 'alternateRoutes', label: '应急资源', icon: Shield, desc: '交警、拖车、信号灯等可调配的应急资源是否就位' },
  { key: 'controlCapacity', label: '恢复速度', icon: Zap, desc: '历史上类似拥堵从峰值恢复到正常需要多久' },
  { key: 'portBuffer', label: '承载弹性', icon: AlertTriangle, desc: '当前车流量距离道路理论最大容量还有多少空间' },
];

export default function ResilienceInfoModal() {
  const { systemResilience } = useDashboardStore();
  const score = systemResilience.score;
  const currentLevel = levels.find((l) => {
    const [min, max] = l.range.split('-').map(Number);
    return score >= min && score <= max;
  }) || levels[2];

  const subScores = systemResilience.subScores;
  const weakest = systemResilience.weakestDimension;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Definition */}
      <div style={{ padding: '12px 14px', background: 'rgba(0,208,233,0.06)', borderRadius: 8, border: '1px solid rgba(0,208,233,0.12)' }}>
        <div style={{ fontSize: 13, color: '#C9CDD4', fontWeight: 600, marginBottom: 6 }}>什么是交通系统韧性？</div>
        <div style={{ fontSize: 12, color: '#A0A8B4', lineHeight: 1.6 }}>
          交通系统在突发压力（事故、恶劣天气、节假日高峰）下维持基本运转并快速恢复的能力。分数越高，系统越能"扛住"突发状况。
        </div>
      </div>

      {/* Current score highlight */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: `${currentLevel.color}10`, borderRadius: 8, border: `1px solid ${currentLevel.color}30` }}>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DIN, sans-serif', color: currentLevel.color }}>{score}</div>
        <div>
          <div style={{ fontSize: 13, color: currentLevel.color, fontWeight: 600 }}>当前等级：{currentLevel.label}</div>
          <div style={{ fontSize: 12, color: '#A0A8B4', marginTop: 2 }}>{currentLevel.desc}</div>
        </div>
      </div>

      {/* Score levels */}
      <div>
        <div style={{ fontSize: 13, color: '#C9CDD4', fontWeight: 600, marginBottom: 8 }}>分数等级</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {levels.map((l) => (
            <div key={l.range} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: l.range === currentLevel.range ? `${l.color}10` : 'rgba(0,0,0,0.2)',
              borderRadius: 6, border: l.range === currentLevel.range ? `1px solid ${l.color}30` : '1px solid transparent',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: l.color, fontWeight: 600, width: 50 }}>{l.range}</span>
              <span style={{ fontSize: 12, color: '#C9CDD4', width: 36 }}>{l.label}</span>
              <span style={{ fontSize: 12, color: '#A0A8B4' }}>{l.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-dimensions */}
      <div>
        <div style={{ fontSize: 13, color: '#C9CDD4', fontWeight: 600, marginBottom: 8 }}>四个子维度</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {dimensions.map((d) => {
            const val = subScores[d.key as keyof typeof subScores];
            const isWeakest = d.label === weakest;
            const barColor = val < 40 ? '#FF4757' : val < 60 ? '#F5A623' : '#00D0E9';
            return (
              <div key={d.key} style={{
                padding: '10px 12px', background: isWeakest ? 'rgba(255,71,87,0.06)' : 'rgba(0,0,0,0.2)',
                borderRadius: 6, border: isWeakest ? '1px solid rgba(255,71,87,0.2)' : '1px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <d.icon size={13} color={isWeakest ? '#FF4757' : '#A0A8B4'} />
                    <span style={{ fontSize: 12, color: isWeakest ? '#FF4757' : '#C9CDD4', fontWeight: 500 }}>
                      {d.label}{isWeakest && ' (最弱)'}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DIN, sans-serif', color: barColor }}>{val}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${val}%`, background: barColor, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#A0A8B4', lineHeight: 1.5 }}>{d.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement suggestion */}
      <div style={{ padding: '10px 14px', background: 'rgba(245,166,35,0.08)', borderRadius: 8, border: '1px solid rgba(245,166,35,0.2)' }}>
        <div style={{ fontSize: 13, color: '#F5A623', fontWeight: 600, marginBottom: 4 }}>提升建议</div>
        <div style={{ fontSize: 12, color: '#C9CDD4', lineHeight: 1.6 }}>
          当前最弱维度为「{weakest}」（{subScores[Object.keys(subScores).find(k => dimensions.find(d => d.key === k && d.label === weakest)) as keyof typeof subScores] || 0}分）。
          {weakest === '通道冗余' && '建议提前启动 S376 省道分流，增加备用通道容量。'}
          {weakest === '应急资源' && '建议增派交警和拖车到关键路口，确保应急资源就位。'}
          {weakest === '恢复速度' && '建议优化信号灯配时方案，缩短拥堵恢复时间。'}
          {weakest === '承载弹性' && '建议启动限流措施，降低当前车流密度。'}
        </div>
      </div>
    </div>
  );
}
