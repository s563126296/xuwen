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
  G207_PATH,
  S376_PATH,
} from '../constants/emergencyMapCoords';
import { SEGMENT_STYLES } from '../constants/map';

const TONE_COLORS: Record<string, string> = {
  cyan: '#00D0E9', green: '#2ED573', amber: '#F5A623',
  red: '#FF4757', blue: '#60A5FA', muted: '#94A3B8',
};

export function useEmergencyMap(mapRef: React.RefObject<HTMLDivElement>) {
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  // 动态图层引用
  const strandedSegmentsRef = useRef<any[]>([]);
  const strandedLabelRef = useRef<any>(null);
  const parkingLabelsRef = useRef<Record<string, any>>({});
  const typhoonMarkerRef = useRef<any>(null);
  const typhoonCircleRef = useRef<any>(null);
  const typhoonInnerCircleRef = useRef<any>(null);
  const portMarkerRef = useRef<any>(null);
  const droneLineRef = useRef<any>(null);
  const droneLabelRef = useRef<any>(null);
  const vehicleMarkersRef = useRef<Record<string, any>>({});

  const emergency = useEmergencyStore((s) => s.emergencyState);
  const {
    emergencyLevel,
    forecast,
    isDroneDeployed,
    phaseLabel,
    portShutdown,
    specialVehicles,
    tasks,
    typhoon,
  } = emergency;

  // 台风位置计算
  const typhoonProgress = Math.max(0, Math.min(1, 1 - typhoon.distance / 85));

  // 初始化地图 + 绘制所有图层
  useEffect(() => {
    if (!mapRef.current) return;
    let destroyed = false;

    loadAMap(['AMap.Scale']).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12.8,
        center: [110.150, 20.265],
        mapStyle: 'amap://styles/dark',
        viewMode: '2D',
        features: ['bg', 'road', 'building'],
        showLabel: false,
      });
      mapInstance.current = map;

      // ========== 图层 1: 周边道路网络 ==========

      // G207 国道
      map.add(new AMap.Polyline({
        path: G207_PATH,
        strokeColor: '#94A3B8',
        strokeWeight: 5,
        strokeOpacity: 0.5,
        lineJoin: 'round', lineCap: 'round',
        zIndex: 12,
      }));
      map.add(new AMap.Text({
        text: 'G207 国道',
        position: G207_PATH[0],
        style: labelStyle('#94A3B8'),
        zIndex: 110,
      }));

      // S376 省道（分流走廊）
      map.add(new AMap.Polyline({
        path: S376_PATH,
        strokeColor: '#2ED573',
        strokeWeight: 4,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [12, 6],
        zIndex: 12,
      }));
      map.add(new AMap.Text({
        text: 'S376 分流走廊',
        position: [
          (S376_PATH[1][0] + S376_PATH[2][0]) / 2,
          (S376_PATH[1][1] + S376_PATH[2][1]) / 2,
        ],
        style: labelStyle('#2ED573'),
        zIndex: 110,
      }));

      // ========== 图层 2: S548 进港大道滞留链（分段拥堵）==========

      const segments: any[] = [];
      for (let i = 0; i < STRANDED_CHAIN_PATH.length - 1; i++) {
        const style = SEGMENT_STYLES[i];
        const seg = new AMap.Polyline({
          path: [STRANDED_CHAIN_PATH[i], STRANDED_CHAIN_PATH[i + 1]],
          strokeColor: style.color,
          strokeWeight: style.weight * 1.3,
          strokeOpacity: style.opacity,
          lineJoin: 'round', lineCap: 'round',
          zIndex: 15,
        });
        map.add(seg);
        segments.push(seg);
      }
      strandedSegmentsRef.current = segments;

      // 滞留链标签
      const strandedLabel = new AMap.Text({
        text: formatStrandedLabel(forecast),
        position: midpoint(STRANDED_CHAIN_PATH[2], STRANDED_CHAIN_PATH[3], 0.006, 0),
        style: labelStyle(SEGMENT_STYLES[SEGMENT_STYLES.length - 1].color, true),
        zIndex: 120,
      });
      map.add(strandedLabel);
      strandedLabelRef.current = strandedLabel;

      // ========== 图层 3: 停车区分拨线 ==========

      const p1Usage = calcUsage(forecast.currentStrandedVehicles, 350);
      const p2Usage = calcUsage(forecast.currentStrandedVehicles, 280, 0.56);

      // P1 分拨线
      map.add(new AMap.Polyline({
        path: PARKING_TRANSFER_PATHS.toP1,
        strokeColor: '#F5A623', strokeWeight: 4, strokeOpacity: 0.7,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [10, 6],
        zIndex: 14,
      }));

      // P2 分拨线
      map.add(new AMap.Polyline({
        path: PARKING_TRANSFER_PATHS.toP2,
        strokeColor: '#F5A623', strokeWeight: 4, strokeOpacity: 0.7,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [10, 6],
        zIndex: 14,
      }));

      // P3 分拨线（应急停车区）
      map.add(new AMap.Polyline({
        path: PARKING_TRANSFER_PATHS.toP3,
        strokeColor: '#F5A623', strokeWeight: 3, strokeOpacity: 0.5,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [8, 8],
        zIndex: 14,
      }));

      // 停车场标签
      const p1Label = new AMap.Text({
        text: `P1 停车场\n${p1Usage}% · 350车位`,
        position: EMERGENCY_NODES.parking1,
        style: labelStyle(usageColor(p1Usage), true),
        zIndex: 120,
      });
      map.add(p1Label);
      parkingLabelsRef.current['p1'] = p1Label;

      const p2Label = new AMap.Text({
        text: `P2 停车场\n${p2Usage}% · 280车位`,
        position: EMERGENCY_NODES.parking2,
        style: labelStyle(usageColor(p2Usage), true),
        zIndex: 120,
      });
      map.add(p2Label);
      parkingLabelsRef.current['p2'] = p2Label;

      const p3Label = new AMap.Text({
        text: `P3 应急停车区\n待启用 · 200车位`,
        position: EMERGENCY_NODES.parking3,
        style: labelStyle('#94A3B8', true),
        zIndex: 120,
      });
      map.add(p3Label);
      parkingLabelsRef.current['p3'] = p3Label;

      // ========== 图层 4: 物资配送线 ==========

      map.add(new AMap.Polyline({
        path: SUPPLY_LINE_PATHS.main,
        strokeColor: '#2ED573', strokeWeight: 4, strokeOpacity: 0.6,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [8, 6],
        showDir: true,
        zIndex: 14,
      }));
      map.add(new AMap.Polyline({
        path: SUPPLY_LINE_PATHS.toParking,
        strokeColor: '#2ED573', strokeWeight: 3, strokeOpacity: 0.5,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [6, 6],
        zIndex: 14,
      }));
      map.add(new AMap.Text({
        text: '物资配送\n盒饭·饮水·燃油',
        position: EMERGENCY_NODES.supplyStation,
        style: labelStyle('#2ED573', true),
        zIndex: 120,
      }));

      // ========== 图层 5: 无人机巡查闭环 ==========

      const droneLine = new AMap.Polyline({
        path: DRONE_PATROL_PATH,
        strokeColor: isDroneDeployed ? '#00D0E9' : '#94A3B8',
        strokeWeight: 3,
        strokeOpacity: isDroneDeployed ? 0.6 : 0.3,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [6, 8],
        zIndex: 14,
      });
      map.add(droneLine);
      droneLineRef.current = droneLine;

      const droneLabel = new AMap.Text({
        text: isDroneDeployed ? '无人机巡查\nUAV-01 巡查中' : '无人机巡查\n待派出',
        position: EMERGENCY_NODES.droneBase,
        style: labelStyle(isDroneDeployed ? '#00D0E9' : '#94A3B8', true),
        zIndex: 120,
      });
      map.add(droneLabel);
      droneLabelRef.current = droneLabel;

      // ========== 图层 6: 台风预测路径 ==========

      map.add(new AMap.Polyline({
        path: TYPHOON_PATH,
        strokeColor: '#FF4757', strokeWeight: 3, strokeOpacity: 0.5,
        lineJoin: 'round', strokeStyle: 'dashed', strokeDasharray: [8, 8],
        zIndex: 12,
      }));
      map.add(new AMap.Text({
        text: '台风预测路径',
        position: midpoint(TYPHOON_PATH[0], TYPHOON_PATH[1]),
        style: labelStyle('#FF4757'),
        zIndex: 110,
      }));

      // ========== 图层 7: 复航疏散方向 ==========

      map.add(new AMap.Polyline({
        path: RECOVERY_PATH,
        strokeColor: '#00D0E9', strokeWeight: 3, strokeOpacity: 0.5,
        lineJoin: 'round', showDir: true,
        zIndex: 12,
      }));
      map.add(new AMap.Text({
        text: '复航疏散方向',
        position: RECOVERY_PATH[2],
        style: labelStyle('#00D0E9'),
        zIndex: 110,
      }));

      // ========== 图层 8: 台风影响圈 + Marker ==========

      const tPos = interpolateTyphoon(typhoonProgress);

      const typhoonCircle = new AMap.Circle({
        center: tPos, radius: 7000,
        strokeColor: '#FF4757', strokeWeight: 2, strokeOpacity: 0.5,
        strokeStyle: 'dashed', strokeDasharray: [8, 6],
        fillColor: '#FF4757', fillOpacity: 0.06,
        zIndex: 11,
      });
      map.add(typhoonCircle);
      typhoonCircleRef.current = typhoonCircle;

      const typhoonInner = new AMap.Circle({
        center: tPos, radius: 4000,
        strokeColor: '#FF4757', strokeWeight: 1, strokeOpacity: 0.3,
        fillColor: '#FF4757', fillOpacity: 0.1,
        zIndex: 11,
      });
      map.add(typhoonInner);
      typhoonInnerCircleRef.current = typhoonInner;

      const typhoonMarker = new AMap.Marker({
        position: tPos,
        content: buildTyphoonHTML(typhoon),
        offset: new AMap.Pixel(-40, -70),
        zIndex: 150,
      });
      map.add(typhoonMarker);
      typhoonMarkerRef.current = typhoonMarker;

      // 停航影响圈
      map.add(new AMap.Circle({
        center: EMERGENCY_NODES.xuwenPort, radius: 3000,
        strokeColor: '#FF4757', strokeWeight: 2, strokeOpacity: 0.4,
        fillColor: '#FF4757', fillOpacity: 0.08,
        zIndex: 11,
      }));

      // ========== 图层 9: 固定节点 ==========

      const execCount = tasks.filter((t) => t.status === 'executing' || t.status === 'arrived').length;

      // 徐闻港
      const portMarker = new AMap.Marker({
        position: EMERGENCY_NODES.xuwenPort,
        content: buildNodeHTML('港', '徐闻港', portShutdown ? '已停航' : '可通行', portShutdown ? 'red' : 'green', 'square', portShutdown),
        offset: new AMap.Pixel(-40, -90),
        zIndex: 200,
      });
      map.add(portMarker);
      portMarkerRef.current = portMarker;

      // 县应急指挥中心
      map.add(new AMap.Marker({
        position: EMERGENCY_NODES.commandCenter,
        content: buildNodeHTML('指', '县应急指挥点', `${execCount}项执行中`, 'cyan', 'diamond', false),
        offset: new AMap.Pixel(-40, -90),
        zIndex: 200,
      }));

      // 路段关键节点
      const roadNodes = [
        { pos: EMERGENCY_NODES.g207Gate, marker: 'G', label: 'G207交叉口', caption: '北端入口', tone: 'amber' },
        { pos: EMERGENCY_NODES.huasiVillage, marker: 'H', label: '华四村', caption: '分流执行点', tone: 'green' },
        { pos: EMERGENCY_NODES.maichenTown, marker: 'M', label: '迈陈镇', caption: '停车引导', tone: 'amber' },
        { pos: EMERGENCY_NODES.nanshanTown, marker: 'N', label: '南山镇', caption: '物资发放', tone: 'green' },
        { pos: EMERGENCY_NODES.nearPort, marker: 'K', label: '近港区', caption: '重点管控', tone: 'red' },
      ];
      roadNodes.forEach((n) => {
        map.add(new AMap.Marker({
          position: n.pos,
          content: buildNodeHTML(n.marker, n.label, n.caption, n.tone, 'circle', false),
          offset: new AMap.Pixel(-40, -90),
          zIndex: 190,
        }));
      });

      // ========== 图层 10: 资源点 ==========

      // 警力部署点
      map.add(new AMap.Marker({
        position: EMERGENCY_NODES.policePoint1,
        content: buildResourceHTML('警', '中段执勤点', '#00D0E9'),
        offset: new AMap.Pixel(-16, -16),
        zIndex: 180,
      }));
      map.add(new AMap.Marker({
        position: EMERGENCY_NODES.policePoint2,
        content: buildResourceHTML('警', '迈陈镇执勤', '#00D0E9'),
        offset: new AMap.Pixel(-16, -16),
        zIndex: 180,
      }));

      // 加油站
      map.add(new AMap.Marker({
        position: EMERGENCY_NODES.fuelStation,
        content: buildResourceHTML('油', '移动加油车', '#F5A623'),
        offset: new AMap.Pixel(-16, -16),
        zIndex: 180,
      }));

      // ========== 图层 11: 特殊车辆 ==========

      specialVehicles.forEach((v) => {
        const pos = VEHICLE_POSITIONS_GEO[v.id] || EMERGENCY_NODES.xuwenPort;
        const marker = v.type === 'hazardous' ? '危' : v.type === 'lithium_battery' ? '锂' : '冷';
        const color = alertColor(v.alertLevel);
        const isPulsing = v.alertLevel === 'red' || v.alertLevel === 'orange';

        const vm = new AMap.Marker({
          position: pos,
          content: `
            <div class="emergency-vehicle ${isPulsing ? 'emergency-vehicle--pulse' : ''}" data-alert="${v.alertLevel}">
              <div class="emergency-vehicle__core" style="background:${color}22;border-color:${color}88;color:${color}">${marker}</div>
              <div class="emergency-vehicle__plate" style="color:${color}">${v.plateNumber}</div>
            </div>
          `,
          offset: new AMap.Pixel(-20, -20),
          zIndex: 170,
        });
        map.add(vm);
        vehicleMarkersRef.current[v.id] = vm;
      });

      // ========== 图层 12: 状态信息栏 ==========

      map.add(new AMap.Text({
        text: `${phaseLabel} · ${emergencyLevel}级响应 · 滞留${forecast.currentStrandedVehicles.toLocaleString()}辆 · 冷链${forecast.coldChainVehicles}辆 · 危化${forecast.hazardousVehicles}辆`,
        position: [110.130, 20.318],
        style: {
          'background-color': 'rgba(10,15,25,0.85)',
          border: `1px solid ${emergencyLevel === 'I' || emergencyLevel === 'II' ? '#FF475755' : '#F5A62355'}`,
          'border-radius': '8px',
          padding: '8px 14px',
          'font-size': '12px',
          color: emergencyLevel === 'I' || emergencyLevel === 'II' ? '#FF4757' : '#F5A623',
          'white-space': 'nowrap',
          'font-weight': '700',
        },
        zIndex: 300,
      }));

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
    const AMap = (window as any).AMap;
    if (!AMap) return;

    const tPos = interpolateTyphoon(typhoonProgress);

    if (typhoonMarkerRef.current) {
      typhoonMarkerRef.current.setPosition(new AMap.LngLat(tPos[0], tPos[1]));
      typhoonMarkerRef.current.setContent(buildTyphoonHTML(typhoon));
    }
    if (typhoonCircleRef.current) typhoonCircleRef.current.setCenter(new AMap.LngLat(tPos[0], tPos[1]));
    if (typhoonInnerCircleRef.current) typhoonInnerCircleRef.current.setCenter(new AMap.LngLat(tPos[0], tPos[1]));
  }, [typhoonProgress, typhoon, mapReady]);

  // 动态更新：滞留链标签
  useEffect(() => {
    if (!strandedLabelRef.current) return;
    strandedLabelRef.current.setText(formatStrandedLabel(forecast));
  }, [forecast]);

  // 动态更新：徐闻港状态
  useEffect(() => {
    if (!portMarkerRef.current) return;
    portMarkerRef.current.setContent(
      buildNodeHTML('港', '徐闻港', portShutdown ? '已停航' : '可通行', portShutdown ? 'red' : 'green', 'square', portShutdown)
    );
  }, [portShutdown]);

  // 动态更新：无人机状态
  useEffect(() => {
    if (!droneLineRef.current || !droneLabelRef.current) return;
    droneLineRef.current.setOptions({
      strokeColor: isDroneDeployed ? '#00D0E9' : '#94A3B8',
      strokeOpacity: isDroneDeployed ? 0.6 : 0.3,
    });
    droneLabelRef.current.setText(isDroneDeployed ? '无人机巡查\nUAV-01 巡查中' : '无人机巡查\n待派出');
    droneLabelRef.current.setStyle(labelStyle(isDroneDeployed ? '#00D0E9' : '#94A3B8', true));
  }, [isDroneDeployed]);

  return { mapInstance, mapReady, mapError };
}

