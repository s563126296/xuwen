import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import vesselData from '../../../data/geo/vessels.json';

const STATUS_CONFIG: Record<string, { color: string; shape: string; size: number; label: string }> = {
  sailing:  { color: '#4da6ff', shape: 'triangle', size: 10, label: '航行' },
  docked:   { color: '#34d399', shape: 'square',   size: 8,  label: '靠泊' },
  anchored: { color: '#fbbf24', shape: 'diamond',  size: 9,  label: '锚泊' },
};

function showTooltip(x: number, y: number, text: string) {
  let el = document.getElementById('l7-map-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'l7-map-tooltip';
    el.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(6,13,26,0.94);border:1px solid rgba(77,166,255,0.3);border-radius:6px;padding:8px 12px;font:12px "Noto Sans SC",sans-serif;color:#c8dcff;line-height:1.5;backdrop-filter:blur(8px);max-width:220px;';
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

export default function VesselLayer() {
  const scene = useMapScene();
  const layerRef = useRef<ILayer | null>(null);
  const pulseRef = useRef<ILayer | null>(null);
  const wakeRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const points = (vesselData as any[]).map((v) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(v.coordinates[0], v.coordinates[1]);
      const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.sailing;
      return {
        gcjLng,
        gcjLat,
        name: v.name,
        status: v.status,
        statusLabel: cfg.label,
        color: cfg.color,
        speed: v.speed,
        destination: v.destination,
      };
    });

    // Layer 1: Sailing vessel wake glow
    const sailingPoints = points.filter((p) => p.status === 'sailing');
    const wake = new PointLayer({ zIndex: 6 })
      .source(sailingPoints, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(28)
      .color('#4da6ff')
      .style({ opacity: 0.12 })
      .animate(true);

    // Layer 2: All vessels pulse ring
    const pulse = new PointLayer({ zIndex: 7 })
      .source(points, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(16)
      .color('color')
      .style({ opacity: 0.2 })
      .animate(true);

    // Layer 3: Vessel main body - uniform triangle, colored by status
    const layer = new PointLayer({ zIndex: 8 })
      .source(points, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('triangle')
      .size(10)
      .color('color')
      .style({ opacity: 0.9, strokeWidth: 1.5, stroke: '#fff' });

    layer.on('click', (e: any) => {
      const p = e.feature?.properties;
      if (p) {
        console.log('[VesselLayer] clicked vessel:', p.name);
      }
    });
    layer.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const info = `${p.name} | ${p.statusLabel}`;
      const extra = p.speed ? ` | ${p.speed}kn` : '';
      const dest = p.destination ? ` → ${p.destination}` : '';
      showTooltip(e.x, e.y, info + extra + dest);
    });
    layer.on('mouseout', hideTooltip);

    scene.addLayer(wake);
    scene.addLayer(pulse);
    scene.addLayer(layer);
    wakeRef.current = wake;
    pulseRef.current = pulse;
    layerRef.current = layer;

    return () => {
      [layerRef, pulseRef, wakeRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
    };
  }, [scene]);

  return null;
}
