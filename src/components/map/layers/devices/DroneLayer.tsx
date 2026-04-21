import { useEffect, useMemo, useRef } from 'react';
import { LineLayer, PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import DeviceIconLayer from './base/DeviceIconLayer';
import CoverageAreaLayer from './base/CoverageAreaLayer';
import StatusAnimLayer from './base/StatusAnimLayer';
import { useMapScene } from '../../MapSceneContext';
import { mapFeatureCollectionToGcj, mapRowsToGcj, wgs84ToGcj02 } from '../../../../utils/coordTransform';
import droneRoutes from '../../../../data/geo/droneRoutes.json';
import droneSvg from './assets/drone.svg';

type LngLat = [number, number];
type DroneRoute = (typeof droneRoutes)[number];

const FALLBACK_ROUTE_COLORS = ['#00D0E9', '#2ED573', '#F5A623'];
const STATUS_COLORS = {
  normal: '#34d399',
  abnormal: '#10b981',
  triggered: '#059669',
  offline: '#6b7280',
};

function getRouteColor(route: DroneRoute, index: number) {
  return route.color || FALLBACK_ROUTE_COLORS[index % FALLBACK_ROUTE_COLORS.length];
}

function distanceMeters(a: LngLat, b: LngLat) {
  const lat = ((a[1] + b[1]) / 2) * Math.PI / 180;
  const dx = (b[0] - a[0]) * Math.cos(lat) * 111320;
  const dy = (b[1] - a[1]) * 110540;
  return Math.hypot(dx, dy);
}

function interpolateRoute(coordinates: number[][], progress: number): LngLat {
  const points = coordinates as LngLat[];
  if (points.length <= 1) return points[0] || [110.15, 20.28];

  const segmentLengths = points.slice(0, -1).map((point, index) => distanceMeters(point, points[index + 1]));
  const total = segmentLengths.reduce((sum, length) => sum + length, 0);
  let target = (progress % 1) * total;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (target <= length) {
      const ratio = length === 0 ? 0 : target / length;
      const start = points[index];
      const end = points[index + 1];
      return [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
      ];
    }
    target -= length;
  }

  return points[points.length - 1];
}

function setLayerData(layer: ILayer, data: unknown[]) {
  const mutableLayer = layer as unknown as {
    setData?: (nextData: unknown[], options: unknown) => void;
    source?: (nextData: unknown[], options: unknown) => void;
  };
  const parser = { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } };
  if (typeof mutableLayer.setData === 'function') {
    mutableLayer.setData(data, parser);
  } else if (typeof mutableLayer.source === 'function') {
    mutableLayer.source(data, parser);
  }
}

/**
 * 无人机图层 (Drone)
 * - Data source: droneRoutes.json (extract current position from coordinates[0])
 * - Coverage: circle, 200m radius
 * - Color: green (#34d399)
 * - Animation: patrol pulse (grow, 2500ms)
 * - Altitude label
 */
