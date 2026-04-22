import { useEffect, useRef, useState } from 'react';
import { loadAMap } from '../utils/amapLoader';
import { XUWEN_PORT, JINGANG_ROAD, SEGMENT_STYLES } from '../constants';

export interface MapRefs {
  diversionLineRef: React.MutableRefObject<any>;
  diversionLabelRef: React.MutableRefObject<any>;
  pulseLineRef: React.MutableRefObject<any>;
  droneMarkerRef: React.MutableRefObject<any>;
}

export function useAMapInit(
  mapRef: React.RefObject<HTMLDivElement>,
  onMapClick: () => void,
  selectedPerson: { position: [number, number] } | null,
) {
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const diversionLineRef = useRef<any>(null);
  const diversionLabelRef = useRef<any>(null);
  const pulseLineRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);

  // Store selectedPerson in a ref so map event handlers always see latest
  const selectedPersonRef = useRef(selectedPerson);
  selectedPersonRef.current = selectedPerson;

  // Expose a callback ref for popup position updates
  const popupUpdateCallbackRef = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    let destroyed = false;

    loadAMap(['AMap.Scale', 'AMap.Driving']).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center: [110.150, 20.270],
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
        features: ['bg', 'road', 'building'],
      });

      // 手动设置深色背景
      if (mapRef.current) {
        mapRef.current.style.background = '#0A1929';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 25, 41, 0.25);
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: multiply;
        `;
        mapRef.current.appendChild(overlay);
      }
      mapInstance.current = map;

      map.on('click', onMapClick);

      // 地图缩放/平移时更新弹窗位置
      const updatePopupPosition = () => {
        if (selectedPersonRef.current && mapInstance.current && popupUpdateCallbackRef.current) {
          const pixel = mapInstance.current.lngLatToContainer(
            new AMap.LngLat(
              selectedPersonRef.current.position[0],
              selectedPersonRef.current.position[1]
            )
          );
          popupUpdateCallbackRef.current(pixel.getX(), pixel.getY());
        }
      };

      map.on('moveend', updatePopupPosition);
      map.on('zoomend', updatePopupPosition);

      // 实时路况图层
      map.add(new AMap.TileLayer.Traffic({
        zIndex: 10,
        autoRefresh: true,
        interval: 30,
      }));

      // 进港公路拥堵热力渐变（分段显示）
      const congestionSegments: any[] = [];
      const glowSegments: any[] = [];

      for (let i = 0; i < JINGANG_ROAD.length - 1; i++) {
        const style = SEGMENT_STYLES[i];
        const segmentPath = [JINGANG_ROAD[i], JINGANG_ROAD[i + 1]];

        const segment = new AMap.Polyline({
          path: segmentPath,
          strokeColor: style.color,
          strokeWeight: style.weight,
          strokeOpacity: style.opacity,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 15,
          isOutline: true,
          outlineColor: style.color + '66',
          borderWeight: 2,
        });
        map.add(segment);
        congestionSegments.push(segment);

        if (i >= 3) {
          const glow = new AMap.Polyline({
            path: segmentPath,
            strokeColor: style.color,
            strokeWeight: style.weight + 8,
            strokeOpacity: 0.15,
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 14,
          });
          map.add(glow);
          glowSegments.push(glow);
        }
      }

      // S376分流路线
      const huasiPos = JINGANG_ROAD[1];
      const diversionLine = new AMap.Polyline({
        path: [
          huasiPos,
          [huasiPos[0] - 0.018, huasiPos[1] - 0.015],
          [huasiPos[0] - 0.022, huasiPos[1] - 0.032],
          [huasiPos[0] - 0.016, huasiPos[1] - 0.042],
          XUWEN_PORT,
        ],
        strokeColor: '#2ED573',
        strokeWeight: 4,
        strokeOpacity: 0.6,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [10, 5],
        zIndex: 14,
      });
      map.add(diversionLine);
      diversionLineRef.current = diversionLine;

      const diversionLabel = new AMap.Text({
        text: 'S376 建议分流路线',
        position: [huasiPos[0] - 0.022, huasiPos[1] - 0.025],
        style: {
          'font-size': '11px',
          'font-weight': '600',
          color: '#2ED573',
          'background-color': 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          'border-radius': '4px',
          padding: '3px 8px',
        },
      });
      map.add(diversionLabel);
      diversionLabelRef.current = diversionLabel;

      // PLACEHOLDER_CHECKPOINT_MARKERS

      // 卡口标记
      const cpDefs = [
        { name: '城区路口', idx: 0, flow: 480 },
        { name: '华四村', idx: 1, flow: 520 },
        { name: '高速入口', idx: 2, flow: 390 },
        { name: '南山上村', idx: 4, flow: 350 },
        { name: '港口入口', idx: 5, flow: 310 },
      ];
      cpDefs.forEach((cp) => {
        map.add(new AMap.Marker({
          position: JINGANG_ROAD[cp.idx],
          content: `<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:4px;background:rgba(0,208,233,0.15);border:1px solid rgba(0,208,233,0.3);white-space:nowrap;">
            <div style="width:6px;height:6px;border-radius:50%;background:#00D0E9"></div>
            <span style="font-size:12px;color:#00D0E9;font-weight:600">${cp.name}</span>
            <span style="font-size:11px;color:#94A3B8;font-family:monospace">${cp.flow}辆/h</span>
          </div>`,
          offset: new AMap.Pixel(-40, -12),
        }));
      });

      // 徐闻港标记
      map.add(new AMap.Marker({
        position: XUWEN_PORT,
        content: `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:6px;background:rgba(220,38,38,0.2);border:1px solid rgba(220,38,38,0.4);white-space:nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4757" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style="font-size:12px;font-weight:700;color:#FF4757">徐闻港 · 排队3.2km</span>
        </div>`,
        offset: new AMap.Pixel(-80, -20),
      }));

      // PLACEHOLDER_DRONE_MARKER

      // 无人机 Marker（初始隐藏）
      const droneMarker = new AMap.Marker({
        position: JINGANG_ROAD[1],
        content: `
          <div style="
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%,-50%);
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 1px dashed rgba(255,255,255,0.2);
              animation: dronePulse 3s ease-in-out infinite;
            "></div>
            <div style="
              position: absolute;
              top: 65%;
              left: 50%;
              width: 1px;
              height: 35px;
              background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent);
              transform: translateX(-50%);
            "></div>
            <svg viewBox="-28 -22 56 44" width="64" height="52" style="position:absolute;top:8px;left:8px;animation:droneRotorSpin 3s linear infinite;">
              <line x1="-20" y1="-14" x2="20" y2="14" stroke="#FFF" stroke-width="3"/>
              <line x1="20" y1="-14" x2="-20" y2="14" stroke="#FFF" stroke-width="3"/>
              <ellipse cx="0" cy="0" rx="12" ry="9" fill="#FFF"/>
              <ellipse cx="0" cy="-1" rx="7" ry="4" fill="#C8D0D8" opacity="0.5"/>
              <circle cx="-20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
              <circle cx="20" cy="-14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
              <circle cx="-20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
              <circle cx="20" cy="14" r="7" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
              <circle cx="0" cy="0" r="3" fill="#00FF88">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div style="
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.85);
              border: 1px solid rgba(255,255,255,0.25);
              border-radius: 4px;
              padding: 2px 8px;
              white-space: nowrap;
              text-align: center;
            ">
              <div style="font-size: 11px;color: #FFF;font-weight: 700;">无人机-01</div>
              <div style="font-size: 11px;color: #A0AAB8;">巡逻中</div>
            </div>
          </div>
        `,
        offset: new AMap.Pixel(-40, -40),
        zIndex: 300,
        visible: false,
      });
      map.add(droneMarker);
      droneMarkerRef.current = droneMarker;

      setMapReady(true);

      // 进港大道脉冲叠加线
      const pulseLine = new AMap.Polyline({
        path: JINGANG_ROAD,
        strokeColor: '#00D0E9',
        strokeWeight: 2,
        strokeOpacity: 0,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 16,
      });
      map.add(pulseLine);
      pulseLineRef.current = pulseLine;

      // 用 Driving API 获取贴合道路的真实路径
      AMap.plugin('AMap.Driving', () => {
        const driving = new AMap.Driving({
          map: undefined,
          policy: AMap.DrivingPolicy.LEAST_TIME,
        });

        const start = new AMap.LngLat(JINGANG_ROAD[0][0], JINGANG_ROAD[0][1]);
        const end = new AMap.LngLat(JINGANG_ROAD[JINGANG_ROAD.length - 1][0], JINGANG_ROAD[JINGANG_ROAD.length - 1][1]);
        const waypoints = JINGANG_ROAD.slice(1, -1).map(p => new AMap.LngLat(p[0], p[1]));

        driving.search(start, end, { waypoints }, (status: string, result: any) => {
          if (destroyed) return;

          if (status === 'complete' && result?.routes?.[0]) {
            const route = result.routes[0];
            const realPath: [number, number][] = [];

            route.steps.forEach((step: any) => {
              if (step.path && Array.isArray(step.path)) {
                step.path.forEach((p: any) => {
                  const lng = typeof p.getLng === 'function' ? p.getLng() : p.lng;
                  const lat = typeof p.getLat === 'function' ? p.getLat() : p.lat;
                  if (lng && lat) {
                    realPath.push([lng, lat]);
                  }
                });
              }
            });

            if (realPath.length > 10) {
              const segmentSize = Math.floor(realPath.length / 6);
              congestionSegments.forEach((segment, i) => {
                const start = i * segmentSize;
                const end = i === 5 ? realPath.length : (i + 1) * segmentSize;
                segment.setPath(realPath.slice(start, end));
              });

              glowSegments.forEach((glow, i) => {
                const segmentIndex = i + 3;
                const start = segmentIndex * segmentSize;
                const end = segmentIndex === 5 ? realPath.length : (segmentIndex + 1) * segmentSize;
                glow.setPath(realPath.slice(start, end));
              });

              pulseLine.setPath(realPath);
            }
          }
        });
      });
    }).catch(() => {
      // Map loading failed - handled by UI state
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  return {
    mapInstance,
    mapReady,
    diversionLineRef,
    diversionLabelRef,
    pulseLineRef,
    droneMarkerRef,
    popupUpdateCallbackRef,
  };
}
