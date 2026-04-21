import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../utils/coordTransform';
import cameraData from '../../../../data/geo/cameras.json';
import infoScreenSvg from './assets/info-screen.svg';

const STATUS_COLORS = {
  normal: '#4da6ff',
  abnormal: '#3b82f6',
  triggered: '#2563eb',
  offline: '#6b7280',
};

/**
 * 信息发布屏图层 (Info Screen)
 * - Coverage: none (only glow effect)
 * - Color: ice blue (#4da6ff)
 * - Animation: flowing light (wave, 3000ms) + inner glow (fade, 2000ms)
 * - Current message label (truncated to 12 chars)
 */
export default function InfoScreenLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);

  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '信息发布屏');
    return devices.map((d) => ({
      lng: d.coordinates[0],
      lat: d.coordinates[1],
      id: d.id,
      name: d.name,
      type: d.type,
      status: (d as any).status || 'normal',
      bearing: (d as any).bearing || 0,
      displayContent: (d as any).metadata?.displayContent ?? '',
      brightness: (d as any).metadata?.brightness ?? 80,
    }));
  }, []);

  // ── Extra dynamic layers: flowing light + inner glow + message label ──
  useEffect(() => {
    if (!scene || points.length === 0) {
      extraLayersRef.current.forEach((l) => {
        try { scene?.removeLayer(l); } catch { /* noop */ }
      });
      extraLayersRef.current = [];
      return;
    }

    const layers: ILayer[] = [];
    const data = points.map((pt) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(pt.lng, pt.lat);
      const label = pt.displayContent.length > 12 ? pt.displayContent.slice(0, 12) + '...' : pt.displayContent;
      return { ...pt, gcjLng, gcjLat, label };
    });
    const alertData = data.filter((d) => d.status === 'triggered' || d.status === 'abnormal');

    // 1) Static inner glow for normal screens.
    const glowLayer = new PointLayer({ zIndex: 5 })
      .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(20)
      .color('#4da6ff')
      .style({
        opacity: 0.12,
        strokeWidth: 2,
        stroke: '#4da6ff',
      });
    layers.push(glowLayer);

    // 2) Flowing light waves: only alerting screens animate.
    if (alertData.length > 0) {
      const flowSizes = [16, 24, 32];
      flowSizes.forEach((size, i) => {
        const flowLayer = new PointLayer({ zIndex: 5 })
          .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
          .shape('circle')
          .size(size)
          .color('#4da6ff')
          .style({
            opacity: 0.12 - i * 0.03,
            strokeWidth: 1.5,
            stroke: '#4da6ff',
          })
          .animate({
            enable: true,
            type: 'wave',
            duration: 3000,
            interval: 0.2 + i * 0.1,
          });
        layers.push(flowLayer);
      });
    }

    // 3) Current message label
    const labelData = data.filter((d) => d.displayContent);
    if (labelData.length > 0) {
      const labelLayer = new PointLayer({ zIndex: 31, depth: false })
        .source(labelData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('label', 'text')
        .size(10)
        .color('#4da6ff')
        .style({
          textAnchor: 'center',
          textOffset: [0, -20],
          fontFamily: 'Noto Sans SC, sans-serif',
          fontWeight: 600,
          textAllowOverlap: true,
          stroke: 'rgba(0,0,0,0.7)',
          strokeWidth: 2,
        });
      layers.push(labelLayer);
    }

    layers.forEach((l) => scene.addLayer(l));
    extraLayersRef.current = layers;

    return () => {
      extraLayersRef.current.forEach((l) => {
        try { scene.removeLayer(l); } catch { /* noop */ }
      });
      extraLayersRef.current = [];
    };
  }, [scene, points]);

  return (
    <>
      <DeviceIconLayer
        svgPath={infoScreenSvg}
        points={points}
        size={24}
        opacity={0.85}
        zIndex={8}
        entityType="info-screen"
        tooltipFormatter={(p) => `${p.name} | 信息发布屏\n当前内容: ${p.displayContent || '无'}\n亮度: ${p.brightness}%\n状态: ${p.status === 'offline' ? '离线' : '正常'}`}
      />
      <StatusAnimLayer
        points={points}
        animationType="breathing"
        colors={STATUS_COLORS}
        zIndex={6}
      />
    </>
  );
}
