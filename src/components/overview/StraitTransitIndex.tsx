import { Ship, Wind, Eye, Anchor } from 'lucide-react';

export default function StraitTransitIndex() {
  const indexValue = 35;
  const isSmooth = indexValue <= 40;
  const statusColor = isSmooth ? '#2ED573' : indexValue <= 60 ? '#F5A623' : '#DC2626';
  const statusText = isSmooth ? '通畅' : indexValue <= 60 ? '一般' : '拥堵';

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 180,
      background: 'rgba(10, 15, 25, 0.95)',
      border: `1px solid ${statusColor}40`,
      borderRadius: 10,
      padding: '10px 14px',
      zIndex: 10,
    }}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Ship size={13} color="#00D0E9" />
        <span style={{ fontSize: 11, color: '#C9CDD4', fontWeight: 500 }}>琼州海峡通行指数</span>
      </div>

      {/* 指数 + 状态 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 32,
          color: statusColor, lineHeight: 1,
        }}>
          {indexValue}
        </span>
        <span style={{
          fontSize: 11, color: statusColor,
          padding: '2px 8px', background: `${statusColor}18`,
          borderRadius: 4, fontWeight: 500,
        }}>
          {statusText}
        </span>
      </div>

      {/* 说明指标 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Wind size={10} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>海面风力</span>
          </div>
          <span style={{ fontSize: 11, color: '#C9CDD4', fontWeight: 500 }}>5级</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={10} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>能见度</span>
          </div>
          <span style={{ fontSize: 11, color: '#2ED573', fontWeight: 500 }}>良好</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Anchor size={10} color="#A0A8B4" />
            <span style={{ fontSize: 11, color: '#A0A8B4' }}>通航状态</span>
          </div>
          <span style={{ fontSize: 11, color: '#2ED573', fontWeight: 500 }}>正常</span>
        </div>
      </div>

      {/* 底部说明 */}
      <div style={{ marginTop: 6, fontSize: 9, color: '#4B5563', lineHeight: 1.4 }}>
        综合风力、能见度、潮汐、船舶密度计算，≤40通畅 / ≤60一般 / &gt;60拥堵
      </div>
    </div>
  );
}