// ========== 辅助函数 ==========

function interpolateTyphoon(progress: number): [number, number] {
  const idx = progress * (TYPHOON_PATH.length - 1);
  const i = Math.floor(idx);
  const t = idx - i;
  if (i >= TYPHOON_PATH.length - 1) return TYPHOON_PATH[TYPHOON_PATH.length - 1];
  return [
    TYPHOON_PATH[i][0] + (TYPHOON_PATH[i + 1][0] - TYPHOON_PATH[i][0]) * t,
    TYPHOON_PATH[i][1] + (TYPHOON_PATH[i + 1][1] - TYPHOON_PATH[i][1]) * t,
  ];
}

function midpoint(a: [number, number], b: [number, number], dx = 0, dy = 0): [number, number] {
  return [(a[0] + b[0]) / 2 + dx, (a[1] + b[1]) / 2 + dy];
}

function calcUsage(vehicles: number, _capacity: number, factor = 1): number {
  return Math.min(100, Math.round((vehicles / 3200) * 82 * factor));
}

function usageColor(pct: number): string {
  if (pct >= 90) return '#FF4757';
  if (pct >= 60) return '#F5A623';
  return '#2ED573';
}

function alertColor(level: string): string {
  return ({ normal: '#2ED573', yellow: '#F5A623', orange: '#FF6B35', red: '#FF4757' } as Record<string, string>)[level] || '#94A3B8';
}

