import { useEffect, useState, useCallback, useRef } from 'react';
import { useMapScene } from '../../map/MapSceneContext';
import { mapPointToGcj } from '../../../utils/coordTransform';
import { usePortStore } from '../../../stores/portStore';

const TONE_COLORS: Record<string, string> = {
  cyan: '#00D0E9',
  amber: '#F5A623',
  red: '#FF4757',
  green: '#2ED573',
};

export default function PortStraitOverlay() {
  const scene = useMapScene();
  const weather = usePortStore((s) => s.weather);
  const straitIndex = usePortStore((s) => s.straitIndex);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  // 海峡中心坐标
  const STRAIT_CENTER: [number, number] = [110.18, 20.15];

  const updatePosition = useCallback(() => {
    if (!scene) return;
    const gcj = mapPointToGcj(STRAIT_CENTER);
    const screen = scene.lngLatToContainer(gcj);
    setCenterPos({ x: screen.x, y: screen.y });
  }, [scene]);

  useEffect(() => {
    if (!scene) return;
    const throttledUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    scene.on('mapmove', throttledUpdate);
    scene.on('zoomend', throttledUpdate);
    throttledUpdate();
    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.off('mapmove', throttledUpdate);
      scene.off('zoomend', throttledUpdate);
    };
  }, [scene, updatePosition]);

  const statusColor = straitIndex.navigationStatus === 'open' ? TONE_COLORS.green : straitIndex.navigationStatus === 'restricted' ? TONE_COLORS.amber : TONE_COLORS.red;
  const statusText = straitIndex.navigationStatus === 'open' ? '通航' : straitIndex.navigationStatus === 'restricted' ? '限航' : '停航';

  // 风向角度（0=北，90=东，180=南，270=西）
  const windAngle = weather.windDirection;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
      {/* 海峡中央通航状态徽章 */}
      <div
        style={{
          position: 'absolute',
          left: centerPos.x,
          top: centerPos.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* 外圈脉冲 */}
        <div style={{
          position: 'absolute',
          inset: -50,
          borderRadius: '50%',
          border: `3px solid ${statusColor}`,
          opacity: 0.2,
          animation: 'straitPulse 3s ease-in-out infinite',
        }} />

        {/* 主徽章 */}
        <div style={{
          background: 'rgba(5,16,29,0.92)',
          border: `2px solid ${statusColor}`,
          borderRadius: 12,
          padding: '12px 20px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 0 30px ${statusColor}40`,
          minWidth: 140,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ color: statusColor, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
              {straitIndex.score}
            </div>
            <div style={{ color: 'rgba(220,244,255,0.5)', fontSize: 10, marginTop: 2 }}>
              通行指数
            </div>
          </div>
          <div style={{
            background: statusColor + '20',
            border: `1px solid ${statusColor}60`,
            borderRadius: 6,
            padding: '4px 8px',
            textAlign: 'center',
          }}>
            <div style={{ color: statusColor, fontSize: 13, fontWeight: 700 }}>
              {statusText}
            </div>
          </div>
        </div>

        {/* 风向指示器 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: -80,
          transform: `translateX(-50%) rotate(${windAngle}deg)`,
          transformOrigin: 'center bottom',
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `40px solid ${TONE_COLORS.cyan}`,
            opacity: 0.7,
            filter: 'drop-shadow(0 0 8px rgba(0,208,233,0.5))',
          }} />
          <div style={{
            position: 'absolute',
            top: 45,
            left: '50%',
            transform: 'translateX(-50%)',
            color: TONE_COLORS.cyan,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {weather.windSpeed.toFixed(1)} 米/秒
          </div>
        </div>
      </div>

      {/* 未来6小时预报 — 增强显示 */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'linear-gradient(145deg, rgba(6,16,31,0.95), rgba(8,31,49,0.92))',
          border: '1px solid rgba(0,208,233,0.4)',
          borderRadius: 10,
          padding: '14px 18px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,208,233,0.15)',
          minWidth: 420,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(0,208,233,0.2)',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: TONE_COLORS.cyan,
              boxShadow: `0 0 8px ${TONE_COLORS.cyan}`,
            }} />
            <span style={{ color: TONE_COLORS.cyan, fontSize: 13, fontWeight: 700 }}>
              未来6小时通航窗口
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {weather.forecast.slice(0, 6).map((f, i) => {
              const isRisky = f.windLevel >= 6 || f.visibility <= 9.5;
              const toneColor = isRisky ? TONE_COLORS.amber : TONE_COLORS.cyan;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: isRisky ? 'rgba(245,166,35,0.08)' : 'rgba(0,208,233,0.05)',
                    border: `1px solid ${isRisky ? 'rgba(245,166,35,0.2)' : 'rgba(0,208,233,0.15)'}`,
                    borderRadius: 6,
                    padding: '8px 4px',
                    position: 'relative',
                  }}
                >
                  {isRisky && (
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: TONE_COLORS.amber,
                      boxShadow: `0 0 8px ${TONE_COLORS.amber}`,
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                  )}
                  <div style={{
                    color: 'rgba(220,244,255,0.6)',
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    {f.hour}:00
                  </div>
                  <div style={{
                    color: toneColor,
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}>
                    {f.windLevel}
                  </div>
                  <div style={{
                    color: 'rgba(220,244,255,0.5)',
                    fontSize: 9,
                    marginBottom: 6,
                  }}>
                    级风
                  </div>
                  <div style={{
                    color: 'rgba(220,244,255,0.7)',
                    fontSize: 10,
                    fontWeight: 600,
                  }}>
                    {f.visibility}km
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 停航预警横幅 */}
      {weather.suspensionWarning && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(255,71,87,0.9), rgba(255,71,87,0.7))',
          padding: '12px 20px',
          textAlign: 'center',
          borderBottom: '2px solid #FF4757',
          animation: 'warningBlink 2s ease-in-out infinite',
        }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>
            ⚠️ 停航预警 — 风速 {weather.windSpeed.toFixed(1)} 米/秒 · 浪高 {straitIndex.waveHeight} 米
          </div>
        </div>
      )}

      <style>{`
        @keyframes straitPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.05; }
        }
        @keyframes warningBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
