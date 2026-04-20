import { useEffect, useRef } from 'react';
import { LineLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { mapFeatureCollectionToGcj } from '../../../utils/coordTransform';
import roadData from '../../../data/geo/roads.json';

const CONGESTION_COLORS: Record<number, string> = {
  0: '#34d399',
  1: '#fbbf24',
  2: '#fb923c',
  3: '#f87171',
};

const CONGESTION_LABELS: Record<number, string> = {
  0: '畅通',
  1: '缓行',
  2: '拥堵',
  3: '严重',
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

export default function RoadCongestionLayer() {
  const scene = useMapScene();
  const glowRef = useRef<ILayer | null>(null);
  const lineRef = useRef<ILayer | null>(null);
  const flowRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const wgsSource = {
      type: 'FeatureCollection' as const,
      features: (roadData as any[]).map((road) => ({
        type: 'Feature' as const,
        properties: {
          id: road.id,
          name: road.name,
          congestionLevel: road.congestionLevel,
          speedKmh: road.speedKmh,
          flowHph: road.flowHph,
          color: CONGESTION_COLORS[road.congestionLevel] || '#34d399',
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: road.coordinates,
        },
      })),
    };

    const gcjSource = mapFeatureCollectionToGcj(wgsSource);
    const lineWidth = 3;

    // Layer 1: Glow base - wide line, low opacity
    const glow = new LineLayer({ zIndex: 4 })
      .source(gcjSource as any)
      .shape('line')
      .size(lineWidth + 4)
      .color('color')
      .style({ opacity: 0.12 });

    // Layer 2: Road main body
    const line = new LineLayer({ zIndex: 5 })
      .source(gcjSource as any)
      .shape('line')
      .size(lineWidth)
      .color('color')
      .style({
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      });

    // Layer 3: Flow particles - animate along road direction
    const flow = new LineLayer({ zIndex: 6 })
      .source(gcjSource as any)
      .shape('line')
      .size(lineWidth - 1)
      .color('color')
      .style({
        opacity: 0.4,
        lineJoin: 'round',
        lineCap: 'round',
      })
      .animate({
        interval: 0.6,
        trailLength: 1.2,
        duration: 2,
      });

    line.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const status = CONGESTION_LABELS[p.congestionLevel] || '畅通';
      showTooltip(e.x, e.y, `${p.name} | ${status} | ${p.flowHph}辆/h | ${p.speedKmh}km/h`);
    });
    line.on('mouseout', hideTooltip);

    scene.addLayer(glow);
    scene.addLayer(line);
    scene.addLayer(flow);
    glowRef.current = glow;
    lineRef.current = line;
    flowRef.current = flow;

    return () => {
      [glowRef, lineRef, flowRef].forEach((ref) => {
        if (ref.current) {
          scene.removeLayer(ref.current);
          ref.current = null;
        }
      });
      hideTooltip();
    };
  }, [scene]);

  return null;
}
