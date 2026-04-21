import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../utils/coordTransform';
import cameraData from '../../../../data/geo/cameras.json';
import checkpointGateSvg from './assets/checkpoint-gate.svg';

const STATUS_COLORS = {
  normal: '#2ed573',
  abnormal: '#fbbf24',
  triggered: '#ff4757',
  offline: '#6b7280',
};

/**
 * 治安卡口图层 (Checkpoint Gate)
 * - Coverage: rect, 60m radius
 * - Color: dynamic (green/yellow/red based on flowLevel)
 * - Animation: horizontal scan (wave, duration varies by flowLevel)
 * - Flow count label
 */
export default function CheckpointGateLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);

  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '治安卡口');
    return devices.map((d) => ({
      lng: d.coordinates[0],
      lat: d.coordinates[1],
      id: d.id,
      name: d.name,
      type: d.type,
      status: (d as any).status || 'normal',
      bearing: (d as any).bearing || 0,
      flowCount: (d as any).metadata?.flowCount ?? 0,
      flowLevel: (d as any).metadata?.flowLevel ?? 0,
    }));
  }, []);
  const coveragePoints = useMemo(
    () => points.map((p) => ({ ...p, radius: 60 })),
    [points],
  );

  // ── Extra dynamic layers: horizontal scan + flow count label ──
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
      const label = `${pt.flowCount}辆/h`;
      const flowColor = pt.flowLevel === 2 ? '#ff4757' : pt.flowLevel === 1 ? '#fbbf24' : '#2ed573';
      const scanDuration = pt.flowLevel === 2 ? 1500 : pt.flowLevel === 1 ? 2000 : 2500;
      return { ...pt, gcjLng, gcjLat, label, flowColor, scanDuration };
    });
    const alertData = data.filter((d) => d.status === 'triggered' || d.status === 'abnormal' || d.flowLevel === 2);

    // 1) Horizontal scan waves: only congested or alerting gates animate.
    if (alertData.length > 0) {
      const scanSizes = [18, 28, 38];
      scanSizes.forEach((size, i) => {
        const scanLayer = new PointLayer({ zIndex: 5 })
          .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
          .shape('circle')
          .size(size)
          .color('flowColor')
          .style({
            opacity: 0.1 - i * 0.02,
            strokeWidth: 1.5,
            stroke: 'flowColor',
          })
          .animate({
            enable: true,
            type: 'wave',
            duration: 2000,
            interval: 0.2 + i * 0.1,
          });
        layers.push(scanLayer);
      });
    }

    // 2) Flow count label
    const labelLayer = new PointLayer({ zIndex: 31, depth: false })
      .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('label', 'text')
      .size(10)
      .color('flowColor')
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

    layers.forEach((l) => scene.addLayer(l));
    extraLayersRef.current = layers;

    return () => {
      extraLayersRef.current.forEach((l) => {
        try { scene.removeLayer(l); } catch { /* noop */ }
      });
      extraLayersRef.current = [];
    };
  }, [scene, points]);

  return (
    <>
      <CoverageAreaLayer
        shapeType="rect"
        points={coveragePoints}
        fillColor={points.some((p) => p.flowLevel === 2) ? 'rgba(255,71,87,0.08)' : points.some((p) => p.flowLevel === 1) ? 'rgba(251,191,36,0.08)' : 'rgba(46,213,115,0.08)'}
        opacity={0.08}
        zIndex={4}
      />
      <DeviceIconLayer
        svgPath={checkpointGateSvg}
        points={points}
        size={24}
        opacity={0.85}
        zIndex={8}
        entityType="checkpoint-gate"
        tooltipFormatter={(p) => `${p.name} | 治安卡口\n车流量: ${p.flowCount}辆/h\n拥堵等级: ${p.flowLevel === 2 ? '拥堵' : p.flowLevel === 1 ? '缓行' : '畅通'}\n状态: ${p.status === 'triggered' ? '告警' : p.status === 'offline' ? '离线' : '正常'}`}
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
