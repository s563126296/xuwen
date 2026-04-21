import { ArrowLeftRight } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { TidalStatus, TidalIntensity } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const statusLabel: Record<TidalStatus, string> = {
  inbound_tide: '进港潮',
  balanced: '均衡',
  outbound_tide: '出港潮',
};

const intensityLabel: Record<TidalIntensity, string> = {
  light: '轻度',
  moderate: '中等强度',
  strong: '强',
};

export default function TidalEffectCard() {
  const tidalEffect = useOverviewStore((s) => s.tidalEffect);
  const total = tidalEffect.inboundFlow + tidalEffect.outboundFlow;
  const inPct = total > 0 ? (tidalEffect.inboundFlow / total) * 100 : 50;

  const ratio = tidalEffect.outboundFlow > 0
    ? (tidalEffect.inboundFlow / tidalEffect.outboundFlow).toFixed(1)
    : '0.0';

  const summary = (
    <div style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      进城 <span style={{ color: '#4da6ff', fontWeight: 600 }}>{tidalEffect.inboundFlow}</span> · 出城 <span style={{ color: '#f0b429', fontWeight: 600 }}>{tidalEffect.outboundFlow}</span> · 比值 <span style={{ color: '#34d399', fontWeight: 600 }}>{ratio}</span> · 潮汐{intensityLabel[tidalEffect.intensity]}
    </div>
  );

  return (
    <CollapsibleCard
      title="进出港流量对比"
      icon={<ArrowLeftRight size={14} style={{ color: '#4da6ff' }} />}
      summary={summary}
      delay="0.1s"
    >

      {/* Balance bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A0A8B4', marginBottom: 4 }}>
          <span>出港潮</span>
          <span>进港潮</span>
        </div>
        <div style={{ position: 'relative', height: 18, background: 'rgba(0,0,0,0.3)', borderRadius: 9, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: `${inPct}%`,
            background: 'linear-gradient(90deg, rgba(0,208,233,0.3), rgba(0,208,233,0.6))',
            borderRadius: 9,
            transition: 'width 0.5s ease',
          }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${100 - inPct}%`,
            background: 'linear-gradient(90deg, rgba(245,166,35,0.6), rgba(245,166,35,0.3))',
            borderRadius: 9,
            transition: 'width 0.5s ease',
          }} />
          {/* Marker */}
          <div style={{
            position: 'absolute', left: `${100 - inPct}%`, top: -2, width: 3, height: 22,
            background: '#fff', borderRadius: 2, transform: 'translateX(-1px)',
            boxShadow: '0 0 6px rgba(255,255,255,0.5)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
          <span style={{ fontFamily: 'DIN, sans-serif', color: '#F5A623', fontWeight: 600 }}>{tidalEffect.outboundFlow}</span>
          <span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9', fontWeight: 600 }}>{tidalEffect.inboundFlow}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#C9CDD4', marginBottom: 4 }}>
        状态：{statusLabel[tidalEffect.status]}（{intensityLabel[tidalEffect.intensity]}）
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>
          进港 {tidalEffect.inboundFlow} 辆/h &larr;&rarr; 出港 {tidalEffect.outboundFlow} 辆/h
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#A0A8B4', marginTop: 4 }}>
        预计翻转时间：<span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9', fontWeight: 600 }}>{tidalEffect.reversalTime}</span>
      </div>
    </CollapsibleCard>
  );
}
