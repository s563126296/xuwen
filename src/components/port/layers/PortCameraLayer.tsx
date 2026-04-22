import { useEffect, useRef } from 'react';
import { PointLayer } from '@antv/l7';
import type { ILayer } from '@antv/l7-core';
import { useMapScene } from '../../map/MapSceneContext';
import { mapRowsToGcj } from '../../../utils/coordTransform';
import camerasData from '../../../data/geo/cameras.json';

const STATUS_COLOR: Record<string, string> = {
  normal: '#4da6ff',
  triggered: '#FF4757',
  offline: '#94A3B8',
};

function showTooltip(x: number, y: number, lines: string[]) {
  let el = document.getElementById('port-camera-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'port-camera-tooltip';
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
  el.style.top = (y - 70) + 'px';
}

function hideTooltip() {
  const el = document.getElementById('port-camera-tooltip');
  if (el) el.style.display = 'none';
}

export default function PortCameraLayer() {
  const scene = useMapScene();
  const pulseRef = useRef<ILayer | null>(null);
  const bodyRef = useRef<ILayer | null>(null);

  useEffect(() => {
    if (!scene) return;

    // 只显示进港相关的电子警察（ep- 前缀，排除 offline 以外的全部）
    const epCameras = (camerasData as any[]).filter((c) => c.id.startsWith('ep-'));
    const rows = epCameras.map((c) => ({
      lng: c.coordinates[0], lat: c.coordinates[1],
      name: c.name, status: c.status,
      captureCount: c.metadata?.captureCount || 0,
      todayViolations: c.metadata?.todayViolations || 0,
      color: STATUS_COLOR[c.status] || STATUS_COLOR.normal,
    }));
    const gcjRows = mapRowsToGcj(rows);

    // triggered 状态脉冲
    const triggeredRows = gcjRows.filter((r) => r.status === 'triggered');
    const pulse = new PointLayer({ zIndex: 7 })
      .source(triggeredRows, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle').size(22).color('#FF4757').style({ opacity: 0.2 }).animate(true);

    const body = new PointLayer({ zIndex: 8 })
      .source(gcjRows, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle').size(5).color('color').style({ opacity: 0.85, strokeWidth: 1, stroke: '#fff' });

    body.on('mousemove', (e: any) => {
      const p = e.feature?.properties;
      if (!p) return;
      const statusText = ({ normal: '正常', triggered: '触发预警', offline: '离线' } as Record<string, string>)[p.status] || '';
      showTooltip(e.x, e.y, [p.name, `${statusText} · 今日违规 ${p.todayViolations} 次`]);
    });
    body.on('mouseout', hideTooltip);

    scene.addLayer(pulse);
    scene.addLayer(body);
    pulseRef.current = pulse;
    bodyRef.current = body;

    return () => {
      [pulseRef, bodyRef].forEach((ref) => {
        if (ref.current) { scene.removeLayer(ref.current); ref.current = null; }
      });
      hideTooltip();
    };
  }, [scene]);

  return null;
}
