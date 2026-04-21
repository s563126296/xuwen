import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../utils/coordTransform';
import cameraData from '../../../../data/geo/cameras.json';
import parkingViolationSvg from './assets/parking-violation.svg';

const STATUS_COLORS = {
  normal: '#fbbf24',
  abnormal: '#f59e0b',
  triggered: '#d97706',
  offline: '#6b7280',
};

/**
 * 违停抓拍图层 (Parking Violation)
 * - Coverage: circle, 50m radius
 * - Color: amber yellow (#fbbf24)
 * - Animation: boundary breathing (fade, 3000ms)
 * - Violation count label
 */
export default function ParkingViolationLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);

  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '违停抓拍');
    return devices.map((d) => ({
      lng: d.coordinates[0],
      lat: d.coordinates[1],
      id: d.id,
      name: d.name,
      type: d.type,
      status: (d as any).status || 'normal',
      bearing: (d as any).bearing || 0,
      todayViolations: (d as any).metadata?.todayViolations ?? 0,
      captureCount: (d as any).metadata?.captureCount ?? 0,
    }));
  }, []);

  const hasTriggered = points.some((p) => p.status === 'triggered');
  const coverageColor = hasTriggered
    ? 'rgba(251,191,36,0.12)'
    : 'rgba(251,191,36,0.06)';
  const coveragePoints = useMemo(
    () => points.map((p) => ({ ...p, radius: 50 })),
    [points],
  );

  // ── Extra dynamic layers: boundary breathing + violation label ──
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
      const label = `${pt.todayViolations}`;
      return { ...pt, gcjLng, gcjLat, label };
    });
    const alertData = data.filter((d) => d.status === 'triggered' || d.status === 'abnormal');

    // 1) Boundary breathing rings: only alerting points animate.
    if (alertData.length > 0) {
      const breathSizes = [14, 22, 30];
      breathSizes.forEach((size, i) => {
        const breathLayer = new PointLayer({ zIndex: 5 })
          .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
          .shape('circle')
          .size(size)
          .color('#fbbf24')
          .style({
            opacity: 0.1 - i * 0.02,
            strokeWidth: 1.5,
            stroke: '#fbbf24',
          })
          .animate({
            enable: true,
            type: 'fade',
            duration: 3000,
            interval: 0.2 + i * 0.1,
          });
        layers.push(breathLayer);
      });
    }

    // 2) Violation count label
    const labelData = data.filter((d) => d.todayViolations > 0);
    if (labelData.length > 0) {
      const labelLayer = new PointLayer({ zIndex: 31, depth: false })
        .source(labelData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('label', 'text')
        .size(10)
        .color('#fbbf24')
        .style({
          textAnchor: 'center',
          textOffset: [0, -20],
          fontFamily: 'JetBrains Mono, monospace',
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
  }, [scene, points, hasTriggered]);

  return (
    <>
      <CoverageAreaLayer
        shapeType="circle"
        points={coveragePoints}
        fillColor={coverageColor}
        opacity={0.08}
        zIndex={4}
      />
      <DeviceIconLayer
        svgPath={parkingViolationSvg}
        points={points}
        size={24}
        opacity={0.85}
        zIndex={8}
        entityType="parking-violation"
        tooltipFormatter={(p) => `${p.name} | 违停抓拍\n今日违停: ${p.todayViolations}件 | 累计: ${p.captureCount}次\n状态: ${p.status === 'triggered' ? '抓拍中' : p.status === 'offline' ? '离线' : '正常'}`}
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
