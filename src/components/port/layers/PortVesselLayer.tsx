import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../map/MapSceneContext';
import { wgs84ToGcj02 } from '../../../utils/coordTransform';
import { usePortStore } from '../../../stores/portStore';

const STATUS_COLOR: Record<string, string> = {
  sailing: '#00D0E9',
  docked: '#2ED573',
  waiting: '#F5A623',
};

function showTooltip(x: number, y: number, lines: string[]) {
  let el = document.getElementById('port-vessel-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'port-vessel-tooltip';
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
  const el = document.getElementById('port-vessel-tooltip');
  if (el) el.style.display = 'none';
}

export default function PortVesselLayer() {
  const scene = useMapScene();
  const vessels = usePortStore((s) => s.vessels);
  const selectedVessel = usePortStore((s) => s.selectedVessel);
  const setSelectedVessel = usePortStore((s) => s.setSelectedVessel);
  const wakeRef = useRef<ILayer | null>(null);
  const pulseRef = useRef<ILayer | null>(null);
  const bodyRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    const points = vessels.map((v) => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(v.position[0], v.position[1]);
      return {
        gcjLng, gcjLat,
        id: v.id, name: v.name, status: v.status,
        speed: v.speed, destination: v.destination, eta: v.eta, loadRate: v.loadRate,
        color: STATUS_COLOR[v.status] || '#00D0E9',
        size: v.id === selectedVessel ? 14 : 10,
      };
    });

    const sailingPoints = points.filter((p) => p.status === 'sailing');

    const wake = new PointLayer({ zIndex: 20 })
      .source(sailingPoints, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle').size(32).color('#00D0E9').style({ opacity: 0.1 }).animate(true);

    const pulse = new PointLayer({ zIndex: 21 })
      .source(points, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('circle').size(18).color('color').style({ opacity: 0.18 }).animate(true);

    const body = new PointLayer({ zIndex: 22 })
      .source(points, { parser: { type: 'json', x: 'gcjLng', y: 'gcjLat' } })
      .shape('triangle').size('size').color('color')
      .style({ opacity: 0.92, strokeWidth: 1.5, stroke: '#fff' });

    body.on('click', (e: any) => {
      const p = e.feature?.properties;
      if (p) setSelectedVessel(p.id === selectedVessel ? null : p.id);
    });
    body.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const statusLabel = ({ sailing: '航行中', docked: '靠泊', waiting: '候泊' } as Record<string, string>)[p.status] || '';
      showTooltip(e.x, e.y, [
        `${p.name}  ${statusLabel}`,
        `${p.speed}节 → ${p.destination}  预计到达 ${p.eta}`,
        `装载率 ${p.loadRate}%`,
      ]);
    });
    body.on('mouseout', hideTooltip);

    scene.addLayer(wake);
    scene.addLayer(pulse);
    scene.addLayer(body);
    wakeRef.current = wake;
    pulseRef.current = pulse;
    bodyRef.current = body;

    return () => {
      [wakeRef, pulseRef, bodyRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
      hideTooltip();
    };
  }, [scene, vessels, selectedVessel]);

  return null;
}
