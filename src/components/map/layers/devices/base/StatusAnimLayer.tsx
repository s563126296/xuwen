import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../../utils/coordTransform';

export interface StatusPoint {
  lng: number;
  lat: number;
  id: string;
  /** Device status: 'normal' | 'abnormal' | 'triggered' | 'offline' */
  status: string;
  [key: string]: unknown;
}

export interface StatusAnimLayerProps {
  /** Status point data (WGS84 coordinates) */
  points: StatusPoint[];
  /** Animation type */
  animationType?: 'breathing' | 'pulse' | 'scan' | 'flicker';
  /** Status color mapping */
  colors?: {
    normal?: string;
    abnormal?: string;
    triggered?: string;
    offline?: string;
  };
  /** Layer z-index */
  zIndex?: number;
}

const DEFAULT_COLORS = {
  normal: '#4da6ff',
  abnormal: '#f87171',
  triggered: '#fbbf24',
  offline: '#6b7280',
};

// ── Component ───────────────────────────────────────────────────────────

export default function StatusAnimLayer({
  points,
  animationType = 'breathing',
  colors = DEFAULT_COLORS,
  zIndex = 6,
}: StatusAnimLayerProps) {
  const scene = useMapScene();
  const layerRef = useRef<ILayer | null>(null);
  const colorSignature = JSON.stringify(colors);
  const effectiveColors = useMemo(
    () => ({ ...DEFAULT_COLORS, ...colors }),
    [colorSignature],
  );

  useEffect(() => {
    if (!scene || points.length === 0) {
      if (layerRef.current && scene) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    // Transform WGS84 → GCJ02 and map status → color
    const data = points.map((pt) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(pt.lng, pt.lat);
      const statusKey = pt.status as keyof typeof effectiveColors;
      const color = effectiveColors[statusKey] || effectiveColors.normal || DEFAULT_COLORS.normal;
      return { ...pt, gcjLng, gcjLat, color };
    });

    // Only alerting devices should pulse. Normal/offline points stay static in
    // their icon layers so the map does not look like it is refreshing.
    const prioritized = [...data].sort((a, b) => {
      const priority = { triggered: 3, abnormal: 2, normal: 1, offline: 0 };
      const aP = priority[a.status as keyof typeof priority] ?? 0;
      const bP = priority[b.status as keyof typeof priority] ?? 0;
      return bP - aP;
    });
    const activeData = prioritized
      .filter((point) => point.status === 'triggered' || point.status === 'abnormal')
      .slice(0, 10);

    if (activeData.length === 0) {
      return;
    }

    const layer = new PointLayer({ zIndex })
      .source(activeData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(18)
      .color('color')
      .style({
        opacity: 0.3,
        strokeWidth: 1.5,
        stroke: 'color',
      })
      .animate(getAnimationConfig(animationType));

    scene.addLayer(layer);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [scene, points, animationType, effectiveColors, zIndex]);

  return null;
}

// ── Animation configs ───────────────────────────────────────────────────

function getAnimationConfig(type: StatusAnimLayerProps['animationType']) {
  switch (type) {
    case 'breathing':
      return {
        enable: true,
        type: 'fade',
        duration: 3000,
        interval: 0.2,
      };

    case 'pulse':
      return {
        enable: true,
        type: 'grow',
        duration: 2000,
        interval: 0.3,
      };

    case 'scan':
      return {
        enable: true,
        type: 'wave',
        duration: 2500,
        interval: 0.25,
      };

    case 'flicker':
      return {
        enable: true,
        type: 'fade',
        duration: 800,
        interval: 0.1,
      };

    default:
      return { enable: true };
  }
}
