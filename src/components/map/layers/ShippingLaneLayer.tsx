import { useEffect, useRef } from 'react';
import { LineLayer, PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { mapFeatureCollectionToGcj, mapRowsToGcj } from '../../../utils/coordTransform';
import laneData from '../../../data/geo/lanes.json';

const LANE_COLORS: Record<string, string> = {
  primary: '#4da6ff',
  secondary: '#a78bfa',
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

export default function ShippingLaneLayer() {
  const scene = useMapScene();
  const glowRef = useRef<ILayer | null>(null);
  const lineRef = useRef<ILayer | null>(null);
  const flowRef = useRef<ILayer | null>(null);
  const labelRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const wgsSource = {
      type: 'FeatureCollection' as const,
      features: (laneData as any[]).map((lane) => ({
        type: 'Feature' as const,
        properties: {
          id: lane.id,
          name: lane.name,
          routeType: lane.type,
          frequency: lane.frequency || 30,
          color: LANE_COLORS[lane.type] || '#a78bfa',
        },
        geometry: { type: 'LineString' as const, coordinates: lane.coordinates },
      })),
    };

    const gcjSource = mapFeatureCollectionToGcj(wgsSource);

    // Layer 1: Glow base
    const glow = new LineLayer({ zIndex: 1 })
      .source(gcjSource as any)
      .shape('line')
      .size('frequency', [8, 14])
      .color('color')
      .style({ opacity: 0.08 });

    // Layer 2: Shipping lane main dashed line
    const line = new LineLayer({ zIndex: 2 })
      .source(gcjSource as any)
      .shape('line')
      .size('frequency', [1.5, 3])
      .color('color')
      .style({
        opacity: 0.7,
        lineType: 'dash',
        dashArray: [12, 6],
      });

    // Layer 3: Flow particles - animate along lane direction
    const flow = new LineLayer({ zIndex: 3 })
      .source(gcjSource as any)
      .shape('line')
      .size('frequency', [1, 2.5])
      .color('color')
      .style({ opacity: 0.35 })
      .animate({
        interval: 0.8,
        trailLength: 1.5,
        duration: 3,
      });

    // Layer 4: Lane name labels
    const labelPoints = (laneData as any[]).map((lane) => {
      const mid = Math.floor(lane.coordinates.length / 2);
      return {
        lng: lane.coordinates[mid][0],
        lat: lane.coordinates[mid][1],
        name: lane.name,
        frequency: lane.frequency || 30,
        color: LANE_COLORS[lane.type] || '#a78bfa',
      };
    });

    const gcjLabelPts = mapRowsToGcj(labelPoints);

    const labelLayer = new PointLayer({ zIndex: 14 })
      .source(gcjLabelPts, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('name', 'text')
      .size(10)
      .color('color')
      .style({
        textAnchor: 'center',
        textOffset: [0, -10],
        fontFamily: 'Noto Sans SC',
        fontWeight: 400,
        stroke: '#060d1a',
        strokeWidth: 2,
        opacity: 0.5,
      });

    line.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      showTooltip(e.x, e.y, `${p.name} | 日均${p.frequency}班次`);
    });
    line.on('mouseout', hideTooltip);

    scene.addLayer(glow);
    scene.addLayer(line);
    scene.addLayer(flow);
    scene.addLayer(labelLayer);
    glowRef.current = glow;
    lineRef.current = line;
    flowRef.current = flow;
    labelRef.current = labelLayer;

    return () => {
      [glowRef, lineRef, flowRef, labelRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
      hideTooltip();
    };
  }, [scene]);

  return null;
}
