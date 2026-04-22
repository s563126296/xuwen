import { useEffect, useRef, useState } from 'react';
import { useEmergencyStore } from '../stores/emergencyStore';
import { loadAMap } from '../utils/amapLoader';
import {
  EMERGENCY_NODES,
  TYPHOON_PATH,
  STRANDED_CHAIN_PATH,
  PARKING_TRANSFER_PATHS,
  SUPPLY_LINE_PATHS,
  DRONE_PATROL_PATH,
  VEHICLE_POSITIONS_GEO,
  RECOVERY_PATH,
} from '../constants/emergencyMapCoords';
import { SEGMENT_STYLES } from '../constants/map';

export function useEmergencyMap(
  mapRef: React.RefObject<HTMLDivElement>,
) {
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  // 图层引用
  const strandedChainSegmentsRef = useRef<any[]>([]);
  const strandedChainLabelRef = useRef<any>(null);
  const typhoonMarkerRef = useRef<any>(null);
  const typhoonCircleRef = useRef<any>(null);
  const typhoonPathLineRef = useRef<any>(null);
  const nodeMarkersRef = useRef<Record<string, any>>({});
  const vehicleMarkersRef = useRef<Record<string, any>>({});

  const emergency = useEmergencyStore((s) => s.emergencyState);
  const {
    forecast,
    isDroneDeployed,
    portShutdown,
    resourcePoints,
    specialVehicles,
    tasks,
    typhoon,
  } = emergency;

  // 计算台风位置
  const typhoonProgress = Math.max(0, Math.min(1, 1 - typhoon.distance / 85));
  const typhoonIndex = Math.floor(typhoonProgress * (TYPHOON_PATH.length - 1));
  const typhoonPosition = TYPHOON_PATH[Math.min(typhoonIndex, TYPHOON_PATH.length - 1)];

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return;

    let destroyed = false;

    loadAMap(['AMap.Scale']).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12.5,
        center: [110.150, 20.260],
        mapStyle: 'amap://styles/dark',
        viewMode: '2D',
        features: ['bg', 'road', 'building'],
        showLabel: false,
      });

      mapInstance.current = map;

      // === 1. S548 进港大道滞留链（分段拥堵）===
      const segments: any[] = [];
      for (let i = 0; i < STRANDED_CHAIN_PATH.length - 1; i++) {
        const style = SEGMENT_STYLES[i];
        const segment = new AMap.Polyline({
          path: [STRANDED_CHAIN_PATH[i], STRANDED_CHAIN_PATH[i + 1]],
          strokeColor: style.color,
          strokeWeight: style.weight * 1.2,
          strokeOpacity: style.opacity,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 15,
        });
        map.add(segment);
        segments.push(segment);
      }
      strandedChainSegmentsRef.current = segments;

      // 滞留链标签
      const strandedLabel = new AMap.Text({
        text: `S548 进港大道\n${forecast.currentStrandedVehicles}辆滞留 · 峰值${forecast.peakStrandedVehicles}辆`,
        position: [
          (STRANDED_CHAIN_PATH[2][0] + STRANDED_CHAIN_PATH[3][0]) / 2 + 0.005,
          (STRANDED_CHAIN_PATH[2][1] + STRANDED_CHAIN_PATH[3][1]) / 2,
        ],
        style: {
          'background-color': `${SEGMENT_STYLES[SEGMENT_STYLES.length - 1].color}22`,
          border: `1px solid ${SEGMENT_STYLES[SEGMENT_STYLES.length - 1].color}55`,
          'border-radius': '7px',
          padding: '6px 10px',
          'font-size': '11px',
          color: SEGMENT_STYLES[SEGMENT_STYLES.length - 1].color,
          'white-space': 'pre-line',
          'text-align': 'center',
          'line-height': '1.5',
        },
        zIndex: 120,
      });
      map.add(strandedLabel);
      strandedChainLabelRef.current = strandedLabel;

      // === 2. 停车区分拨线 ===
      const p1Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 82));
      const p2Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 46));

      const parkingLine1 = new AMap.Polyline({
        path: PARKING_TRANSFER_PATHS.toP1,
        strokeColor: '#F5A623',
        strokeWeight: 5,
        strokeOpacity: 0.7,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [10, 6],
        zIndex: 14,
      });
      map.add(parkingLine1);

      const parkingLine2 = new AMap.Polyline({
        path: PARKING_TRANSFER_PATHS.toP2,
        strokeColor: '#F5A623',
        strokeWeight: 5,
        strokeOpacity: 0.7,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [10, 6],
        zIndex: 14,
      });
      map.add(parkingLine2);

      const parkingLabel = new AMap.Text({
        text: `停车分拨\nP-1 ${p1Usage}% · P-2 ${p2Usage}%`,
        position: [
          (PARKING_TRANSFER_PATHS.toP1[0][0] + PARKING_TRANSFER_PATHS.toP1[1][0]) / 2,
          (PARKING_TRANSFER_PATHS.toP1[0][1] + PARKING_TRANSFER_PATHS.toP1[1][1]) / 2,
        ],
        style: {
          'background-color': 'rgba(245,166,35,0.15)',
          border: '1px solid rgba(245,166,35,0.3)',
          'border-radius': '7px',
          padding: '6px 10px',
          'font-size': '11px',
          color: '#F5A623',
          'white-space': 'pre-line',
          'text-align': 'center',
          'line-height': '1.5',
        },
        zIndex: 120,
      });
      map.add(parkingLabel);

      // === 3. 物资配送线 ===
      const supplyLine = new AMap.Polyline({
        path: SUPPLY_LINE_PATHS.main,
        strokeColor: '#2ED573',
        strokeWeight: 4,
        strokeOpacity: 0.7,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [8, 6],
        zIndex: 14,
      });
      map.add(supplyLine);

      const supplyLabel = new AMap.Text({
        text: '物资配送\n盒饭·饮水·燃油',
        position: EMERGENCY_NODES.supplyStation,
        style: {
          'background-color': 'rgba(46,213,115,0.15)',
          border: '1px solid rgba(46,213,115,0.3)',
          'border-radius': '7px',
          padding: '6px 10px',
          'font-size': '11px',
          color: '#2ED573',
          'white-space': 'pre-line',
          'text-align': 'center',
          'line-height': '1.5',
        },
        zIndex: 120,
      });
      map.add(supplyLabel);

      // === 4. 无人机巡查闭环 ===
      if (isDroneDeployed) {
        const droneLine = new AMap.Polyline({
          path: DRONE_PATROL_PATH,
          strokeColor: '#00D0E9',
          strokeWeight: 3,
          strokeOpacity: 0.6,
          lineJoin: 'round',
          strokeStyle: 'dashed',
          strokeDasharray: [6, 8],
          zIndex: 14,
        });
        map.add(droneLine);

        const droneLabel = new AMap.Text({
          text: '无人机巡查\nUAV-01巡查中',
          position: EMERGENCY_NODES.droneBase,
          style: {
            'background-color': 'rgba(0,208,233,0.15)',
            border: '1px solid rgba(0,208,233,0.3)',
            'border-radius': '7px',
            padding: '6px 10px',
            'font-size': '11px',
            color: '#00D0E9',
            'white-space': 'pre-line',
            'text-align': 'center',
            'line-height': '1.5',
          },
          zIndex: 120,
        });
        map.add(droneLabel);
      }

      // === 5. 台风预测路径 ===
      const typhoonPathLine = new AMap.Polyline({
        path: TYPHOON_PATH,
        strokeColor: '#FF4757',
        strokeWeight: 3,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [8, 8],
        zIndex: 12,
      });
      map.add(typhoonPathLine);
      typhoonPathLineRef.current = typhoonPathLine;

      // === 6. 复航疏散方向 ===
      const recoveryLine = new AMap.Polyline({
        path: RECOVERY_PATH,
        strokeColor: '#00D0E9',
        strokeWeight: 3,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        showDir: true,
        zIndex: 12,
      });
      map.add(recoveryLine);

      const recoveryLabel = new AMap.Text({
        text: '复航疏散方向',
        position: RECOVERY_PATH[2],
        style: {
          'background-color': 'rgba(0,208,233,0.15)',
          border: '1px solid rgba(0,208,233,0.3)',
          'border-radius': '7px',
          padding: '4px 8px',
          'font-size': '11px',
          color: '#00D0E9',
        },
        zIndex: 120,
      });
      map.add(recoveryLabel);

      // === 7. 台风影响圈 ===
      const typhoonCircle = new AMap.Circle({
        center: typhoonPosition,
        radius: 7000,
        strokeColor: '#FF4757',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        fillColor: '#FF4757',
        fillOpacity: 0.1,
        zIndex: 11,
      });
      map.add(typhoonCircle);
      typhoonCircleRef.current = typhoonCircle;

      // === 8. 台风 Marker ===
      const typhoonMarker = new AMap.Marker({
        position: typhoonPosition,
        content: `
          <div class="emergency-hazard emergency-hazard--typhoon">
            <div class="emergency-hazard__symbol">🌀</div>
            <div class="emergency-hazard__label">
              <div class="emergency-hazard__label-bg"></div>
              <div class="emergency-hazard__label-text">台风${typhoon.name}</div>
              <div class="emergency-hazard__caption">${typhoon.warningLevel}预警 / ${typhoon.distance}km</div>
            </div>
          </div>
        `,
        offset: new AMap.Pixel(-30, -60),
        zIndex: 150,
      });
      map.add(typhoonMarker);
      typhoonMarkerRef.current = typhoonMarker;

      // === 9. 固定节点 ===
      const executingTaskCount = tasks.filter((t) => t.status === 'executing' || t.status === 'arrived').length;

      const fixedNodeDefs = [
        {
          id: 'xuwen-port',
          position: EMERGENCY_NODES.xuwenPort,
          marker: '港',
          label: '徐闻港',
          caption: portShutdown ? '已停航' : '可通行',
          tone: portShutdown ? 'red' : 'green',
          shape: 'square',
          pulse: portShutdown,
        },
        {
          id: 'command-center',
          position: EMERGENCY_NODES.commandCenter,
          marker: '指',
          label: '县应急指挥点',
          caption: `${executingTaskCount}项执行中`,
          tone: 'cyan',
          shape: 'diamond',
        },
      ];

      const toneColors: Record<string, string> = {
        cyan: '#00D0E9',
        green: '#2ED573',
        amber: '#F5A623',
        red: '#FF4757',
        blue: '#60A5FA',
        muted: '#94A3B8',
      };

      fixedNodeDefs.forEach((node) => {
        const color = toneColors[node.tone];
        const marker = new AMap.Marker({
          position: node.position,
          content: `
            <div class="emergency-node emergency-node--${node.shape} ${node.pulse ? 'emergency-node--pulse' : ''}" data-tone="${node.tone}">
              <div class="emergency-node__halo" style="border-color:${color}33;box-shadow:0 0 16px ${color}22"></div>
              <div class="emergency-node__core" style="background:${color}22;border-color:${color}88;color:${color}">${node.marker}</div>
              <div class="emergency-node__pin" style="background:${color}55"></div>
              <div class="emergency-node__label">
                <div class="emergency-node__label-bg" style="background:rgba(10,15,25,0.88);border-color:${color}44"></div>
                <div class="emergency-node__label-text" style="color:${color}">${node.label}</div>
                <div class="emergency-node__caption-text">${node.caption}</div>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(-40, -90),
          zIndex: 200,
        });
        map.add(marker);
        nodeMarkersRef.current[node.id] = marker;
      });

      // === 10. 资源点 Marker ===
      resourcePoints.forEach((point) => {
        const position = (EMERGENCY_NODES as any)[point.id] || EMERGENCY_NODES.supplyStation;
        const marker = getResourceMarker(point);
        const color = getResourceColor(point.status);

        const resourceMarker = new AMap.Marker({
          position,
          content: `
            <div class="emergency-resource" data-status="${point.status}">
              <div class="emergency-resource__core" style="background:${color}22;border-color:${color}88;color:${color}">${marker}</div>
              <div class="emergency-resource__label">
                <div class="emergency-resource__name" style="color:${color}">${point.name.replace(' 港口周边', '').replace(' S376 交叉口', '')}</div>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(-16, -16),
          zIndex: 180,
        });
        map.add(resourceMarker);
        nodeMarkersRef.current[point.id] = resourceMarker;
      });

      // === 11. 特殊车辆 Marker ===
      specialVehicles.forEach((vehicle) => {
        const position = VEHICLE_POSITIONS_GEO[vehicle.id] || EMERGENCY_NODES.xuwenPort;
        const marker = vehicle.type === 'hazardous' ? '危' : vehicle.type === 'lithium_battery' ? '锂' : '冷';
        const color = getAlertColor(vehicle.alertLevel);

        const vehicleMarker = new AMap.Marker({
          position,
          content: `
            <div class="emergency-vehicle" data-alert="${vehicle.alertLevel}">
              <div class="emergency-vehicle__core" style="background:${color}22;border-color:${color}88;color:${color}">${marker}</div>
            </div>
          `,
          offset: new AMap.Pixel(-12, -12),
          zIndex: 170,
        });
        map.add(vehicleMarker);
        vehicleMarkersRef.current[vehicle.id] = vehicleMarker;
      });

      setMapReady(true);
    }).catch((err: any) => {
      setMapError(err.message || '高德地图 API 加载失败');
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  // 动态更新：台风位置
  useEffect(() => {
    if (!mapReady) return;
    if (typhoonMarkerRef.current && typhoonCircleRef.current) {
      typhoonMarkerRef.current.setPosition(typhoonPosition);
      typhoonCircleRef.current.setCenter(typhoonPosition);
    }
  }, [typhoonPosition, mapReady]);

  return {
    mapInstance,
    mapReady,
    mapError,
  };
}

// 辅助函数
function getResourceMarker(point: { type: string }): string {
  const markerMap: Record<string, string> = {
    parking: 'P',
    supply: '物',
    personnel: '警',
    drone: 'U',
    fuel: '油',
  };
  return markerMap[point.type] || '?';
}

function getResourceColor(status: string): string {
  const colorMap: Record<string, string> = {
    normal: '#00D0E9',
    warning: '#F5A623',
    critical: '#FF4757',
  };
  return colorMap[status] || '#00D0E9';
}

function getAlertColor(level: string): string {
  const colorMap: Record<string, string> = {
    green: '#2ED573',
    yellow: '#F5A623',
    orange: '#FF6B35',
    red: '#FF4757',
  };
  return colorMap[level] || '#94A3B8';
}