export default function DroneLayer() {
  const scene = useMapScene();
  const extraLayersRef = useRef<ILayer[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Extract airport position from the first coordinate of each route.
  const points = useMemo(() => droneRoutes.map((route, index) => ({
    lng: route.coordinates[0][0],
    lat: route.coordinates[0][1],
    id: route.id,
    name: route.name,
    type: '无人机',
    status: 'normal' as const,
    bearing: 0,
    baseName: route.baseName,
    mission: route.mission,
    altitude: route.altitude ?? 120,
    speed: route.speed ?? 35,
    battery: route.battery ?? 85,
    color: getRouteColor(route, index),
    waypointCount: route.coordinates.length,
  })), []);
  const coveragePoints = useMemo(
    () => points.map((p) => ({ ...p, radius: 200 })),
    [points],
  );

  // ── Extra dynamic layers: patrol pulse + altitude label ──
  useEffect(() => {
    if (!scene || points.length === 0) {
      extraLayersRef.current.forEach((l) => {
        try { scene?.removeLayer(l); } catch { /* noop */ }
      });
      extraLayersRef.current = [];
      return;
    }

    const layers: ILayer[] = [];
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const routeSource = {
      type: 'FeatureCollection' as const,
      features: droneRoutes.map((route, index) => ({
        type: 'Feature' as const,
        properties: {
          id: route.id,
          name: route.name,
          baseName: route.baseName,
          mission: route.mission,
          color: getRouteColor(route, index),
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: route.coordinates,
        },
      })),
    };
    const gcjRouteSource = mapFeatureCollectionToGcj(routeSource);

    const routeGlowLayer = new LineLayer({ zIndex: 7, depth: false })
      .source(gcjRouteSource as any)
      .shape('line')
      .size(18)
      .color('color')
      .style({ opacity: 0.08, lineJoin: 'round', lineCap: 'round' });
    layers.push(routeGlowLayer);

    const routeLineLayer = new LineLayer({ zIndex: 8, depth: false })
      .source(gcjRouteSource as any)
      .shape('line')
      .size(4)
      .color('color')
      .style({
        opacity: 0.88,
        lineType: 'dash',
        dashArray: [2, 14],
        lineJoin: 'round',
        lineCap: 'round',
      });
    layers.push(routeLineLayer);

    const routeFlowLayer = new LineLayer({ zIndex: 9, depth: false })
      .source(gcjRouteSource as any)
      .shape('line')
      .size(1.6)
      .color('color')
      .style({ opacity: 0.72, lineJoin: 'round', lineCap: 'round' })
      .animate({
        interval: 0.9,
        trailLength: 0.7,
        duration: 4.8,
      });
    layers.push(routeFlowLayer);

    const waypointData = mapRowsToGcj(droneRoutes.flatMap((route, routeIndex) => (
      route.coordinates.slice(0, -1).map((coord, pointIndex) => ({
        lng: coord[0],
        lat: coord[1],
        color: getRouteColor(route, routeIndex),
        size: pointIndex === 0 ? 5 : 3,
      }))
    )));

    const waypointLayer = new PointLayer({ zIndex: 10, depth: false })
      .source(waypointData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size('size')
      .color('color')
      .style({
        opacity: 0.7,
        stroke: '#0A0F19',
        strokeWidth: 1,
      });
    layers.push(waypointLayer);

    const airportData = mapRowsToGcj(points.map((point) => ({
      lng: point.lng,
      lat: point.lat,
      name: point.baseName,
      routeName: point.name,
      color: point.color,
      label: point.baseName.replace('无人机机场', '机场'),
    })));

    const airportHaloLayer = new PointLayer({ zIndex: 30, depth: false })
      .source(airportData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size(34)
      .color('color')
      .style({ opacity: 0.16, strokeWidth: 1, stroke: 'color' })
      .animate({
        enable: true,
        type: 'wave',
        duration: 2600,
        interval: 0.2,
      });
    layers.push(airportHaloLayer);

    const airportCoreLayer = new PointLayer({ zIndex: 31, depth: false })
      .source(airportData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('square')
      .size(12)
      .color('color')
      .style({ opacity: 0.95, stroke: '#ffffff', strokeWidth: 1.5 });
    layers.push(airportCoreLayer);

    const getFlyingData = (startedAt: number) => {
      const elapsed = performance.now() - startedAt;
      return droneRoutes.map((route, index) => {
        const duration = route.id === 'uav-1' ? 20000 : 36000;
        const progress = ((elapsed / duration) + index * 0.18) % 1;
        const [lng, lat] = interpolateRoute(route.coordinates, progress);
        const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat);
        return {
          id: `${route.id}-flying`,
          name: route.name,
          gcjLng,
          gcjLat,
          color: getRouteColor(route, index),
        };
      });
    };

    const startedAt = performance.now();
    const initialFlyingData = getFlyingData(startedAt);

    const flyingHaloLayer = new PointLayer({ zIndex: 37, depth: false })
      .source(initialFlyingData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(26)
      .color('color')
      .style({ opacity: 0.18, strokeWidth: 1.5, stroke: 'color' })
      .animate({
        enable: true,
        type: 'grow',
        duration: 1800,
        interval: 0.1,
      });
    layers.push(flyingHaloLayer);

    const flyingPointLayer = new PointLayer({ zIndex: 38, depth: false })
      .source(initialFlyingData, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('triangle')
      .size(14)
      .color('color')
      .style({ opacity: 0.98, stroke: '#ffffff', strokeWidth: 1.5 });
    layers.push(flyingPointLayer);

    const data = points.map((pt) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(pt.lng, pt.lat);
      return { ...pt, gcjLng, gcjLat };
    });

    // 1) Patrol pulse rings (grow animation)
    const pulseSizes = [18, 30, 42];
    pulseSizes.forEach((size, i) => {
      const pulseLayer = new PointLayer({ zIndex: 5 })
        .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('circle')
        .size(size)
        .color('#34d399')
        .style({
          opacity: 0.12 - i * 0.03,
          strokeWidth: 1.5,
          stroke: '#34d399',
        })
        .animate({
          enable: true,
          type: 'grow',
          duration: 2500,
          interval: 0.2 + i * 0.15,
        });
      layers.push(pulseLayer);
    });

    layers.forEach((l) => scene.addLayer(l));
    extraLayersRef.current = layers;

    const tick = () => {
      const nextFlyingData = getFlyingData(startedAt);
      setLayerData(flyingHaloLayer, nextFlyingData);
      setLayerData(flyingPointLayer, nextFlyingData);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      extraLayersRef.current.forEach((l) => {
        try { scene.removeLayer(l); } catch { /* noop */ }
      });
      extraLayersRef.current = [];
    };
  }, [scene, points]);

  return (
    <>
      <CoverageAreaLayer
        shapeType="circle"
        points={coveragePoints}
        fillColor="rgba(52,211,153,0.06)"
        opacity={0.08}
        zIndex={4}
      />
      <DeviceIconLayer
        svgPath={droneSvg}
        points={points}
        size={28}
        opacity={0.9}
        zIndex={8}
        entityType="drone"
        tooltipFormatter={(p) => `${p.name} | 无人机\n机场: ${p.baseName}\n任务: ${p.mission}\n高度: ${p.altitude}m | 速度: ${p.speed}km/h\n电量: ${p.battery}% | 航点: ${p.waypointCount}个\n状态: 巡航中`}
      />
      <StatusAnimLayer
        points={points}
        animationType="pulse"
        colors={STATUS_COLORS}
        zIndex={6}
      />
    </>
  );
}
