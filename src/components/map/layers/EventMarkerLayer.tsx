import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';

// WGS84 coordinates
const EVENT_DATA = [
  { id: 'evt01', name: '交通事故', coordinates: [110.175, 20.312], severity: 'high', type: 'accident' },
  { id: 'evt02', name: '道路施工', coordinates: [110.185, 20.335], severity: 'medium', type: 'construction' },
  { id: 'evt03', name: '拥堵预警', coordinates: [110.162, 20.270], severity: 'low', type: 'warning' },
];

const SEVERITY_COLORS: Record<string, string> = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#4da6ff',
};

export default function EventMarkerLayer() {
  const scene = useMapScene();
  const layerRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const points = EVENT_DATA.map((evt) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(evt.coordinates[0], evt.coordinates[1]);
      return {
        ...evt,
        gcjLng,
        gcjLat,
        color: SEVERITY_COLORS[evt.severity],
      };
    });

    const layer = new PointLayer({ zIndex: 9 })
      .source(points, {
        parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' },
      })
      .shape('circle')
      .size(16)
      .color('color')
      .style({
        opacity: 0.9,
        strokeWidth: 2,
        stroke: '#fff',
      });

    layer.on('click', (e: any) => {
      const p = e.feature?.properties;
      if (p) {
        console.log('[EventMarkerLayer] clicked event:', p.id, p.name);
      }
    });

    scene.addLayer(layer);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [scene]);

  return null;
}
