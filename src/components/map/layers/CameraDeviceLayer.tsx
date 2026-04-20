import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import cameraData from '../../../data/geo/cameras.json';

const CAMERA_COLORS: Record<string, string> = {
  '电子警察': '#f87171',
  '违停抓拍': '#fbbf24',
  '治安监控': '#60a5fa',
  '治安卡口': '#4da6ff',
  '超速抓拍': '#a78bfa',
  '信号灯': '#34d399',
};

const STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  triggered: '触发',
  offline: '离线',
};

function showTooltip(x: number, y: number, text: string) {
  let el = document.getElementById('l7-map-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'l7-map-tooltip';
    el.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(6,13,26,0.92);border:1px solid rgba(77,166,255,0.3);border-radius:6px;padding:8px 12px;font:12px "Noto Sans SC",sans-serif;color:#c8dcff;line-height:1.5;backdrop-filter:blur(8px);max-width:220px;';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.display = 'block';
  el.style.left = x + 'px';
  el.style.top = (y - 70) + 'px';
}

function hideTooltip() {
  const el = document.getElementById('l7-map-tooltip');
  if (el) el.style.display = 'none';
}

export default function CameraDeviceLayer() {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);

  useEffect(() => {
    if (!scene) return;

    const points = (cameraData as any[]).map((d) => {
      const [lng, lat] = wgs84ToGcj02(d.coordinates[0], d.coordinates[1]);
      return {
        ...d,
        lng,
        lat,
        color: CAMERA_COLORS[d.type] || '#60a5fa',
      };
    });

    const groupedByType = points.reduce((acc, p) => {
      if (!acc[p.type]) acc[p.type] = [];
      acc[p.type].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(groupedByType).forEach(([type, data]) => {
      const color = CAMERA_COLORS[type] || '#60a5fa';

      const baseLayer = new PointLayer({ zIndex: 10 })
        .source(data, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle')
        .size(6)
        .color(color)
        .style({ opacity: 0.8 });

      const pulseLayer = new PointLayer({ zIndex: 9 })
        .source((data as any[]).filter((d: any) => d.status === 'normal'), {
          parser: { type: 'json', x: 'lng', y: 'lat' },
        })
        .shape('circle')
        .size(12)
        .color(color)
        .style({ opacity: 0.3 })
        .animate(true);

      baseLayer.on('mousemove', (e: any) => {
        const p = e.feature?.properties;
        if (!p) return;
        const statusLabel = STATUS_LABELS[p.status] || '未知';
        showTooltip(e.x, e.y, `${p.name} | ${p.type} | ${statusLabel}`);
      });
      baseLayer.on('mouseout', hideTooltip);

      scene.addLayer(pulseLayer);
      scene.addLayer(baseLayer);
      layersRef.current.push(pulseLayer, baseLayer);
    });

    return () => {
      layersRef.current.forEach((l) => scene.removeLayer(l));
      layersRef.current = [];
      hideTooltip();
    };
  }, [scene]);

  return null;
}
