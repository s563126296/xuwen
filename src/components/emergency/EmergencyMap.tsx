import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { useDashboardStore } from '../../store/dashboardStore';
import EmergencyVideoDock from './EmergencyVideoDock';

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

// 台风"摩羯"路径（历史 + 当前 + 预测，坐标在地图可视范围内）
const TYPHOON_PATH = {
  // 历史轨迹（从东南方向接近）
  history: [
    [110.28, 20.38],
    [110.25, 20.36],
    [110.22, 20.34],
    [110.20, 20.32],
  ] as [number, number][],
  // 预测路径（继续向西北移动到徐闻港）
  forecast: [
    [110.18, 20.30],
    [110.16, 20.27],
    [110.141114, 20.233385], // 徐闻港
  ] as [number, number][],
};

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const typhoonMarkerRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const points = useDashboardStore((s) => s.emergencyState.resourcePoints);
  const specialVehicles = useDashboardStore((s) => s.emergencyState.specialVehicles);
  const isDroneDeployed = useDashboardStore((s) => s.emergencyState.isDroneDeployed);
  const typhoon = useDashboardStore((s) => s.emergencyState.typhoon);
  const currentStranded = useDashboardStore((s) => s.emergencyState.forecast.currentStrandedVehicles);

  // 根据台风距离计算当前位置（线性插值）
  const getTyphoonPosition = (distance: number): [number, number] => {
    const maxDistance = 85; // 初始距离
    const ratio = 1 - (distance / maxDistance);
    const totalPath = [...TYPHOON_PATH.history, ...TYPHOON_PATH.forecast];
    const idx = Math.min(Math.floor(ratio * (totalPath.length - 1)), totalPath.length - 2);
    const t = (ratio * (totalPath.length - 1)) - idx;
    const p1 = totalPath[idx];
    const p2 = totalPath[idx + 1];
    return [
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t,
    ];
  };

  useEffect(() => {
    let destroyed = false;

    AMapLoader.load({
      key: 'd68ecc01797b67df1d265f2aa29ebc87',
      version: '2.0',
      plugins: ['AMap.Scale'],
    }).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 11.5,
        center: [110.18, 20.28],
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

      // Dynamic parking usage rates
      const p1Usage = Math.min(100, Math.round(currentStranded / 3200 * 82));
      const p2Usage = Math.min(100, Math.round(currentStranded / 3200 * 46));
      const p1Color = p1Usage >= 80 ? '#FF4757' : p1Usage >= 60 ? '#F5A623' : '#00D0E9';
      const p2Color = p2Usage >= 80 ? '#FF4757' : p2Usage >= 60 ? '#F5A623' : '#00D0E9';

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
          // Close any existing info window first
          if ((map as any)._currentInfoWindow) {
            (map as any)._currentInfoWindow.close();
          }

          // Build parking usage bar for parking type
          const parkingBar = point.type === 'parking'
            ? `<div style="margin-top:8px;">
                <div style="font-size:10px;color:#64748B;margin-bottom:4px;">停车区使用率</div>
                ${point.id === 'p1'
                  ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-1</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:${p1Usage}%;height:100%;background:${p1Color};border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:${p1Color};width:28px;">${p1Usage}%</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-2</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:${p2Usage}%;height:100%;background:${p2Color};border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:${p2Color};width:28px;">${p2Usage}%</span>
                    </div>`
                  : `<div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:10px;color:#94A3B8;width:28px;">P-2</span>
                      <div style="flex:1;height:6px;background:#1E293B;border-radius:3px;overflow:hidden;">
                        <div style="width:${p2Usage}%;height:100%;background:${p2Color};border-radius:3px;"></div>
                      </div>
                      <span style="font-size:10px;color:${p2Color};width:28px;">${p2Usage}%</span>
                    </div>`
                }
              </div>`
            : '';

          const statusLabel = point.status === 'critical' ? '严重' : point.status === 'warning' ? '告警' : '正常';
          const statusBg = point.status === 'critical' ? '#FF475722' : point.status === 'warning' ? '#F5A62322' : '#00D0E922';
          const statusTextColor = point.status === 'critical' ? '#FF4757' : point.status === 'warning' ? '#F5A623' : '#00D0E9';

          // Create content element with working close button
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = `
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
                <div style="font-size:13px;font-weight:700;color:#E2E8F0;flex:1;margin-right:8px;">${point.name}</div>
                <div style="
                  font-size:10px;padding:2px 7px;border-radius:3px;
                  background:${statusBg};color:${statusTextColor};font-weight:600;flex-shrink:0;
                ">${statusLabel}</div>
                <div class="em-info-close" style="
                  width:20px;height:20px;margin-left:6px;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  cursor:pointer;color:#94A3B8;font-size:14px;
                  border-radius:4px;background:rgba(255,255,255,0.06);
                ">✕</div>
              </div>
              <div style="font-size:11px;color:#94A3B8;line-height:1.5;">${point.detail}</div>
              ${parkingBar}
            </div>
          `;

          const info = new AMap.InfoWindow({
            content: contentDiv,
            offset: new AMap.Pixel(0, -32),
            isCustom: true,
          });
          info.open(map, point.position);
          (map as any)._currentInfoWindow = info;

          // Bind close button after DOM is ready
          setTimeout(() => {
            const closeBtn = contentDiv.querySelector('.em-info-close');
            if (closeBtn) {
              closeBtn.addEventListener('click', () => info.close());
            }
          }, 50);
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

      // === 台风路径可视化 ===

      // 历史轨迹（实线，橙红色）
      map.add(new AMap.Polyline({
        path: TYPHOON_PATH.history,
        strokeColor: '#FF6B35',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        zIndex: 100,
        lineJoin: 'round',
      }));

      // 历史轨迹点
      TYPHOON_PATH.history.forEach((pos) => {
        map.add(new AMap.Marker({
          position: pos,
          content: `<div style="width:8px;height:8px;border-radius:50%;background:#FF6B35;border:2px solid #FF6B3566;"></div>`,
          offset: new AMap.Pixel(-4, -4),
          zIndex: 101,
        }));
      });

      // 预测路径（虚线，红色）
      const forecastFullPath = [TYPHOON_PATH.history[TYPHOON_PATH.history.length - 1], ...TYPHOON_PATH.forecast];
      map.add(new AMap.Polyline({
        path: forecastFullPath,
        strokeColor: '#FF4757',
        strokeWeight: 2,
        strokeOpacity: 0.5,
        strokeStyle: 'dashed',
        strokeDasharray: [8, 4],
        zIndex: 100,
        lineJoin: 'round',
      }));

      // 台风当前位置标记
      const typhoonPos = getTyphoonPosition(typhoon.distance);
      const typhoonMarker = new AMap.Marker({
        position: typhoonPos,
        content: `
          <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;border:2px dashed #FF475788;animation:typhoonSpin 4s linear infinite;"></div>
            <div style="position:absolute;inset:8px;border-radius:50%;background:radial-gradient(circle,#FF475744 0%,transparent 70%);animation:typhoonPulse 2s ease-in-out infinite;"></div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position:relative;z-index:1;animation:typhoonSpin 3s linear infinite reverse;">
              <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" fill="#FF4757" opacity="0.6"/>
              <path d="M2 12C2 12 6 8 12 8C18 8 22 12 22 12C22 12 18 16 12 16C6 16 2 12 2 12Z" fill="#FF4757" opacity="0.6"/>
              <circle cx="12" cy="12" r="4" fill="#FF4757"/>
              <circle cx="12" cy="12" r="2" fill="#0A0F19"/>
            </svg>
            <div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:2px 8px;border-radius:4px;background:rgba(10,15,25,0.92);border:1px solid #FF475744;">
              <span style="font-size:10px;font-weight:700;color:#FF4757;">台风"${typhoon.name}" ${typhoon.distance}km</span>
            </div>
          </div>
        `,
        offset: new AMap.Pixel(-30, -30),
        zIndex: 300,
      });
      map.add(typhoonMarker);
      typhoonMarkerRef.current = typhoonMarker;

      // === 无人机巡查路线（青色虚线环路）===
      // drone point → P-1 → supply point → P-2 → back to drone point
      const dronePatrolPath: [number, number][] = [
        [110.1574, 20.2911], // d1 drone point
        [110.1465, 20.243],  // p1 parking
        [110.1505, 20.263],  // s1 supply
        [110.158, 20.289],   // p2 parking
        [110.1574, 20.2911], // back to drone
      ];
      map.add(new AMap.Polyline({
        path: dronePatrolPath,
        strokeColor: '#00FFFF',
        strokeWeight: 2,
        strokeOpacity: 0.4,
        strokeStyle: 'dashed',
        strokeDasharray: [6, 4],
        zIndex: 120,
        lineJoin: 'round',
      }));

      // === 特殊车辆标注 ===
      specialVehicles.forEach((v) => {
        const isCold = v.type === 'cold_chain';
        const vColor = v.alertLevel === 'red' ? '#FF4757' : v.alertLevel === 'orange' ? '#FF6B35' : v.alertLevel === 'yellow' ? '#F5A623' : (isCold ? '#00D0E9' : '#FF4757');
        const vLabel = isCold ? '冷' : '危';
        const pulseAnim = v.alertLevel === 'red' || v.alertLevel === 'orange' ? 'animation:svPulse 1.5s infinite;' : '';

        const marker = new AMap.Marker({
          position: v.position,
          content: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
            <div style="width:22px;height:22px;border-radius:4px;background:${vColor};display:flex;align-items:center;justify-content:center;color:#0A0F19;font-size:10px;font-weight:700;box-shadow:0 0 8px ${vColor}66;${pulseAnim}">${vLabel}</div>
            <div style="padding:1px 4px;border-radius:2px;background:rgba(10,15,25,0.9);font-size:8px;color:${vColor};white-space:nowrap;">${v.plateNumber.slice(-5)}</div>
          </div>`,
          offset: new AMap.Pixel(-11, -26),
          zIndex: 180,
        });

        marker.on('click', () => {
          if ((map as any)._currentInfoWindow) (map as any)._currentInfoWindow.close();
          const fuelBar = v.fuelLevel !== undefined
            ? `<div style="margin-top:6px;"><span style="font-size:10px;color:#64748B;">燃油: </span><span style="font-size:10px;color:${v.fuelLevel < 30 ? '#FF4757' : '#E2E8F0'};font-weight:600;">${v.fuelLevel}%</span></div>`
            : '';
          const noteHtml = v.notes ? `<div style="margin-top:6px;padding:4px 6px;border-radius:3px;background:rgba(255,71,87,0.1);font-size:10px;color:#FF4757;">⚠ ${v.notes}</div>` : '';
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = `<div style="padding:10px 12px;background:rgba(10,15,25,0.95);border:1px solid ${vColor}55;border-radius:8px;min-width:180px;box-shadow:0 4px 20px rgba(0,0,0,0.6);position:relative;">
            <div style="font-size:12px;font-weight:700;color:#E2E8F0;">${v.plateNumber}</div>
            <div style="font-size:10px;color:${vColor};margin-top:2px;">${isCold ? '冷链车' : '危化品车'} · ${v.cargoType || ''}</div>
            <div style="margin-top:6px;font-size:10px;color:#94A3B8;">滞留 ${v.strandedHours}h · 起始 ${v.strandedSince}</div>
            ${fuelBar}${noteHtml}
            <div class="em-info-close" style="position:absolute;top:6px;right:6px;width:16px;height:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#94A3B8;font-size:12px;border-radius:3px;background:rgba(255,255,255,0.06);">✕</div>
          </div>`;
          const info = new AMap.InfoWindow({ content: contentDiv, offset: new AMap.Pixel(0, -28), isCustom: true });
          info.open(map, v.position);
          (map as any)._currentInfoWindow = info;
          setTimeout(() => {
            const closeBtn = contentDiv.querySelector('.em-info-close');
            if (closeBtn) closeBtn.addEventListener('click', () => info.close());
          }, 50);
        });

        map.add(marker);
      });

      setMapReady(true);
    }).catch(() => {
      // Map loading failed - handled by UI state
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) mapInstance.current.destroy();
    };
  }, [points]);

  // 监听台风距离变化，更新台风位置
  useEffect(() => {
    if (!typhoonMarkerRef.current) return;
    const newPos = getTyphoonPosition(typhoon.distance);
    typhoonMarkerRef.current.setPosition(newPos);
    typhoonMarkerRef.current.setContent(`
      <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;border:2px dashed #FF475788;animation:typhoonSpin 4s linear infinite;"></div>
        <div style="position:absolute;inset:8px;border-radius:50%;background:radial-gradient(circle,#FF475744 0%,transparent 70%);animation:typhoonPulse 2s ease-in-out infinite;"></div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position:relative;z-index:1;animation:typhoonSpin 3s linear infinite reverse;">
          <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" fill="#FF4757" opacity="0.6"/>
          <path d="M2 12C2 12 6 8 12 8C18 8 22 12 22 12C22 12 18 16 12 16C6 16 2 12 2 12Z" fill="#FF4757" opacity="0.6"/>
          <circle cx="12" cy="12" r="4" fill="#FF4757"/>
          <circle cx="12" cy="12" r="2" fill="#0A0F19"/>
        </svg>
        <div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:2px 8px;border-radius:4px;background:rgba(10,15,25,0.92);border:1px solid #FF475744;">
          <span style="font-size:10px;font-weight:700;color:#FF4757;">台风"${typhoon.name}" ${typhoon.distance}km</span>
        </div>
      </div>
    `);
  }, [typhoon.distance, typhoon.name]);

  // 无人机飞行动画
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (isDroneDeployed) {
      const droneContent = `<div style="display:flex;flex-direction:column;align-items:center;">
        <svg width="32" height="32" viewBox="0 0 32 32" style="animation:droneSpin 3s linear infinite;filter:drop-shadow(0 0 8px #00D0E9);">
          <line x1="6" y1="6" x2="26" y2="26" stroke="#00D0E9" stroke-width="2"/>
          <line x1="26" y1="6" x2="6" y2="26" stroke="#00D0E9" stroke-width="2"/>
          <circle cx="16" cy="16" r="4" fill="#00D0E9"/>
          <circle cx="6" cy="6" r="3" fill="none" stroke="#00D0E9" stroke-width="1.5"/>
          <circle cx="26" cy="6" r="3" fill="none" stroke="#00D0E9" stroke-width="1.5"/>
          <circle cx="6" cy="26" r="3" fill="none" stroke="#00D0E9" stroke-width="1.5"/>
          <circle cx="26" cy="26" r="3" fill="none" stroke="#00D0E9" stroke-width="1.5"/>
        </svg>
        <div style="margin-top:4px;padding:2px 6px;border-radius:3px;background:rgba(10,15,25,0.92);border:1px solid #00D0E955;font-size:9px;color:#00D0E9;white-space:nowrap;">UAV-01 巡查中</div>
      </div>`;
      if (droneMarkerRef.current) {
        droneMarkerRef.current.show();
      } else {
        const AMap = (window as any).AMap;
        if (AMap) {
          const marker = new AMap.Marker({
            position: [110.1574, 20.2911],
            content: droneContent,
            offset: new AMap.Pixel(-16, -16),
            zIndex: 350,
          });
          map.add(marker);
          droneMarkerRef.current = marker;
        }
      }
    } else {
      if (droneMarkerRef.current) droneMarkerRef.current.hide();
    }
  }, [isDroneDeployed]);

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
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>停车区 / 物资点 / 交警 / 无人机 / 特殊车辆</div>
      </div>

      {/* 右上角图例 */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: '停车区', color: '#00D0E9', char: '停' },
          { label: '物资点', color: '#00D0E9', char: '物' },
          { label: '交警', color: '#00D0E9', char: '警' },
          { label: '无人机', color: '#00D0E9', char: '机' },
          { label: '冷链车', color: '#00D0E9', char: '冷' },
          { label: '危化品', color: '#FF4757', char: '危' },
          { label: '告警', color: '#F5A623', char: '!' },
        ].map((item) => (
          <div key={item.char} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: item.char === '冷' || item.char === '危' ? '3px' : '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#0A0F19' }}>{item.char}</div>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 视频监控面板 */}
      <EmergencyVideoDock />

      <style>{`
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #FF4757; }
          50% { opacity: 0.5; box-shadow: 0 0 12px #FF4757; }
        }
        @keyframes typhoonSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes typhoonPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes svPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes droneSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
