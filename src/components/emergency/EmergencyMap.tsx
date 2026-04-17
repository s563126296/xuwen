import { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const points = useDashboardStore((s) => s.emergencyState.resourcePoints);

  useEffect(() => {
    let destroyed = false;

    AMapLoader.load({
      key: 'd68ecc01797b67df1d265f2aa29ebc87',
      version: '2.0',
      plugins: ['AMap.Scale'],
    }).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12.8,
        center: [110.15, 20.265],
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
      });

      mapInstance.current = map;

      points.forEach((point) => {
        const color = point.status === 'critical' ? '#FF4757' : point.status === 'warning' ? '#F5A623' : '#00D0E9';
        const label = point.type === 'parking' ? '停' : point.type === 'supply' ? '物' : point.type === 'personnel' ? '警' : point.type === 'drone' ? '机' : '油';

        const marker = new AMap.Marker({
          position: point.position,
          content: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#0A0F19;font-size:12px;font-weight:700;box-shadow:0 0 10px ${color}66;">${label}</div>
            <div style="padding:2px 8px;border-radius:4px;background:rgba(10,15,25,0.88);border:1px solid ${color}55;color:#E2E8F0;font-size:11px;white-space:nowrap;">${point.name}</div>
          </div>`,
          offset: new AMap.Pixel(-13, -30),
          zIndex: 200,
        });

        marker.on('click', () => {
          const info = new AMap.InfoWindow({
            content: `<div style="padding:4px 6px;color:#111827;min-width:180px;"><strong>${point.name}</strong><div style="margin-top:6px;">${point.detail}</div></div>`,
            offset: new AMap.Pixel(0, -24),
          });
          info.open(map, point.position);
        });

        map.add(marker);
      });
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) mapInstance.current.destroy();
    };
  }, [points]);

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,71,87,0.18)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>D. 应急资源部署地图</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>停车区 / 物资发放点 / 交警部署点 / 无人机巡查点</div>
      </div>
    </div>
  );
}
