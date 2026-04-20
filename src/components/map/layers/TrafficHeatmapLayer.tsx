import { useEffect, useRef } from 'react';
import { HeatmapLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import heatData from '../../../data/geo/heatmapPoints.json';

export default function TrafficHeatmapLayer() {
  const scene = useMapScene();
  const layerRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const points = (heatData as any[]).map((h) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(h.lng, h.lat);
      return { lng: gcjLng, lat: gcjLat, flow: h.flowHph };
    });

    const layer = new HeatmapLayer({ zIndex: 1 })
      .source(points, {
        parser: { type: 'json', x: 'lng', y: 'lat' },
      })
      .shape('heatmap')
      .size('flow', [0, 1])
      .style({
        intensity: 2,
        radius: 20,
        opacity: 0.3,
        rampColors: {
          colors: ['#34d399', '#fbbf24', '#fb923c', '#f87171'],
          positions: [0, 0.33, 0.66, 1],
        },
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
