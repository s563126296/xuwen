import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../../MapSceneContext';
import { useUIStore } from '../../../../../stores/uiStore';
import { wgs84ToGcj02 } from '../../../../../utils/coordTransform';

export interface DeviceIconPoint {
  lng: number;
  lat: number;
  id: string;
  name: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

export interface DeviceIconLayerProps {
  /** SVG image URL (imported asset path or public URL) */
  svgPath: string;
  /** Device point data (WGS84 coordinates) */
  points: DeviceIconPoint[];
  /** Icon size in pixels */
  size?: number;
  /** Icon opacity */
  opacity?: number;
  /** Layer z-index */
  zIndex?: number;
  /** Entity type string for setSelectedEntity */
  entityType?: string;
  /** Tooltip formatter -- receives point properties, returns display string */
  tooltipFormatter?: (props: Record<string, unknown>) => string;
}

// ── Tooltip helpers (shared singleton DOM element) ──────────────────────

function showTooltip(x: number, y: number, text: string) {
  let el = document.getElementById('l7-map-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'l7-map-tooltip';
    el.style.cssText =
      'position:fixed;z-index:9999;pointer-events:none;background:rgba(6,13,26,0.94);' +
      'border:1px solid rgba(77,166,255,0.3);border-radius:6px;padding:8px 12px;' +
      'font:12px "Noto Sans SC",sans-serif;color:#c8dcff;line-height:1.5;' +
      'backdrop-filter:blur(8px);max-width:260px;white-space:pre-line;';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.display = 'block';
  el.style.left = x + 12 + 'px';
  el.style.top = y - 20 + 'px';
}

function hideTooltip() {
  const el = document.getElementById('l7-map-tooltip');
  if (el) el.style.display = 'none';
}

// ── SVG to Image helper ────────────────────────────────────────────────

async function ensureImage(scene: any, imageId: string, svgUrl: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        scene.addImage(imageId, img);
      } catch {
        // image may already be registered
      }
      resolve();
    };
    img.onerror = () => {
      try {
        scene.addImage(imageId, svgUrl);
      } catch { /* noop */ }
      resolve();
    };
    img.src = svgUrl;
  });
}

function openDeviceModal(entityType: string, id: string) {
  const deviceTypeMap: Record<string, string> = {
    'electronic-police': 'police',
    'parking-violation': 'parking',
    'speed-camera': 'speed',
    'security-camera': 'monitor',
    'checkpoint-gate': 'checkpoint',
    'traffic-light': 'signal',
    'info-screen': 'screen',
    drone: 'drone',
  };
  const selectedDeviceType = deviceTypeMap[entityType];
  if (!selectedDeviceType) return;

  const state = useUIStore.getState();
  state.setSelectedDeviceType(selectedDeviceType);
  state.setSelectedEntity({ type: entityType, id });
  state.setActiveModal('checkpoint');
}

// ── Component ───────────────────────────────────────────────────────────

export default function DeviceIconLayer({
  svgPath,
  points,
  size = 24,
  opacity = 0.85,
  zIndex = 8,
  entityType = 'device',
  tooltipFormatter,
}: DeviceIconLayerProps) {
  const scene = useMapScene();
  const layersRef = useRef<ILayer[]>([]);
  const tooltipFormatterRef = useRef(tooltipFormatter);

  useEffect(() => {
    tooltipFormatterRef.current = tooltipFormatter;
  }, [tooltipFormatter]);

  useEffect(() => {
    if (!scene || points.length === 0) {
      layersRef.current.forEach((layer) => scene?.removeLayer(layer));
      layersRef.current = [];
      return;
    }

    let cancelled = false;
    const imageId = `device-icon-${entityType}`;

    ensureImage(scene, imageId, svgPath).then(() => {
      if (cancelled) return;

      // Transform WGS84 -> GCJ02
      const data = points.map((pt) => {
        const [gcjLng, gcjLat] = wgs84ToGcj02(pt.lng, pt.lat);
        return { ...pt, gcjLng, gcjLat, _imageId: imageId };
      });

      const iconLayer = new PointLayer({ zIndex })
        .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape(imageId, 'image')
        .size(size)
        .style({ opacity });

      const hitLayer = new PointLayer({ zIndex: Math.max(zIndex + 40, 48), depth: false })
        .source(data, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
        .shape('circle')
        .size(Math.max(size + 18, 38))
        .color('#ffffff')
        .style({
          opacity: 0.01,
          strokeWidth: 0,
          textAllowOverlap: true,
        });

      // ── Interaction ──
      const handleClick = (e: any) => {
        const p = e.feature?.properties;
        if (p) {
          const id = p.id || p.name || '';
          useUIStore.getState().setSelectedEntity({ type: entityType, id });
          openDeviceModal(entityType, id);
        }
      };

      const handleMouseMove = (e: any) => {
        const p = e.feature?.properties;
        if (!p) return;
        document.body.style.cursor = 'pointer';
        const text = tooltipFormatterRef.current
          ? tooltipFormatterRef.current(p)
          : `${p.name || ''} | ${p.type || entityType}`;
        showTooltip(e.x, e.y, text);
      };

      const handleMouseOut = () => {
        document.body.style.cursor = '';
        hideTooltip();
      };

      iconLayer.on('click', handleClick);
      hitLayer.on('click', handleClick);
      hitLayer.on('mousemove', handleMouseMove);
      hitLayer.on('mouseout', handleMouseOut);

      scene.addLayer(iconLayer);
      scene.addLayer(hitLayer);
      layersRef.current = [iconLayer, hitLayer];
    });

    return () => {
      cancelled = true;
      layersRef.current.forEach((layer) => scene.removeLayer(layer));
      layersRef.current = [];
      document.body.style.cursor = '';
      hideTooltip();
    };
  }, [scene, svgPath, points, size, opacity, zIndex, entityType]);

  return null;
}
