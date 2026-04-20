import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import checkpointData from '../../../data/geo/checkpoints.json';

const CHECKPOINT_COLOR = '#4da6ff';

const TYPE_LABELS: Record<string, string> = {
  entrance: '入口',
  internal: '内部',
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

export default function CheckpointDeviceLayer() {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);

  useEffect(() => {
    if (!scene) return;

    const points = (checkpointData as any[]).map((d) => {
      const [lng, lat] = wgs84ToGcj02(d.coordinates[0], d.coordinates[1]);
      return { ...d, lng, lat };
    });

    const baseLayer = new PointLayer({ zIndex: 10 })
      .source(points, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size(7)
      .color(CHECKPOINT_COLOR)
      .style({ opacity: 0.85 });

    const pulseLayer = new PointLayer({ zIndex: 9 })
      .source(points, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size(14)
      .color(CHECKPOINT_COLOR)
      .style({ opacity: 0.3 })
      .animate(true);

    baseLayer.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const typeLabel = TYPE_LABELS[p.type] || p.type;
      showTooltip(e.x, e.y, `${p.name} | ${typeLabel} | ${p.flowCount}辆/h`);
    });
    baseLayer.on('mouseout', hideTooltip);

    scene.addLayer(pulseLayer);
    scene.addLayer(baseLayer);
    layersRef.current.push(pulseLayer, baseLayer);

    return () => {
      layersRef.current.forEach((l) => scene.removeLayer(l));
      layersRef.current = [];
      hideTooltip();
    };
  }, [scene]);

  return null;
}
