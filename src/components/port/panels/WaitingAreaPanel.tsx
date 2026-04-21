import React from 'react';
import { ParkingCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(10,30,50,0.9) 100%)',
  border: '1px solid rgba(0,208,233,0.3)',
  borderRadius: 8,
  padding: '12px 14px',
  backdropFilter: 'blur(12px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 0 20px rgba(0,208,233,0.15), inset 0 0 20px rgba(0,208,233,0.05)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#00D0E9',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

const bigNumberStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
  color: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.5)',
};

const getCapacityColor = (ratio: number): string => {
  if (ratio < 0.5) return '#2ED573';
  if (ratio < 0.75) return '#F5A623';
  return '#FF4757';
};

export default function WaitingAreaPanel() {
  const { waitingAreas } = usePortStore();

  const totalWaiting = waitingAreas.reduce((sum, area) => sum + area.current, 0);
  const totalCar = waitingAreas.reduce((sum, area) => sum + area.byType.car, 0);
  const totalTruck = waitingAreas.reduce((sum, area) => sum + area.byType.truck, 0);
  const totalHazmat = waitingAreas.reduce((sum, area) => sum + area.byType.hazmat, 0);

  return (
    <div style={panelStyle}>
      {/* 边框流光 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 8,
        padding: '1px',
        background: 'linear-gradient(90deg, transparent, #00D0E9, transparent)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: 'borderFlow 3s linear infinite',
        pointerEvents: 'none',
      }} />

      <div style={titleStyle}>
        <ParkingCircle size={14} />
        待渡区监控
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {/* 顶部：总待渡车辆 */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={bigNumberStyle}>
            <CountUp end={totalWaiting} duration={1.5} separator="," />
            <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>辆</span>
          </div>
          <div style={labelStyle}>当前待渡总量</div>
        </div>

        {/* 3个待渡区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {waitingAreas.map((area) => {
            const ratio = area.current / area.capacity;
            const color = getCapacityColor(ratio);
            const percentage = Math.round(ratio * 100);

            return (
              <div key={area.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* 名称 */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', minWidth: 90, flexShrink: 0 }}>
                  {area.name}
                </div>

                {/* 进度条 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '100%',
                    height: 12,
                    background: 'rgba(0,208,233,0.1)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${color}cc, ${color}ff, ${color}cc)`,
                      backgroundSize: '200% 100%',
                      animation: 'progressShine 2s ease-in-out infinite',
                      position: 'relative',
                      boxShadow: `0 0 10px ${color}, inset 0 0 5px ${color}`,
                      transition: 'width 0.5s ease',
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '30%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${color}ff)`,
                        animation: 'progressGlow 1.5s ease-in-out infinite',
                      }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 600,
                      color: percentage > 50 ? '#fff' : 'rgba(255,255,255,0.8)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}>
                      {percentage}%
                    </div>
                  </div>
                </div>

                {/* 数字 */}
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: color,
                  fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
                  minWidth: 60,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {area.current}/{area.capacity}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部：分车型统计 */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <div style={{
            flex: 1,
            background: 'rgba(0,208,233,0.05)',
            borderRadius: 6,
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#00D0E9',
              fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
            }}>
              {totalCar}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>小客车</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(245,166,35,0.05)',
            borderRadius: 6,
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#F5A623',
              fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
            }}>
              {totalTruck}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>货车</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(255,71,87,0.05)',
            borderRadius: 6,
            padding: '6px 8px',
            textAlign: 'center',
            border: '1px solid rgba(255,71,87,0.2)',
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#FF4757',
              fontFamily: "'DIN Alternate', 'Roboto Mono', monospace",
            }}>
              {totalHazmat}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>危化品</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes progressShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes progressGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
