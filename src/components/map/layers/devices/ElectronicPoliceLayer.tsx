import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../utils/coordTransform';
import cameraData from '../../../../data/geo/cameras.json';
import electronicPoliceSvg from './assets/electronic-police.svg';

const STATUS_COLORS = {
  normal: '#f87171',
  abnormal: '#dc2626',
  triggered: '#ef4444',
  offline: '#6b7280',
};

/**
 * 电子警察图层 (Electronic Police)
 * - Coverage: 60° sector, 100m radius
 * - Color: red (#f87171)
 * - Animation: radar scan (2.5s cycle)
 * - Violation count label
 */
export default function ElectronicPoliceLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);

  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '电子警察');
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
    ? 'rgba(248,113,113,0.12)'
    : 'rgba(248,113,113,0.06)';
  const coveragePoints = useMemo(
    () => points.map((p) => ({ ...p, radius: 100, angle: 60 })),
    [points],
  );

  // ── Extra dynamic layers: radar scan + violation label ──
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

    // 1) Radar scan rings: only alerting points animate.
    if (alertData.length > 0) {
      const scanSizes = [16, 24, 32];
      scanSizes.forEach((size, i) => {
        const scanLayer = new PointLayer({ zIndex: 5 })
          .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
          .shape('circle')
          .size(size)
          .color('#f87171')
          .style({
            opacity: 0.1 - i * 0.02,
            strokeWidth: 1.5,
            stroke: '#f87171',
          })
          .animate({
            enable: true,
            type: 'wave',
            duration: 2500,
            interval: 0.2 + i * 0.1,
          });
        layers.push(scanLayer);
      });
    }

    // 2) Violation count label
    const labelData = data.filter((d) => d.todayViolations > 0);
    if (labelData.length > 0) {
      const labelLayer = new PointLayer({ zIndex: 31, depth: false })
        .source(labelData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('label', 'text')
        .size(10)
        .color('#f87171')
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
        shapeType="sector"
        points={coveragePoints}
        fillColor={coverageColor}
        opacity={0.08}
        zIndex={4}
      />
      <DeviceIconLayer
        svgPath={electronicPoliceSvg}
        points={points}
        size={24}
        opacity={0.85}
        zIndex={8}
        entityType="electronic-police"
        tooltipFormatter={(p) => `${p.name} | 电子警察\n今日违法: ${p.todayViolations}件 | 累计: ${p.captureCount}次\n状态: ${p.status === 'triggered' ? '抓拍中' : p.status === 'offline' ? '离线' : '正常'}`}
      />
      <StatusAnimLayer
        points={points}
        animationType="scan"
        colors={STATUS_COLORS}
        zIndex={6}
      />
    </>
  );
}
