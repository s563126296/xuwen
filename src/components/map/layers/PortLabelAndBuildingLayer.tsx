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

interface LabelPoint extends PoiPoint {
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

  const updateLabelPositions = useCallback(() => {
    if (!scene || !visible) {
      setLabelPoints([]);
      return;
    }

    const nextPoints = gcjPoints
      .map((point) => {
        const pixel = scene.lngLatToContainer([point.lng, point.lat] as [number, number]) as any;
        const x = typeof pixel?.x === 'number' ? pixel.x : pixel?.[0];
        const y = typeof pixel?.y === 'number' ? pixel.y : pixel?.[1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { ...point, x, y };
      })
      .filter(Boolean) as LabelPoint[];

    setLabelPoints(nextPoints);
  }, [gcjPoints, scene, visible]);

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

    // 第1层：静态外圈光晕。不要给所有 POI 做呼吸动画，避免误判为刷新。
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
    }

    if (terminalPoints.length > 0) {
      const terminalIconLayer = new PointLayer({ zIndex: 17 })
        .source(terminalPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('square')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(terminalIconLayer);
    }

    if (dispatchPoints.length > 0) {
      const dispatchIconLayer = new PointLayer({ zIndex: 17 })
        .source(dispatchPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(dispatchIconLayer);
    }

    if (servicePoints.length > 0) {
      const serviceIconLayer = new PointLayer({ zIndex: 17 })
        .source(servicePoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('hexagon')
        .size('importance', [10, 16])
        .color('#fff')
        .style({ opacity: 0.95 });
      layers.push(serviceIconLayer);
    }

    // 第4层：透明命中层，解决小图标难点中和 text label 点击无反馈问题。
    const hitLayer = new PointLayer({ zIndex: 120, depth: false })
      .source(gcjPoints, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .size('importance', [34, 48])
      .color('#ffffff')
      .style({
        opacity: 0.01,
        strokeWidth: 0,
      });
    layers.push(hitLayer);

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

    innerRing.on('mousemove', handleMouseMove);
    innerRing.on('mouseout', handleMouseOut);
    innerRing.on('click', handleClick);
    hitLayer.on('mousemove', handleMouseMove);
    hitLayer.on('mouseout', handleMouseOut);
    hitLayer.on('click', handleClick);

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
      document.body.style.cursor = '';
      hideTooltip();
    };
  }, [scene, initialized, gcjPoints, handlePoiClick, visible]);

  useEffect(() => {
    if (!scene || !initialized) return;

    updateLabelPositions();
    scene.on('moveend', updateLabelPositions);
    scene.on('zoomend', updateLabelPositions);
    scene.on('resize', updateLabelPositions);

    return () => {
      scene.off('moveend', updateLabelPositions);
      scene.off('zoomend', updateLabelPositions);
      scene.off('resize', updateLabelPositions);
    };
  }, [scene, initialized, updateLabelPositions]);

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
    updateLabelPositions();
  }, [visible]);

  if (!visible || labelPoints.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 140, pointerEvents: 'none' }}>
      {labelPoints.map((point) => {
        const isPort = point.category === 'port';
        return (
          <button
            key={point.id}
            type="button"
            aria-label={`查看${point.name}`}
            onClick={() => handlePoiClick(point)}
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
