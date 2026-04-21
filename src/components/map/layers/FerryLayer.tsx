import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import laneData from '../../../data/geo/lanes.json';

interface LaneItem {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  coordinates: number[][];
  frequency?: number;
}

interface FerryRuntime {
  id: string;
  name: string;
  laneName: string;
  path: [number, number][];
  cumulative: number[];
  totalLength: number;
  progress: number;
  speedPerMs: number;
}

interface FerryFrame {
  id: string;
  name: string;
  laneName: string;
  lng: number;
  lat: number;
  course: number;
}

interface FerryLabel extends FerryFrame {
  x: number;
  y: number;
}

const FERRY_NAME_BY_LANE: Record<string, string> = {
  'lane-徐闻港---新海港': '新海港1号',
  'lane-海安新港---秀英港': '紫荆22号',
  'lane-粤海轮渡线': '粤海铁1号',
  'lane-徐闻港---马村港': '马村快航3号',
};

const FALLBACK_FERRY_NAMES = ['海口8号', '椰香公主号', '椰城快线'];

function segmentDistance(a: [number, number], b: [number, number]) {
  const avgLatRad = (((a[1] + b[1]) / 2) * Math.PI) / 180;
  const dx = (b[0] - a[0]) * Math.cos(avgLatRad);
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function buildPathMetrics(path: [number, number][]) {
  const cumulative = [0];
  for (let i = 1; i < path.length; i += 1) {
    cumulative[i] = cumulative[i - 1] + segmentDistance(path[i - 1], path[i]);
  }
  return { cumulative, totalLength: cumulative[cumulative.length - 1] || 1 };
}

function computeCourse(from: [number, number], to: [number, number]) {
  const avgLatRad = (((from[1] + to[1]) / 2) * Math.PI) / 180;
  const dx = (to[0] - from[0]) * Math.cos(avgLatRad);
  const dy = to[1] - from[1];
  return (Math.atan2(dx, dy) * 180) / Math.PI + 360;
}

function samplePathPosition(
  path: [number, number][],
  cumulative: number[],
  totalLength: number,
  progress: number,
) {
  if (path.length === 0) return { lng: 0, lat: 0, course: 0 };
  if (path.length === 1) return { lng: path[0][0], lat: path[0][1], course: 0 };

  const normalized = ((progress % 1) + 1) % 1;
  const targetDistance = normalized * totalLength;
  let segmentIndex = 0;

  while (
    segmentIndex < cumulative.length - 2 &&
    cumulative[segmentIndex + 1] < targetDistance
  ) {
    segmentIndex += 1;
  }

  const start = path[segmentIndex];
  const end = path[segmentIndex + 1] || start;
  const startDistance = cumulative[segmentIndex];
  const endDistance = cumulative[segmentIndex + 1] || startDistance + 1;
  const ratio = endDistance === startDistance
    ? 0
    : (targetDistance - startDistance) / (endDistance - startDistance);

  return {
    lng: start[0] + (end[0] - start[0]) * ratio,
    lat: start[1] + (end[1] - start[1]) * ratio,
    course: computeCourse(start, end),
  };
}

function toGcjPath(rawPath: number[][]): [number, number][] {
  return rawPath
    .filter((point) => Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .map(([lng, lat]) => wgs84ToGcj02(lng, lat));
}

export default function FerryLayer() {
  const scene = useMapScene();
  const laneRows = useMemo(() => laneData as LaneItem[], []);
  const layersRef = useRef<ILayer[]>([]);
  const ferriesRef = useRef<FerryRuntime[]>([]);
  const latestFrameRef = useRef<FerryFrame[]>([]);
  const animationRef = useRef<number | null>(null);
  const labelRafRef = useRef<number | null>(null);
  const [labels, setLabels] = useState<FerryLabel[]>([]);

  const refreshLabels = useCallback((frames?: FerryFrame[]) => {
    if (!scene) {
      setLabels([]);
      return;
    }

    const zoom = typeof scene.getZoom === 'function' ? scene.getZoom() : 11;
    if (zoom < 11.4) {
      setLabels([]);
      return;
    }

    const source = frames ?? latestFrameRef.current;
    if (source.length === 0) {
      setLabels([]);
      return;
    }

    const mapSize = scene.getMapService?.()?.getSize?.() as unknown;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (Array.isArray(mapSize) && mapSize.length >= 2) {
      const maybeWidth = mapSize[0];
      const maybeHeight = mapSize[1];
      if (typeof maybeWidth === 'number' && Number.isFinite(maybeWidth)) width = maybeWidth;
      if (typeof maybeHeight === 'number' && Number.isFinite(maybeHeight)) height = maybeHeight;
    } else if (mapSize && typeof mapSize === 'object') {
      const rect = mapSize as { width?: number; height?: number };
      if (typeof rect.width === 'number' && Number.isFinite(rect.width)) width = rect.width;
      if (typeof rect.height === 'number' && Number.isFinite(rect.height)) height = rect.height;
    }

    const nextLabels = source
      .map((ferry) => {
        const projected = scene.lngLatToContainer([ferry.lng, ferry.lat] as [number, number]) as
          | { x?: number; y?: number }
          | [number, number]
          | null;
        const x = Array.isArray(projected) ? projected[0] : projected?.x;
        const y = Array.isArray(projected) ? projected[1] : projected?.y;
        if (typeof x !== 'number' || !Number.isFinite(x)) return null;
        if (typeof y !== 'number' || !Number.isFinite(y)) return null;
        if (x < -120 || x > width + 120 || y < -80 || y > height + 80) return null;
        return { ...ferry, x, y };
      })
      .filter((item): item is FerryLabel => item !== null);

    setLabels(nextLabels);
  }, [scene]);

  const scheduleLabelRefresh = useCallback(() => {
    if (labelRafRef.current !== null) {
      cancelAnimationFrame(labelRafRef.current);
    }
    labelRafRef.current = requestAnimationFrame(() => {
      labelRafRef.current = null;
      refreshLabels();
    });
  }, [refreshLabels]);

  useEffect(() => {
    if (!scene) return;

    const ferries: FerryRuntime[] = laneRows
      .map((lane, index) => {
        const path = toGcjPath(lane.coordinates);
        if (path.length < 2) return null;

        const { cumulative, totalLength } = buildPathMetrics(path);
        const name = FERRY_NAME_BY_LANE[lane.id] ?? FALLBACK_FERRY_NAMES[index % FALLBACK_FERRY_NAMES.length];
        const baseSpeed = lane.type === 'primary' ? 0.00005 : 0.00004;
        const frequencyFactor = Math.max(0, (lane.frequency ?? 30) - 30) * 0.0000003;

        return {
          id: `${lane.id}-ferry`,
          name,
          laneName: lane.name,
          path,
          cumulative,
          totalLength,
          progress: (index * 0.22) % 1,
          speedPerMs: baseSpeed + frequencyFactor,
        };
      })
      .filter((item): item is FerryRuntime => item !== null);

    if (ferries.length === 0) return;
    ferriesRef.current = ferries;

    const initialFrames: FerryFrame[] = ferries.map((ferry) => {
      const position = samplePathPosition(
        ferry.path,
        ferry.cumulative,
        ferry.totalLength,
        ferry.progress,
      );
      return {
        id: ferry.id,
        name: ferry.name,
        laneName: ferry.laneName,
        lng: position.lng,
        lat: position.lat,
        course: position.course % 360,
      };
    });
    latestFrameRef.current = initialFrames;

    const wakeLayer = new PointLayer({ zIndex: 6, depth: false })
      .source(initialFrames, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size(22)
      .color('#4da6ff')
      .style({
        opacity: 0.16,
        strokeWidth: 1.2,
        stroke: '#4da6ff',
      })
      .animate({
        enable: true,
        type: 'wave',
        duration: 3200,
        interval: 0.24,
      });

    const ferryLayer = new PointLayer({ zIndex: 8, depth: false })
      .source(initialFrames, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('triangle')
      .size(12)
      .color('#4da6ff')
      .style({
        opacity: 0.95,
        strokeWidth: 1.5,
        stroke: '#ffffff',
      })
      .rotate('course', (course: number) => course);

    scene.addLayer(wakeLayer);
    scene.addLayer(ferryLayer);
    layersRef.current = [wakeLayer, ferryLayer];
    refreshLabels(initialFrames);

    const viewEvents = ['mapmove', 'move', 'moveend', 'zoom', 'zoomend', 'resize', 'pitch', 'rotate'];
    viewEvents.forEach((eventName) => {
      scene.on(eventName as any, scheduleLabelRefresh);
    });

    let lastTs = performance.now();
    let lastLabelTs = lastTs;

    const animate = (ts: number) => {
      const dt = Math.min(80, Math.max(16, ts - lastTs));
      lastTs = ts;

      const nextFrames: FerryFrame[] = ferriesRef.current.map((ferry) => {
        ferry.progress = (ferry.progress + ferry.speedPerMs * dt) % 1;
        const position = samplePathPosition(
          ferry.path,
          ferry.cumulative,
          ferry.totalLength,
          ferry.progress,
        );
        return {
          id: ferry.id,
          name: ferry.name,
          laneName: ferry.laneName,
          lng: position.lng,
          lat: position.lat,
          course: position.course % 360,
        };
      });

      latestFrameRef.current = nextFrames;
      (wakeLayer as any).setData(nextFrames);
      (ferryLayer as any).setData(nextFrames);

      if (ts - lastLabelTs >= 120) {
        lastLabelTs = ts;
        refreshLabels(nextFrames);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (labelRafRef.current !== null) {
        cancelAnimationFrame(labelRafRef.current);
        labelRafRef.current = null;
      }
      viewEvents.forEach((eventName) => {
        scene.off(eventName as any, scheduleLabelRefresh);
      });
      layersRef.current.forEach((layer) => {
        try {
          scene.removeLayer(layer);
        } catch {
          // noop
        }
      });
      layersRef.current = [];
      ferriesRef.current = [];
      latestFrameRef.current = [];
      setLabels([]);
    };
  }, [laneRows, refreshLabels, scene, scheduleLabelRefresh]);

  if (labels.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 142, pointerEvents: 'none' }}>
      {labels.map((label) => (
        <div
          key={label.id}
          style={{
            position: 'absolute',
            left: label.x,
            top: label.y - 18,
            transform: 'translate(-50%, -50%)',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid rgba(77,166,255,0.36)',
            background: 'rgba(6,13,26,0.78)',
            color: '#c8dcff',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Noto Sans SC, sans-serif',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {label.name}
        </div>
      ))}
    </div>
  );
}
