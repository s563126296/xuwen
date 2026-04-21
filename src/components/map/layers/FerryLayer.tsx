import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import laneData from '../../../data/geo/lanes.json';

/**
 * 渡轮图层（参考 xuwen 项目 VesselLayer 的简洁设计）
 * - 3层结构：尾迹光晕 + 脉冲底圈 + 主体三角形
 * - 静态布置，象征性展示
 * - 真实船名
 */

interface Ferry {
  id: string;
  name: string;
  laneName: string;
  gcjLng: number;
  gcjLat: number;
  course: number;
}

// 真实船名
const FERRY_NAMES = ['粤海铁1号', '紫荆22号', '椰香公主号', '新海港1号', '海口8号'];

// 每条航线的渡轮配置（精简，每条航线1艘，分散在不同位置）
const LANE_FERRY_CONFIG: Record<string, number> = {
  'lane-徐闻港---新海港': 0.35,      // 在航线35%位置
  'lane-海安新港---秀英港': 0.55,    // 在航线55%位置
  'lane-粤海轮渡线': 0.45,           // 在航线45%位置
  'lane-徐闻港---马村港': 0.65,      // 在航线65%位置
};

export default function FerryLayer() {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);

  useEffect(() => {
    if (!scene) return;

    const ferries: Ferry[] = [];
    let nameIndex = 0;

    (laneData as any[]).forEach((lane) => {
      const position = LANE_FERRY_CONFIG[lane.id];
      if (position === undefined) return;

      const coords = lane.coordinates;
      if (coords.length < 2) return;

      const index = Math.floor(coords.length * position);
      const [gcjLng, gcjLat] = wgs84ToGcj02(coords[index][0], coords[index][1]);
      const course = calculateCourse(coords, index);

      ferries.push({
        id: `${lane.id}-ferry`,
        name: FERRY_NAMES[nameIndex % FERRY_NAMES.length],
        laneName: lane.name,
        gcjLng,
        gcjLat,
        course,
      });
      nameIndex++;
    });

    const layers: ILayer[] = [];

    // 第1层：尾迹光晕（大圆圈，低透明度）
    const wakeLayer = new PointLayer({ zIndex: 6 })
      .source(ferries, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(32)
      .color('#4da6ff')
      .style({ opacity: 0.12 })
      .animate(true);
    layers.push(wakeLayer);

    // 第2层：脉冲底圈（中圆圈，呼吸动画）
    const pulseLayer = new PointLayer({ zIndex: 7 })
      .source(ferries, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle')
      .size(18)
      .color('#4da6ff')
      .style({ opacity: 0.25 })
      .animate(true);
    layers.push(pulseLayer);

    // 第3层：渡轮主体（三角形，按航向旋转）
    const ferryLayer = new PointLayer({ zIndex: 8 })
      .source(ferries, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('triangle')
      .size(12)
      .color('#4da6ff')
      .style({ opacity: 0.95, strokeWidth: 2, stroke: '#fff' })
      .rotate('course', (c: number) => c);
    layers.push(ferryLayer);

    // 第4层：渡轮名称标签
    const labelLayer = new PointLayer({ zIndex: 32, depth: false })
      .source(ferries, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('name', 'text')
      .size(10)
      .color('#c8dcff')
      .style({
        textAnchor: 'center',
        textOffset: [0, -18],
        fontFamily: 'Noto Sans SC',
        fontWeight: 500,
        stroke: '#060d1a',
        strokeWidth: 2,
        opacity: 0.85,
      });
    layers.push(labelLayer);

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
 * 计算航向（从当前点到下一点的方位角）
 */
function calculateCourse(coords: number[][], index: number): number {
  if (index >= coords.length - 1) index = coords.length - 2;
  if (index < 0) index = 0;

  const [lng1, lat1] = coords[index];
  const [lng2, lat2] = coords[index + 1];

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}
