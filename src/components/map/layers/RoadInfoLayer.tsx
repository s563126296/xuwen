import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { mapRowsToGcj } from '../../../utils/coordTransform';
import roadData from '../../../data/geo/roads.json';
import labels from '../../../data/geo/labels.json';

/**
 * 入港道路名称 + 路口信息图层
 * - 主要入港道路名称标签
 * - 路口节点标记（道路交汇点）
 */

// 主要入港道路
const MAIN_ROADS = ['沈海高速', '207国道', '省道376', '进港大道', '木兰大道', '徐闻北港公路'];

export default function RoadInfoLayer() {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);

  useEffect(() => {
    if (!scene) return;

    const layers: ILayer[] = [];

    // ── 1. 道路名称标签（从 labels.json 中取 road 类别 + 补充主要道路） ──
    const roadLabels = labels.filter((l) => l.category === 'road');

    // 补充 labels.json 中没有的主要道路名称（取每条路的中点坐标）
    const existingNames = new Set(roadLabels.map((l) => l.name));
    const mainRoads = (roadData as any[]).filter((r) => MAIN_ROADS.includes(r.name));
    const roadsByName = new Map<string, any[]>();
    mainRoads.forEach((r) => {
      if (!roadsByName.has(r.name)) roadsByName.set(r.name, []);
      roadsByName.get(r.name)!.push(r);
    });

    const supplementLabels: { name: string; lng: number; lat: number; size: number; level: number }[] = [];
    roadsByName.forEach((segments, name) => {
      if (existingNames.has(name)) return;
      // Pick the longest segment's midpoint
      const longest = segments.reduce((a: any, b: any) =>
        a.coordinates.length > b.coordinates.length ? a : b
      );
      const mid = Math.floor(longest.coordinates.length / 2);
      supplementLabels.push({
        name,
        lng: longest.coordinates[mid][0],
        lat: longest.coordinates[mid][1],
        size: 10,
        level: 2,
      });
    });

    const allRoadLabels = [...roadLabels, ...supplementLabels];
    const gcjRoadLabels = mapRowsToGcj(allRoadLabels);

    const roadNameLayer = new PointLayer({ zIndex: 33, depth: false })
      .source(gcjRoadLabels, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('name', 'text')
      .size('size')
      .color('#8ec8ff')
      .style({
        textAnchor: 'center',
        textOffset: [0, 0],
        fontFamily: 'Noto Sans SC',
        fontWeight: 500,
        stroke: '#060d1a',
        strokeWidth: 2.5,
        opacity: 0.75,
        textAllowOverlap: false,
      });
    layers.push(roadNameLayer);

    // ── 2. 路口节点标记（主要道路交汇点） ──
    const intersections = findIntersections(mainRoads);
    const gcjIntersections = mapRowsToGcj(intersections);

    if (gcjIntersections.length > 0) {
      // 路口脉冲圈
      const pulseLayer = new PointLayer({ zIndex: 18 })
        .source(gcjIntersections, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle')
        .size(10)
        .color('#00D0E9')
        .style({ opacity: 0.2, strokeWidth: 1, stroke: '#00D0E9' })
        .animate(true);
      layers.push(pulseLayer);

      // 路口实心点
      const dotLayer = new PointLayer({ zIndex: 19 })
        .source(gcjIntersections, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle')
        .size(4)
        .color('#00D0E9')
        .style({ opacity: 0.9 });
      layers.push(dotLayer);

      // 路口名称标签
      const labelLayer = new PointLayer({ zIndex: 34, depth: false })
        .source(gcjIntersections, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('name', 'text')
        .size(9)
        .color('#00D0E9')
        .style({
          textAnchor: 'left',
          textOffset: [8, 0],
          fontFamily: 'Noto Sans SC',
          fontWeight: 400,
          stroke: '#060d1a',
          strokeWidth: 2,
          opacity: 0.8,
          textAllowOverlap: false,
        });
      layers.push(labelLayer);
    }

    layers.forEach((l) => scene.addLayer(l));
    layersRef.current = layers;

    return () => {
      layersRef.current.forEach((l) => {
        try { scene.removeLayer(l); } catch { /* noop */ }
      });
      layersRef.current = [];
    };
  }, [scene]);

  return null;
}

/**
 * 查找主要道路的交汇点（两条不同名称的道路端点距离 < 300m）
 */
function findIntersections(roads: any[]): { lng: number; lat: number; name: string }[] {
  const endpoints: { lng: number; lat: number; roadName: string }[] = [];

  roads.forEach((road) => {
    const coords = road.coordinates;
    if (coords.length < 2) return;
    // 取首尾端点
    endpoints.push({ lng: coords[0][0], lat: coords[0][1], roadName: road.name });
    endpoints.push({ lng: coords[coords.length - 1][0], lat: coords[coords.length - 1][1], roadName: road.name });
  });

  const result: { lng: number; lat: number; name: string }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < endpoints.length; i++) {
    for (let j = i + 1; j < endpoints.length; j++) {
      const a = endpoints[i];
      const b = endpoints[j];
      if (a.roadName === b.roadName) continue;

      const dist = haversineDistance(a.lng, a.lat, b.lng, b.lat);
      if (dist < 300) {
        const key = `${Math.min(a.lng, b.lng).toFixed(4)},${Math.min(a.lat, b.lat).toFixed(4)}`;
        if (used.has(key)) continue;
        used.add(key);

        result.push({
          lng: (a.lng + b.lng) / 2,
          lat: (a.lat + b.lat) / 2,
          name: `${a.roadName}×${b.roadName}`,
        });
      }
    }
  }

  return result;
}

function haversineDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
