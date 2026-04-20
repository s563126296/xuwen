import { dinFont } from './strategyConstants';

export default function HistoryItem({ name, rate, color }: { name: string; rate: number; color: string }) {
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
