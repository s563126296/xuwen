import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../MapSceneContext';
import { mapRowsToGcj } from '../../../utils/coordTransform';
import { useUIStore } from '../../../stores/uiStore';
import type { PortType } from '../../../stores/types';
import keyPois from '../../../data/geo/keyPois.json';

// 分类视觉配置
const POI_STYLES: Record<string, { color: string; glow: string; shape: string }> = {
  port:      { color: '#f0b429', glow: 'rgba(240,180,41,0.15)', shape: 'triangle' },
  terminal:  { color: '#f0b429', glow: 'rgba(240,180,41,0.12)', shape: 'square' },
  dispatch:  { color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', shape: 'circle' },
  service:   { color: '#4da6ff', glow: 'rgba(77,166,255,0.12)', shape: 'hexagon' },
};

const CATEGORY_LABELS: Record<string, string> = {
  port: '港口',
  terminal: '码头',
  dispatch: '调度',
  service: '服务',
};

const POI_SCOPE_TO_PORT: Partial<Record<string, PortType>> = {
  xuwen: 'xuwen',
  haian: 'haian',
};

interface PoiPoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  category: string;
  scope?: string;
  color: string;
  glowColor: string;
  shapeType: string;
  importance: number;
}

interface LabelPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
  color: string;
}

interface HitPoint {
  id: string;
  x: number;
  y: number;
}

