import { useEffect, useMemo, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { wgs84ToGcj02 } from '../../../../utils/coordTransform';
import cameraData from '../../../../data/geo/cameras.json';
import trafficLightSvg from './assets/traffic-light.svg';

const STATUS_COLORS = {
  normal: '#2ed573',
  abnormal: '#fbbf24',
  triggered: '#ff4757',
  offline: '#6b7280',
};

const TRAFFIC_LIGHT_BEARINGS = [0, 90, 180, 270];

/**
 * 信号灯图层 (Traffic Light)
 * - Coverage: 4 sectors (0deg, 90deg, 180deg, 270deg), 40m radius, 30deg angle
 * - Color: dynamic (red/yellow/green based on currentPhase)
 * - Animation: phase ring (fade, 2000ms) + countdown arc (grow, 1500ms)
 * - Remaining seconds label
 */
export default function TrafficLightLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);

  const points = useMemo(() => {
    const devices = cameraData.filter((d) => d.type === '信号灯');
    return devices.map((d) => ({
      lng: d.coordinates[0],
      lat: d.coordinates[1],
      id: d.id,
      name: d.name,
      type: d.type,
      status: (d as any).status || 'normal',
      bearing: (d as any).bearing || 0,
      cycleTime: (d as any).metadata?.cycleTime ?? 90,
      greenRatio: (d as any).metadata?.greenRatio ?? 0.45,
      currentPhase: (d as any).metadata?.currentPhase ?? 'green',
      remainingSeconds: (d as any).metadata?.remainingSeconds ?? 45,
    }));
  }, []);
  const coveragePointsByBearing = useMemo(
    () => TRAFFIC_LIGHT_BEARINGS.map((bearing) => ({
      bearing,
      points: points.map((p) => ({
        ...p,
        radius: 40,
        angle: 30,
        bearing,
      })),
    })),
    [points],
  );

  // ── Extra dynamic layers: phase ring + countdown arc + label ──
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
      const label = `${pt.remainingSeconds}s`;
      const phaseColor = pt.currentPhase === 'red' ? '#ff4757' : pt.currentPhase === 'yellow' ? '#fbbf24' : '#2ed573';
      return { ...pt, gcjLng, gcjLat, label, phaseColor };
    });
    const alertData = data.filter((d) => d.status === 'triggered' || d.status === 'abnormal');

    // 1) Phase ring / countdown arc: only alerting signals animate.
    if (alertData.length > 0) {
      const phaseRing = new PointLayer({ zIndex: 5 })
        .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('circle')
        .size(20)
        .color('phaseColor')
        .style({
          opacity: 0.15,
          strokeWidth: 2,
          stroke: 'phaseColor',
        })
        .animate({
          enable: true,
          type: 'fade',
          duration: 2000,
          interval: 0.2,
        });
      layers.push(phaseRing);

      const countdownArc = new PointLayer({ zIndex: 5 })
        .source(alertData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('circle')
        .size(28)
        .color('phaseColor')
        .style({
          opacity: 0.08,
          strokeWidth: 1.5,
          stroke: 'phaseColor',
        })
        .animate({
          enable: true,
          type: 'grow',
          duration: 1500,
          interval: 0.3,
        });
      layers.push(countdownArc);
    }

    // 2) Remaining seconds label
    const labelLayer = new PointLayer({ zIndex: 31, depth: false })
      .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('label', 'text')
      .size(10)
      .color('phaseColor')
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
      {/* 4 sectors for each traffic light (0deg, 90deg, 180deg, 270deg) */}
      {coveragePointsByBearing.map(({ bearing, points: coveragePoints }) => (
        <CoverageAreaLayer
          key={bearing}
          shapeType="sector"
          points={coveragePoints}
          fillColor={points.some((p) => p.currentPhase === 'red') ? 'rgba(255,71,87,0.08)' : points.some((p) => p.currentPhase === 'yellow') ? 'rgba(251,191,36,0.08)' : 'rgba(46,213,115,0.08)'}
          opacity={0.08}
          zIndex={4}
        />
      ))}
      <DeviceIconLayer
        svgPath={trafficLightSvg}
        points={points}
        size={24}
        opacity={0.85}
        zIndex={8}
        entityType="traffic-light"
        tooltipFormatter={(p) => `${p.name} | 信号灯\n当前相位: ${p.currentPhase === 'red' ? '红灯' : p.currentPhase === 'yellow' ? '黄灯' : '绿灯'} (${p.remainingSeconds}s)\n周期: ${p.cycleTime}s | 绿信比: ${((p.greenRatio as number) * 100).toFixed(0)}%\n状态: ${p.status === 'offline' ? '离线' : '正常'}`}
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
