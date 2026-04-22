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
  const crossingStats = usePortStore((s) => s.crossingStats);
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

      {/* 右上角海峡实时数据 */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(5,16,29,0.88)',
        border: '1px solid rgba(0,208,233,0.3)',
        borderRadius: 8,
        padding: '10px 14px',
        backdropFilter: 'blur(8px)',
        minWidth: 180,
      }}>
        <div style={{ color: TONE_COLORS.cyan, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          琼州海峡实时
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'rgba(220,244,255,0.6)' }}>风力</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{straitIndex.windLevel} 级</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'rgba(220,244,255,0.6)' }}>能见度</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{straitIndex.visibility} 千米</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'rgba(220,244,255,0.6)' }}>浪高</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{straitIndex.waveHeight} 米</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'rgba(220,244,255,0.6)' }}>潮汐</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {{ rising: '涨潮', falling: '落潮', high: '高潮', low: '低潮' }[weather.tideStatus] || '-'}
            </span>
          </div>
          <div style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: '1px solid rgba(0,208,233,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
          }}>
            <span style={{ color: 'rgba(220,244,255,0.6)' }}>今日过海</span>
            <span style={{ color: TONE_COLORS.green, fontWeight: 700 }}>
              {crossingStats.todayTotal.toLocaleString()} 辆
            </span>
          </div>
        </div>
      </div>

      {/* 未来6小时预报 */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(5,16,29,0.88)',
          border: '1px solid rgba(0,208,233,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          backdropFilter: 'blur(8px)',
          minWidth: 200,
        }}>
          <div style={{ color: TONE_COLORS.cyan, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            未来6小时预报
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {weather.forecast.slice(0, 6).map((f, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ color: 'rgba(220,244,255,0.5)', fontSize: 9, marginBottom: 4 }}>
                  {f.hour}时
                </div>
                <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>
                  {f.windLevel}级
                </div>
                <div style={{ color: 'rgba(220,244,255,0.6)', fontSize: 9, marginTop: 2 }}>
                  {f.visibility}km
                </div>
              </div>
            ))}
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
      `}</style>
    </div>
  );
}