function showTooltip(x: number, y: number, text: string) {
  let el = document.getElementById('l7-map-tooltip-port');
  if (!el) {
    el = document.createElement('div');
    el.id = 'l7-map-tooltip-port';
    el.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(6,13,26,0.94);border:1px solid rgba(77,166,255,0.3);border-radius:6px;padding:8px 12px;font:12px "Noto Sans SC",sans-serif;color:#c8dcff;line-height:1.5;backdrop-filter:blur(8px);max-width:220px;';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.display = 'block';
  el.style.left = x + 'px';
  el.style.top = (y - 70) + 'px';
}

function hideTooltip() {
  const el = document.getElementById('l7-map-tooltip-port');
  if (el) el.style.display = 'none';
}

interface Props {
  visible: boolean;
}

export default function PortLabelAndBuildingLayer({ visible }: Props) {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [labelPoints, setLabelPoints] = useState<LabelPoint[]>([]);
  const [hitPoints, setHitPoints] = useState<HitPoint[]>([]);
  const labelRafRef = useRef<number | null>(null);
  const labelLoopRef = useRef<number | null>(null);
  const setSelectedEntity = useUIStore((s) => s.setSelectedEntity);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const setSelectedPort = useUIStore((s) => s.setSelectedPort);

  const gcjPoints = useMemo<PoiPoint[]>(() => (
    mapRowsToGcj(keyPois).map((p) => {
      const style = POI_STYLES[p.category] || { color: '#4da6ff', glow: 'rgba(77,166,255,0.1)', shape: 'circle' };
      return {
        ...p,
        color: style.color,
        glowColor: style.glow,
        shapeType: style.shape,
        importance: p.category === 'port' ? 1 : p.category === 'terminal' ? 0.8 : 0.5,
      };
    })
  ), []);

  const handlePoiClick = useCallback((poi: PoiPoint) => {
    const targetPort = poi.scope ? POI_SCOPE_TO_PORT[poi.scope] : undefined;
    if (targetPort) {
      setSelectedPort(targetPort);
    }
    setSelectedEntity({ type: 'poi', id: poi.id });
    setActiveModal('poi-detail');
  }, [setActiveModal, setSelectedEntity, setSelectedPort]);

  const refreshLabelPositions = useCallback(() => {
    if (!scene || !visible || !initialized) {
      setLabelPoints([]);
      return;
    }

    const zoom = typeof scene.getZoom === 'function' ? scene.getZoom() : 11;
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

    const nextLabels = gcjPoints
      .map((point) => {
        // 只保留港口/码头标签，避免调度/服务等次级标签造成碎片化视觉。
        if (point.category !== 'port' && point.category !== 'terminal') return null;
        // 中低缩放下仅显示核心港口名，减少跨海区域文字重叠。
        if (point.category === 'terminal' && zoom < 11.5) return null;

        const projected = scene.lngLatToContainer([point.lng, point.lat] as [number, number]) as
          | { x?: number; y?: number }
          | [number, number]
          | null;
        const x = Array.isArray(projected) ? projected[0] : projected?.x;
        const y = Array.isArray(projected) ? projected[1] : projected?.y;
        if (typeof x !== 'number' || !Number.isFinite(x)) return null;
        if (typeof y !== 'number' || !Number.isFinite(y)) return null;
        if (x < -120 || x > width + 120 || y < -80 || y > height + 80) return null;

        return {
          id: point.id,
          name: point.name,
          x,
          y,
          category: point.category,
          color: point.color,
        };
      })
      .filter((item): item is LabelPoint => item !== null);

    const nextHits = gcjPoints
      .map((point) => {
        const projected = scene.lngLatToContainer([point.lng, point.lat] as [number, number]) as
          | { x?: number; y?: number }
          | [number, number]
          | null;
        const x = Array.isArray(projected) ? projected[0] : projected?.x;
        const y = Array.isArray(projected) ? projected[1] : projected?.y;
        if (typeof x !== 'number' || !Number.isFinite(x)) return null;
        if (typeof y !== 'number' || !Number.isFinite(y)) return null;
        if (x < -120 || x > width + 120 || y < -80 || y > height + 80) return null;
        return { id: point.id, x, y };
      })
      .filter((item): item is HitPoint => item !== null);

    setLabelPoints(nextLabels);
    setHitPoints(nextHits);
  }, [gcjPoints, initialized, scene, visible]);

  const scheduleLabelRefresh = useCallback(() => {
    if (labelRafRef.current !== null) {
      cancelAnimationFrame(labelRafRef.current);
    }
    labelRafRef.current = requestAnimationFrame(() => {
      labelRafRef.current = null;
      refreshLabelPositions();
    });
  }, [refreshLabelPositions]);

  useEffect(() => {
    if (!scene) return;

    if (!scene.getMapService()) {
      const checkReady = setInterval(() => {
        if (scene.getMapService()) {
          clearInterval(checkReady);
          setInitialized(true);
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    setInitialized(true);
  }, [scene]);

  useEffect(() => {
    if (!scene || !initialized) return;

    const layers: ILayer[] = [];
    const interactiveLayers: ILayer[] = [];

    // 第1层：静态外圈光晕
    const outerRing = new PointLayer({ zIndex: 15 })
      .source(gcjPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size('importance', [22, 32])
      .color('glowColor')
      .style({ opacity: 0.42, strokeWidth: 1, stroke: 'color' });
    layers.push(outerRing);

    // 第2层：内圈实心点
    const innerRing = new PointLayer({ zIndex: 16 })
      .source(gcjPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size('importance', [8, 14])
      .color('color')
      .style({ opacity: 0.9, strokeWidth: 1.5, stroke: '#fff' });
    layers.push(innerRing);
    interactiveLayers.push(innerRing);

    // 第3层：分类图标（按类别分别创建图层）
    const portPoints = gcjPoints.filter(p => p.category === 'port');
    const terminalPoints = gcjPoints.filter(p => p.category === 'terminal');
    const dispatchPoints = gcjPoints.filter(p => p.category === 'dispatch');
    const servicePoints = gcjPoints.filter(p => p.category === 'service');

    if (portPoints.length > 0) {
      const portIconLayer = new PointLayer({ zIndex: 17 })
        .source(portPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('triangle')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(portIconLayer);
      interactiveLayers.push(portIconLayer);
    }

    if (terminalPoints.length > 0) {
      const terminalIconLayer = new PointLayer({ zIndex: 17 })
        .source(terminalPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('square')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(terminalIconLayer);
      interactiveLayers.push(terminalIconLayer);
    }

    if (dispatchPoints.length > 0) {
      const dispatchIconLayer = new PointLayer({ zIndex: 17 })
        .source(dispatchPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(dispatchIconLayer);
      interactiveLayers.push(dispatchIconLayer);
    }

    if (servicePoints.length > 0) {
      const serviceIconLayer = new PointLayer({ zIndex: 17 })
        .source(servicePoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('hexagon')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(serviceIconLayer);
      interactiveLayers.push(serviceIconLayer);
    }

    // 第4层：透明命中层，提升点击体验
    const hitLayer = new PointLayer({ zIndex: 120, depth: false })
      .source(gcjPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size('importance', [34, 48])
      .color('#ffffff')
      .style({
        opacity: 0.001,
        strokeWidth: 0,
      });
    layers.push(hitLayer);
    interactiveLayers.push(hitLayer);

    // 交互
    const handleMouseMove = (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      document.body.style.cursor = 'pointer';
      showTooltip(e.x, e.y, `${p.name} | ${CATEGORY_LABELS[p.category] || p.category}`);
    };
    const handleMouseOut = () => {
      document.body.style.cursor = '';
      hideTooltip();
    };
    const handleClick = (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      handlePoiClick(p as PoiPoint);
    };

    interactiveLayers.forEach((layer) => {
      layer.on('mousemove', handleMouseMove);
      layer.on('mouseout', handleMouseOut);
      layer.on('click', handleClick);
    });

    // 添加所有图层
    layers.forEach((layer) => {
      scene.addLayer(layer);
      if (visible) {
        layer.show();
      } else {
        layer.hide();
      }
    });
    layersRef.current = layers;

    return () => {
      layersRef.current.forEach((layer) => {
        try {
          scene.removeLayer(layer);
        } catch { /* noop */ }
      });
      layersRef.current = [];
      if (labelRafRef.current !== null) {
        cancelAnimationFrame(labelRafRef.current);
        labelRafRef.current = null;
      }
      if (labelLoopRef.current !== null) {
        cancelAnimationFrame(labelLoopRef.current);
        labelLoopRef.current = null;
      }
      document.body.style.cursor = '';
      hideTooltip();
      setLabelPoints([]);
      setHitPoints([]);
    };
  }, [scene, initialized, gcjPoints, handlePoiClick, visible]);

  useEffect(() => {
    if (!scene || !initialized) return;

    const updateEvents = ['mapmove', 'move', 'moveend', 'zoom', 'zoomend', 'resize', 'pitch', 'rotate'];
    scheduleLabelRefresh();

    updateEvents.forEach((eventName) => {
      scene.on(eventName as any, scheduleLabelRefresh);
    });

    return () => {
      updateEvents.forEach((eventName) => {
        scene.off(eventName as any, scheduleLabelRefresh);
      });
      if (labelRafRef.current !== null) {
        cancelAnimationFrame(labelRafRef.current);
        labelRafRef.current = null;
      }
    };
  }, [scene, initialized, scheduleLabelRefresh]);

  // 兜底循环：低频刷新标签位置，避免拖动时出现“漂移后回位”
  useEffect(() => {
    if (!scene || !initialized || !visible) return;

    let lastTs = 0;
    const tick = (ts: number) => {
      if (ts - lastTs >= 80) {
        lastTs = ts;
        refreshLabelPositions();
      }
      labelLoopRef.current = requestAnimationFrame(tick);
    };

    labelLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (labelLoopRef.current !== null) {
        cancelAnimationFrame(labelLoopRef.current);
        labelLoopRef.current = null;
      }
    };
  }, [scene, initialized, visible, refreshLabelPositions]);

  // 控制显示/隐藏
  useEffect(() => {
    if (layersRef.current.length === 0) return;

    layersRef.current.forEach((layer) => {
      if (visible) {
        layer.show();
      } else {
        layer.hide();
      }
    });
    scheduleLabelRefresh();
  }, [visible, scheduleLabelRefresh]);

  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 140, pointerEvents: 'none' }}>
      {hitPoints.map((hit) => {
        const poi = gcjPoints.find((item) => item.id === hit.id);
        if (!poi) return null;
        return (
          <button
            key={`hit-${hit.id}`}
            type="button"
            aria-label={`打开${poi.name}详情`}
            onClick={() => handlePoiClick(poi)}
            style={{
              position: 'absolute',
              left: hit.x - 18,
              top: hit.y - 18,
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        );
      })}
      {labelPoints.map((point) => {
        const poi = gcjPoints.find((item) => item.id === point.id);
        if (!poi) return null;
        const isPort = point.category === 'port';
        return (
          <button
            key={point.id}
            type="button"
            aria-label={`查看${point.name}`}
            onClick={() => handlePoiClick(poi)}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y + (isPort ? -26 : 20),
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              border: `1px solid ${isPort ? 'rgba(240,180,41,0.55)' : 'rgba(77,166,255,0.32)'}`,
              borderRadius: 4,
              background: isPort ? 'rgba(40,28,6,0.86)' : 'rgba(6,13,26,0.78)',
              color: point.color,
              padding: isPort ? '3px 8px' : '2px 6px',
              fontSize: isPort ? 12 : 10,
              fontWeight: isPort ? 700 : 600,
              fontFamily: 'Noto Sans SC, sans-serif',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              boxShadow: isPort ? '0 0 14px rgba(240,180,41,0.18)' : 'none',
              cursor: 'pointer',
            }}
          >
            {point.name}
          </button>
        );
      })}
    </div>
  );
}
