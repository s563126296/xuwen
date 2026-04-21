import { Anchor } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

function digestionColor(minutes: number): string {
  if (minutes < 120) return '#2ED573';
  if (minutes < 240) return '#F5A623';
  if (minutes < 360) return '#FF8C00';
  return '#FF4757';
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
}

export default function PortDigestionCard() {
  const portDigestion = useOverviewStore((s) => s.portDigestion);
  const xw = portDigestion.xuwen;
  const ha = portDigestion.haian;

  const suggestion = xw.digestionMinutes > ha.digestionMinutes * 2
    ? '徐闻港消化偏慢，海安新港余量充足'
    : xw.digestionMinutes < ha.digestionMinutes
      ? '徐闻港运行顺畅，海安新港压力较大'
      : '双港消化能力均衡';

  const ports = [
    { key: '徐闻港', data: xw },
    { key: '海安新港', data: ha },
  ];

  const summary = (
    <div style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      徐闻港 <span style={{ color: '#4da6ff', fontWeight: 600 }}>{xw.waitingVehicles}辆</span> · 消化 <span style={{ color: digestionColor(xw.digestionMinutes) }}>{formatTime(xw.digestionMinutes)}</span> | 海安 <span style={{ color: '#4da6ff', fontWeight: 600 }}>{ha.waitingVehicles}辆</span> · <span style={{ color: digestionColor(ha.digestionMinutes) }}>{formatTime(ha.digestionMinutes)}</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="港口排队情况"
      icon={<Anchor size={14} style={{ color: '#4da6ff' }} />}
      summary={summary}
      delay="0s"
      defaultExpanded={true}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {ports.map((p) => (
          <div key={p.key} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 6 }}>{p.key}</div>
            <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 24, fontWeight: 700, color: '#00D0E9', marginBottom: 4 }}>
              {p.data.waitingVehicles}
              <span style={{ fontSize: 12, color: '#A0A8B4', fontWeight: 400, fontFamily: 'inherit', marginLeft: 4 }}>辆等待</span>
            </div>
            <div style={{ fontSize: 12, color: digestionColor(p.data.digestionMinutes), marginBottom: 4 }}>
              消化时间 {formatTime(p.data.digestionMinutes)}
            </div>
            <div style={{ fontSize: 12, color: '#A0A8B4' }}>船班间隔 {p.data.shipInterval}min</div>
            <div style={{ fontSize: 12, color: '#A0A8B4' }}>下班船 {p.data.nextDeparture}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(0,208,233,0.08)', border: '1px solid rgba(0,208,233,0.15)', borderRadius: 6, fontSize: 11, color: '#00D0E9' }}>
        {suggestion}
      </div>
    </CollapsibleCard>
  );
}
