import { useEffect, useRef, useState } from 'react';
import MapVideoDock from './MapVideoDock';
import { useUIStore } from '../../stores/uiStore';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

// 进港大道关键坐标点（GCJ-02）
const JINGANG_ROAD = [
  [110.134812, 20.232438],  // 徐闻港
  [110.145, 20.245],        // 华四村
  [110.155, 20.265],        // 迈陈镇
  [110.165, 20.285],        // 中段
  [110.175, 20.305],        // 南山镇
  [110.185, 20.325],        // 近港区
];

// 拥堵段样式配置
const SEGMENT_STYLES = [
  { color: '#2ed573', weight: 4, label: '畅通' },
  { color: '#00D0E9', weight: 6, label: '缓行' },
  { color: '#ffa502', weight: 8, label: '拥堵' },
  { color: '#ff4757', weight: 10, label: '严重拥堵' },
  { color: '#d63031', weight: 12, label: '严重拥堵' },
  { color: '#a00', weight: 14, label: '极度拥堵' },
];

interface Particle {
  progress: number;
  offset: number;
}

export default function CommandMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const [mapReady, setMapReady] = useState(false);

  const setActiveModal = useUIStore((s) => s.setActiveModal);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // 动态加载高德地图 API
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.async = true;
    script.onload = () => {
      const AMap = (window as any).AMap;

      const map = new AMap.Map(mapRef.current, {
        center: [110.165, 20.285],
        zoom: 11.5,
        pitch: 0,
        rotation: 0,
        viewMode: '2D',
        mapStyle: 'amap://styles/darkblue',
        features: ['bg', 'road'],
      });

      map.on('complete', () => {
        // 渲染拥堵路段
        for (let i = 0; i < JINGANG_ROAD.length - 1; i++) {
          const style = SEGMENT_STYLES[i];
          const path = [JINGANG_ROAD[i], JINGANG_ROAD[i + 1]];

          // 南段（i>=3）先渲染发光层
          if (i >= 3) {
            const glowLine = new AMap.Polyline({
              path,
              strokeColor: style.color,
              strokeWeight: style.weight + 8,
              strokeOpacity: 0.15,
              zIndex: 14,
            });
            map.add(glowLine);
          }

          // 主路段
          const mainLine = new AMap.Polyline({
            path,
            strokeColor: style.color,
            strokeWeight: style.weight,
            strokeOpacity: 0.9,
            zIndex: 15,
          });
          map.add(mainLine);
        }

        // 初始化粒子
        particlesRef.current = Array.from({ length: 6 }, (_, i) => ({
          progress: 0,
          offset: i * 0.16,
        }));

        // 粒子动画
        const animateParticles = () => {
          const now = Date.now();

          particlesRef.current.forEach((particle, idx) => {
            // 计算当前进度
            particle.progress = ((now / 10000) + particle.offset) % 1;

            // 根据进度计算位置
            const segmentIndex = Math.floor(particle.progress * (JINGANG_ROAD.length - 1));
            const segmentProgress = (particle.progress * (JINGANG_ROAD.length - 1)) % 1;

            const start = JINGANG_ROAD[segmentIndex];
            const end = JINGANG_ROAD[Math.min(segmentIndex + 1, JINGANG_ROAD.length - 1)];
            const lng = start[0] + (end[0] - start[0]) * segmentProgress;
            const lat = start[1] + (end[1] - start[1]) * segmentProgress;

            // 创建或更新 Marker
            const markerId = `particle-${idx}`;
            let marker = map.getAllOverlays('marker').find((m: any) => m.getExtData()?.id === markerId);

            if (!marker) {
              marker = new AMap.Marker({
                position: [lng, lat],
                content: `<div style="width:8px;height:8px;border-radius:50%;background:#00D0E9;box-shadow:0 0 8px #00D0E9;"></div>`,
                offset: new AMap.Pixel(-4, -4),
                zIndex: 20,
                extData: { id: markerId },
              });
              map.add(marker);
            } else {
              marker.setPosition([lng, lat]);
            }
          });

          animationFrameRef.current = requestAnimationFrame(animateParticles);
        };
        animateParticles();

        mapInstance.current = map;
        setMapReady(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      className="card"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* 地图容器 */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

      {/* 深色蒙层（增强科技感） */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10,25,41,0.25)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* 加载状态 */}
      {!mapReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: '#0D1B2A',
          zIndex: 100,
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span style={{ fontSize: 14, color: '#475569' }}>加载地图...</span>
        </div>
      )}

      {/* 地图标题 */}
      <div
        onClick={() => setActiveModal('congestion-detail')}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          padding: '8px 12px',
          borderRadius: 6,
          background: 'rgba(10,15,25,0.9)',
          border: '1px solid rgba(0,208,233,0.15)',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.15)'; }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>进港大道拥堵态势</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>点击查看详情 · 路段车辆/危化品/流入趋势</div>
      </div>

      {/* 图例 */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 20,
        padding: '8px 10px',
        borderRadius: 6,
        background: 'rgba(10,15,25,0.9)',
        border: '1px solid rgba(0,208,233,0.12)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>拥堵等级</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SEGMENT_STYLES.map((style, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24,
                height: 3,
                background: style.color,
                borderRadius: 2,
                boxShadow: i >= 3 ? `0 0 8px ${style.color}` : 'none',
              }} />
              <span style={{ fontSize: 10, color: '#64748B' }}>{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapVideoDock />

      {/* 地图控制按钮 */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 10
      }}>
        <button aria-label="放大地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16,
          backdropFilter: 'blur(10px)',
        }} onClick={() => mapInstance.current?.zoomIn()}>+</button>
        <button aria-label="缩小地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16,
          backdropFilter: 'blur(10px)',
        }} onClick={() => mapInstance.current?.zoomOut()}>-</button>
      </div>
    </div>
  );
}
