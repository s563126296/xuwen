import { useEffect, useRef } from 'react';
import { LineLayer, PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../map/MapSceneContext';
import { mapFeatureCollectionToGcj, mapRowsToGcj } from '../../../utils/coordTransform';
import roadsData from '../../../data/geo/roads.json';
import checkpointsData from '../../../data/geo/checkpoints.json';

const CONGESTION_COLORS = ['#2ED573', '#00D0E9', '#F5A623', '#FF4757', '#FF2D55'];
const FLOW_LEVEL_COLORS = ['#2ED573', '#F5A623', '#FF4757'];

// 港口核心坐标（徐闻港）
const PORT_CENTER = [110.134812, 20.232438];
const RADIUS_KM = 5;

// 判断路段是否在港口5km范围内
function isRoadNearPort(coords: [number, number][]): boolean {
  return coords.some(([lng, lat]) => {
    const dLat = (lat - PORT_CENTER[1]) * 111;
    const dLng = (lng - PORT_CENTER[0]) * 111 * Math.cos(PORT_CENTER[1] * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng) <= RADIUS_KM;
  });
}

function showTooltip(x: number, y: number, lines: string[]) {
  let el = document.getElementById('port-road-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'port-road-tooltip';
    el.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(6,13,26,0.94);border:1px solid rgba(0,208,233,0.3);border-radius:6px;padding:8px 12px;font:12px sans-serif;color:#c8dcff;line-height:1.6;backdrop-filter:blur(8px);';
    document.body.appendChild(el);
  }
  el.textContent = '';
  lines.forEach((line) => {
    const div = document.createElement('div');
    div.textContent = line;
    el!.appendChild(div);
  });
  el.style.display = 'block';
  el.style.left = x + 'px';
  el.style.top = (y - 80) + 'px';
}

function hideTooltip() {
  const el = document.getElementById('port-road-tooltip');
  if (el) el.style.display = 'none';
}

export default function PortRoadLayer() {
  const scene = useMapScene();
  const glowRef = useRef<ILayer | null>(null);
  const lineRef = useRef<ILayer | null>(null);
  const cpRef = useRef<ILayer | null>(null);
  const cpPulseRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    // 道路 GeoJSON — 只保留港口5km范围内路段
    const roadFeatures = (roadsData as any[])
      .filter((r) => isRoadNearPort(r.coordinates))
      .map((r) => ({
      type: 'Feature' as const,
      properties: {
        name: r.name,
        congestionLevel: r.congestionLevel ?? 1,
        color: CONGESTION_COLORS[r.congestionLevel ?? 1] || '#00D0E9',
      },
      geometry: { type: 'LineString' as const, coordinates: r.coordinates },
    }));
    const roadGeoJSON = { type: 'FeatureCollection' as const, features: roadFeatures };
    const gcjRoads = mapFeatureCollectionToGcj(roadGeoJSON);

    // 发光底层
    const glow = new LineLayer({ zIndex: 3 })
      .source(gcjRoads)
      .shape('line')
      .size(12)
      .color('color')
      .style({ opacity: 0.08 });

    // 主线
    const line = new LineLayer({ zIndex: 4 })
      .source(gcjRoads)
      .shape('line')
      .size(3)
      .color('color')
      .style({ opacity: 0.75 });

    line.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const levelText = ['畅通', '正常', '缓行', '拥堵', '严重拥堵'][p.congestionLevel] || '';
      showTooltip(e.x, e.y, [p.name, levelText]);
    });
    line.on('mouseout', hideTooltip);

    // 检查站
    const cpRows = (checkpointsData as any[]).map((cp) => ({
      lng: cp.coordinates[0], lat: cp.coordinates[1],
      name: cp.name, flowCount: cp.flowCount, flowLevel: cp.flowLevel,
      color: FLOW_LEVEL_COLORS[cp.flowLevel] || '#00D0E9',
    }));
    const gcjCp = mapRowsToGcj(cpRows);

    const cpPulse = new PointLayer({ zIndex: 5 })
      .source(gcjCp, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle').size(20).color('color').style({ opacity: 0.15 }).animate(true);

    const cp = new PointLayer({ zIndex: 6 })
      .source(gcjCp, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('diamond').size(8).color('color').style({ opacity: 0.9, strokeWidth: 1, stroke: '#fff' });

    cp.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      showTooltip(e.x, e.y, [p.name, `车流量 ${p.flowCount} 辆/时`]);
    });
    cp.on('mouseout', hideTooltip);

    scene.addLayer(glow);
    scene.addLayer(line);
    scene.addLayer(cpPulse);
    scene.addLayer(cp);
    glowRef.current = glow;
    lineRef.current = line;
    cpPulseRef.current = cpPulse;
    cpRef.current = cp;

    return () => {
      [glowRef, lineRef, cpPulseRef, cpRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
      hideTooltip();
    };
  }, [scene]);

  return null;
}
