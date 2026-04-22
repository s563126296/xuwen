import { useEffect, useState, useCallback, useRef } from 'react';
import { useMapScene } from '../../map/MapSceneContext';
import { mapPointToGcj } from '../../../utils/coordTransform';
import { usePortStore } from '../../../stores/portStore';

interface OverlayItem {
  id: string;
  lngLat: [number, number]; // WGS84
  label: string;
  caption: string;
  tone: 'cyan' | 'amber' | 'red' | 'green';
  type: 'flow' | 'hazard';
}

const TONE_COLORS: Record<string, string> = {
  cyan: '#00D0E9',
  amber: '#F5A623',
  red: '#FF4757',
  green: '#2ED573',
};

export default function PortFlowOverlay() {
  const scene = useMapScene();
  const weather = usePortStore((s) => s.weather);
  const straitIndex = usePortStore((s) => s.straitIndex);
  const queue = usePortStore((s) => s.queue);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const rafRef = useRef(0);

  // 构建叠加要素列表
  const items: OverlayItem[] = [
    {
      id: 'inbound', lngLat: [110.10, 20.24], type: 'flow',
      label: `进港 ${queue.totalVehicles}辆`, caption: `预计${queue.estimatedWait}min`,
      tone: queue.estimatedWait > 60 ? 'amber' : 'cyan',
    },
    {
      id: 'outbound', lngLat: [110.22, 20.04], type: 'flow',
      label: '出港疏散', caption: '海口方向',
      tone: 'green',
    },
  ];

  if (queue.estimatedWait > 60) {
    items.push({
      id: 'queue', lngLat: [110.13, 20.23], type: 'flow',
      label: `待渡排队`, caption: `${queue.totalVehicles}辆 · ${queue.estimatedWait}min`,
      tone: queue.estimatedWait > 90 ? 'red' : 'amber',
    });
  }

  if (weather.suspensionWarning) {
    items.push({
      id: 'suspension', lngLat: [110.16, 20.14], type: 'hazard',
      label: '停航预警', caption: `风速${weather.windSpeed.toFixed(1)}m/s · 浪高${straitIndex.waveHeight}m`,
      tone: 'red',
    });
  }

  if (queue.estimatedWait > 90) {
    items.push({
      id: 'congestion', lngLat: [110.135, 20.232], type: 'hazard',
      label: '拥堵预警', caption: `${queue.totalVehicles}辆排队`,
      tone: 'amber',
    });
  }

  const updatePositions = useCallback(() => {
    if (!scene) return;
    const next = new Map<string, { x: number; y: number }>();
    items.forEach((item) => {
      const gcj = mapPointToGcj(item.lngLat);
      const screen = scene.lngLatToContainer(gcj);
      next.set(item.id, { x: screen.x, y: screen.y });
    });
    setPositions(next);
  }, [scene, items.length, queue.totalVehicles, queue.estimatedWait, weather.suspensionWarning]);

  useEffect(() => {
    if (!scene) return;
    const throttledUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    scene.on('mapmove', throttledUpdate);
    scene.on('zoomend', throttledUpdate);
    scene.on('rotateend', throttledUpdate);
    throttledUpdate();
    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.off('mapmove', throttledUpdate);
      scene.off('zoomend', throttledUpdate);
      scene.off('rotateend', throttledUpdate);
    };
  }, [scene, updatePositions]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {items.map((item) => {
        const pos = positions.get(item.id);
        if (!pos) return null;
        const color = TONE_COLORS[item.tone];
        const isHazard = item.type === 'hazard';

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* 脉冲圈（危险区） */}
            {isHazard && (
              <div style={{
                position: 'absolute',
                inset: -30,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                opacity: 0.3,
                animation: 'portHazardPulse 2.4s ease-in-out infinite',
              }} />
            )}

            {/* 标签 */}
            <div style={{
              background: 'rgba(5,16,29,0.88)',
              border: `1px solid ${color}40`,
              borderRadius: 6,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: isHazard ? `0 0 20px ${color}30` : undefined,
            }}>
              <div style={{ color, fontSize: 12, fontWeight: 700 }}>
                {item.label}
              </div>
              <div style={{ color: 'rgba(220,244,255,0.6)', fontSize: 10, marginTop: 2 }}>
                {item.caption}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes portHazardPulse {
          0% { transform: scale(0.7); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0.1; }
          100% { transform: scale(0.7); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