function labelStyle(color: string, multiline = false): Record<string, string> {
  return {
    'background-color': `${color}18`,
    border: `1px solid ${color}44`,
    'border-radius': '7px',
    padding: multiline ? '6px 10px' : '4px 8px',
    'font-size': '11px',
    color,
    'white-space': multiline ? 'pre-line' : 'nowrap',
    'text-align': 'center',
    'line-height': '1.5',
  };
}

function formatStrandedLabel(forecast: { currentStrandedVehicles: number; peakStrandedVehicles: number }): string {
  return `S548 进港大道\n${forecast.currentStrandedVehicles.toLocaleString()}辆滞留 · 峰值${forecast.peakStrandedVehicles.toLocaleString()}辆`;
}

function buildNodeHTML(marker: string, label: string, caption: string, tone: string, shape: string, pulse: boolean): string {
  const color = TONE_COLORS[tone] || '#00D0E9';
  return `
    <div class="emergency-node emergency-node--${shape} ${pulse ? 'emergency-node--pulse' : ''}">
      <div class="emergency-node__halo" style="border-color:${color}33;box-shadow:0 0 16px ${color}22"></div>
      <div class="emergency-node__core" style="background:${color}22;border-color:${color}88;color:${color}">${marker}</div>
      <div class="emergency-node__pin" style="background:${color}55"></div>
      <div class="emergency-node__label">
        <div class="emergency-node__label-bg" style="background:rgba(10,15,25,0.88);border-color:${color}44"></div>
        <div class="emergency-node__label-text" style="color:${color}">${label}</div>
        <div class="emergency-node__caption-text">${caption}</div>
      </div>
    </div>
  `;
}

function buildResourceHTML(marker: string, name: string, color: string): string {
  return `
    <div class="emergency-resource">
      <div class="emergency-resource__core" style="background:${color}22;border-color:${color}88;color:${color}">${marker}</div>
      <div class="emergency-resource__label">
        <div class="emergency-resource__name" style="color:${color}">${name}</div>
      </div>
    </div>
  `;
}

function buildTyphoonHTML(typhoon: { name: string; warningLevel: string; distance: number }): string {
  return `
    <div class="emergency-hazard emergency-hazard--typhoon">
      <div class="emergency-hazard__symbol"></div>
      <div class="emergency-hazard__label">
        <div class="emergency-hazard__label-bg"></div>
        <div class="emergency-hazard__label-text">台风${typhoon.name}</div>
        <div class="emergency-hazard__caption">${typhoon.warningLevel}预警 / ${typhoon.distance}km</div>
      </div>
    </div>
  `;
}
