import { useEffect } from 'react';
import { JINGANG_ROAD, PARTICLE_CONFIG } from '../constants';

export function useParticleAnimation(
  map: any,
  mapReady: boolean
) {
  useEffect(() => {
    if (!mapReady || !map || !(window as any).AMap) return;

    const AMap = (window as any).AMap;
    const particles: any[] = [];
    const particleProgress: number[] = [];

    // 计算路径总长度
    const segmentLengths: number[] = [];
    let totalLength = 0;
    for (let i = 0; i < JINGANG_ROAD.length - 1; i++) {
      const len = Math.sqrt(
        Math.pow(JINGANG_ROAD[i + 1][0] - JINGANG_ROAD[i][0], 2) +
        Math.pow(JINGANG_ROAD[i + 1][1] - JINGANG_ROAD[i][1], 2)
      );
      segmentLengths.push(len);
      totalLength += len;
    }

    // 创建粒子
    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const particle = new AMap.Marker({
        position: JINGANG_ROAD[0],
        content: `<div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00D0E9;
          box-shadow: 0 0 6px #00D0E9, 0 0 12px rgba(0,208,233,0.4);
        "></div>`,
        offset: new AMap.Pixel(-4, -4),
        zIndex: 50,
      });
      map.add(particle);
      particles.push(particle);
      particleProgress.push((i / PARTICLE_CONFIG.COUNT) * totalLength);
    }

    // 粒子动画循环
    const particleInterval = setInterval(() => {
      particles.forEach((particle, idx) => {
        let progress = particleProgress[idx];

        // 根据路段拥堵程度调整速度
        let currentSegment = 0;
        let accumulatedLength = 0;
        for (let i = 0; i < segmentLengths.length; i++) {
          if (progress < accumulatedLength + segmentLengths[i]) {
            currentSegment = i;
            break;
          }
          accumulatedLength += segmentLengths[i];
        }

        // 速度映射：畅通段快，拥堵段慢
        let speed: number;
        if (currentSegment === 0) speed = 0.0005;
        else if (currentSegment === 1) speed = 0.0003;
        else if (currentSegment === 2) speed = 0.0002;
        else if (currentSegment === 3) speed = 0.0001;
        else if (currentSegment === 4) speed = 0.00005;
        else speed = 0.00003;

        progress += speed;

        if (progress >= totalLength) {
          progress = 0;
        }

        particleProgress[idx] = progress;

        // 计算粒子位置
        let accLen = 0;
        for (let i = 0; i < segmentLengths.length; i++) {
          if (progress < accLen + segmentLengths[i]) {
            const t = (progress - accLen) / segmentLengths[i];
            const lng = JINGANG_ROAD[i][0] + t * (JINGANG_ROAD[i + 1][0] - JINGANG_ROAD[i][0]);
            const lat = JINGANG_ROAD[i][1] + t * (JINGANG_ROAD[i + 1][1] - JINGANG_ROAD[i][1]);
            particle.setPosition([lng, lat]);
            break;
          }
          accLen += segmentLengths[i];
        }
      });
    }, PARTICLE_CONFIG.INTERVAL);

    return () => {
      clearInterval(particleInterval);
      particles.forEach(p => map.remove(p));
    };
  }, [map, mapReady]);
}
