import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { useDashboardStore } from '../../store/dashboardStore';

// 进港公路坐标（与指挥模式一致）
const JINGANG_ROAD: [number, number][] = [
  [110.160745, 20.306732],
  [110.157380, 20.291170],
  [110.153524, 20.278910],
  [110.150478, 20.264358],
  [110.147502, 20.250149],
  [110.143228, 20.245138],
  [110.141114, 20.233385],
];

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
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
        features: ['bg', 'road', 'building'],
      });

      // 深色背景 + 遮罩层（与指挥模式一致）
      if (mapRef.current) {
        mapRef.current.style.background = '#0A1929';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 25, 41, 0.3);
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: multiply;
        `;
        mapRef.current.appendChild(overlay);
      }

      mapInstance.current = map;

      // 实时路况图层
      map.add(new AMap.TileLayer.Traffic({
        zIndex: 10,
        autoRefresh: true,
        interval: 30,
      }));

      // 资源点位标注
      points.forEach((point) => {
        const color = point.status === 'critical' ? '#FF4757' : point.status === 'warning' ? '#F5A623' : '#00D0E9';
        const label = point.type === 'parking' ? '停' : point.type === 'supply' ? '物' : point.type === 'personnel' ? '警' : point.type === 'drone' ? '机' : '油';

        const marker = new AMap.Marker({
          position: point.position,
          content: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#0A0F19;font-size:12px;font-weight:700;box-shadow:0 0 12px ${color}88;">${label}</div>
            <div style="padding:2px 8px;border-radius:4px;background:rgba(10,15,25,0.92);border:1px solid ${color}55;color:#E2E8F0;font-size:11px;white-space:nowrap;">${point.name}</div>
          </div>`,
          offset: new AMap.Pixel(-14, -32),
          zIndex: 200,
        });

        marker.on('click', () => {
          // Build parking usage bar for parking type
          const parkingBar = point.type === 'parking'
            ? `<div style="margin-top:8px;">
                <div style="font-size:10px;color:#64748B;margin-bottom:4px;">停车区使用率</div>
                ${point.id === 'p1'
                  ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-1</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:82%;height:100%;background:#F5A623;border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:#F5A623;width:28px;">82%</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-2</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:46%;height:100%;background:#00D0E9;border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:#00D0E9;width:28px;">46%</span>
                    </div>`
                  : `<div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-2</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:46%;height:100%;background:#00D0E9;border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:#00D0E9;width:28px;">46%</span>
                    </div>`
                }
              </div>`
            : '';

          const statusLabel = point.status === 'critical' ? '严重' : point.status === 'warning' ? '告警' : '正常';
          const statusBg = point.status === 'critical' ? '#FF475722' : point.status === 'warning' ? '#F5A62322' : '#00D0E922';
          const statusTextColor = point.status === 'critical' ? '#FF4757' : point.status === 'warning' ? '#F5A623' : '#00D0E9';

          const infoContent = `
            <div style="
              padding:12px 14px;
              background:rgba(10,15,25,0.95);
              border:1px solid ${color}55;
              border-radius:8px;
              min-width:200px;
              max-width:240px;
              box-shadow:0 4px 20px rgba(0,0,0,0.6);
              position:relative;
            ">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div style="font-size:13px;font-weight:700;color:#E2E8F0;">${point.name}</div>
                <div style="
                  font-size:10px;padding:2px 7px;border-radius:3px;
                  background:${statusBg};color:${statusTextColor};font-weight:600;
                ">${statusLabel}</div>
              </div>
              <div style="font-size:11px;color:#94A3B8;line-height:1.5;">${point.detail}</div>
              ${parkingBar}
              <div id="close-info-btn" style="
                position:absolute;top:8px;right:8px;
                width:16px;height:16px;
                display:flex;align-items:center;justify-content:center;
                cursor:pointer;color:#64748B;font-size:12px;
                border-radius:3px;
              " onclick="this.closest('.amap-info-content-wrapper')?.querySelector('.amap-info-close')?.click()">✕</div>
            </div>
          `;

          const info = new AMap.InfoWindow({
            content: infoContent,
            offset: new AMap.Pixel(0, -32),
            isCustom: true,
          });
          info.open(map, point.position);
        });

        map.add(marker);
      });

      // 徐闻港标记
      map.add(new AMap.Marker({
        position: [110.141114, 20.233385],
        content: `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:6px;background:rgba(255,71,87,0.2);border:1px solid rgba(255,71,87,0.4);white-space:nowrap;">
          <div style="width:8px;height:8px;border-radius:50%;background:#FF4757;animation:portPulse 2s infinite;"></div>
          <span style="font-size:12px;font-weight:700;color:#FF4757">徐闻港 · 已停航</span>
        </div>`,
        offset: new AMap.Pixel(-60, -16),
        zIndex: 250,
      }));

      // 滞留车辆队列可视化（进港公路红色折线）
      const strandedLine = new AMap.Polyline({
        path: JINGANG_ROAD,
        strokeColor: '#FF4757',
        strokeWeight: 10,
        strokeOpacity: 0.6,
        zIndex: 150,
        lineJoin: 'round',
        lineCap: 'round',
      });
      map.add(strandedLine);

      setMapReady(true);
    }).catch((e: any) => {
      console.error('高德地图加载失败:', e);
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) mapInstance.current.destroy();
    };
  }, [points]);

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

      {/* 加载状态 */}
      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, background: '#0D1B2A',
        }}>
          <span style={{ fontSize: 14, color: '#475569' }}>加载应急地图...</span>
        </div>
      )}

      {/* 左上角标题 */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,71,87,0.18)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>应急资源部署地图</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>停车区 / 物资点 / 交警 / 无人机</div>
      </div>

      {/* 右上角图例 */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: '停车区', color: '#00D0E9', char: '停' },
          { label: '物资点', color: '#00D0E9', char: '物' },
          { label: '交警', color: '#00D0E9', char: '警' },
          { label: '无人机', color: '#00D0E9', char: '机' },
          { label: '告警', color: '#F5A623', char: '!' },
        ].map((item) => (
          <div key={item.char} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#0A0F19' }}>{item.char}</div>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes portPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #FF4757; }
          50% { opacity: 0.5; box-shadow: 0 0 12px #FF4757; }
        }
      `}</style>
    </div>
  );
}
