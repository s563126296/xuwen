import { useEffect, useRef, useState } from 'react';
import { useCommandStore } from '../stores/commandStore';
import { loadAMap } from '../utils/amapLoader';
import {
  COMMAND_NODES,
  MAIN_PRESSURE_PATH,
  S376_PATH,
  EMERGENCY_LANE_PATH,
  G207_PATH,
  BACK_PRESSURE_PATH,
  DIVERSION_RETURN_PATH,
} from '../constants/commandMapCoords';
import { SEGMENT_STYLES } from '../constants/map';

interface CommandMapRefs {
  mainPressureSegmentsRef: React.MutableRefObject<any[]>;
  mainPressureLabelRef: React.MutableRefObject<any>;
  s376LineRef: React.MutableRefObject<any>;
  s376LabelRef: React.MutableRefObject<any>;
  emergencyLaneRef: React.MutableRefObject<any>;
  emergencyLabelRef: React.MutableRefObject<any>;
  g207LineRef: React.MutableRefObject<any>;
  g207LabelRef: React.MutableRefObject<any>;
  backPressureLineRef: React.MutableRefObject<any>;
  diversionReturnRef: React.MutableRefObject<any>;
  nodeMarkersRef: React.MutableRefObject<Record<string, any>>;
  personMarkersRef: React.MutableRefObject<Record<string, any>>;
}

export function useCommandMap(
  mapRef: React.RefObject<HTMLDivElement>,
  onNodeClick: (id: string) => void,
) {
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');

  const mainPressureSegmentsRef = useRef<any[]>([]);
  const mainPressureLabelRef = useRef<any>(null);
  const s376LineRef = useRef<any>(null);
  const s376LabelRef = useRef<any>(null);
  const emergencyLaneRef = useRef<any>(null);
  const emergencyLabelRef = useRef<any>(null);
  const g207LineRef = useRef<any>(null);
  const g207LabelRef = useRef<any>(null);
  const backPressureLineRef = useRef<any>(null);
  const diversionReturnRef = useRef<any>(null);
  const nodeMarkersRef = useRef<Record<string, any>>({});
  const personMarkersRef = useRef<Record<string, any>>({});

  const commandState = useCommandStore((s) => s.commandState);
  const { congestionIndex, focusRoad, fieldPersons, strategies } = commandState;

  // 初始化地图
  useEffect(() => {
    console.log('[useCommandMap] useEffect triggered');
    console.log('[useCommandMap] mapRef.current:', mapRef.current);

    if (!mapRef.current) {
      console.warn('[useCommandMap] mapRef.current is null, skipping initialization');
      return;
    }

    console.log('[useCommandMap] mapRef dimensions:', {
      width: mapRef.current.offsetWidth,
      height: mapRef.current.offsetHeight,
      clientWidth: mapRef.current.clientWidth,
      clientHeight: mapRef.current.clientHeight,
    });

    let destroyed = false;

    console.log('[useCommandMap] Starting to load AMap...');
    loadAMap(['AMap.Scale']).then((AMap: any) => {
      console.log('[useCommandMap] AMap loaded:', AMap);

      if (destroyed) {
        console.warn('[useCommandMap] Component destroyed before map initialization');
        return;
      }

      if (!mapRef.current) {
        console.warn('[useCommandMap] mapRef.current is null after AMap load');
        return;
      }

      console.log('[useCommandMap] Creating map instance...');
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center: [110.150, 20.270],
        mapStyle: 'amap://styles/dark',
        viewMode: '2D',
        features: ['bg', 'road', 'building'],
        showLabel: false,
      });

      mapInstance.current = map;
      console.log('[useCommandMap] Map instance created:', map);
      console.log('[useCommandMap] Map container:', map.getContainer());

      // 实时路况图层
      map.add(new AMap.TileLayer.Traffic({
        zIndex: 10,
        autoRefresh: true,
        interval: 30,
      }));

      // === 绘制走廊 ===

      // 1. G207 城区来车路径
      const g207Line = new AMap.Polyline({
        path: G207_PATH,
        strokeColor: '#94A3B8',
        strokeWeight: 6,
        strokeOpacity: 0.6,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 14,
      });
      map.add(g207Line);
      g207LineRef.current = g207Line;

      // 2. 进港大道压力链（分段拥堵）
      const segments: any[] = [];
      for (let i = 0; i < MAIN_PRESSURE_PATH.length - 1; i++) {
        const style = SEGMENT_STYLES[i];
        const segment = new AMap.Polyline({
          path: [MAIN_PRESSURE_PATH[i], MAIN_PRESSURE_PATH[i + 1]],
          strokeColor: style.color,
          strokeWeight: style.weight,
          strokeOpacity: style.opacity,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 15,
        });
        map.add(segment);
        segments.push(segment);
      }
      mainPressureSegmentsRef.current = segments;

      // 3. S376 分流走廊
      const s376Line = new AMap.Polyline({
        path: S376_PATH,
        strokeColor: '#2ED573',
        strokeWeight: 5,
        strokeOpacity: 0.7,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [12, 6],
        zIndex: 14,
      });
      map.add(s376Line);
      s376LineRef.current = s376Line;

      // 4. 应急车道借用路径
      const emergencyLane = new AMap.Polyline({
        path: EMERGENCY_LANE_PATH,
        strokeColor: '#F5A623',
        strokeWeight: 5,
        strokeOpacity: 0.6,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        strokeDasharray: [8, 8],
        zIndex: 14,
      });
      map.add(emergencyLane);
      emergencyLaneRef.current = emergencyLane;

      // === 绘制流向箭头 ===

      // 港口积压反压
      const backPressureLine = new AMap.Polyline({
        path: BACK_PRESSURE_PATH,
        strokeColor: '#FF4757',
        strokeWeight: 3,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        showDir: true,
        zIndex: 12,
      });
      map.add(backPressureLine);
      backPressureLineRef.current = backPressureLine;

      // 分流承接
      const diversionReturn = new AMap.Polyline({
        path: DIVERSION_RETURN_PATH,
        strokeColor: '#2ED573',
        strokeWeight: 3,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        showDir: true,
        zIndex: 12,
      });
      map.add(diversionReturn);
      diversionReturnRef.current = diversionReturn;

      // === 走廊标签 ===

      // 进港大道标签
      const mainLabel = new AMap.Text({
        text: `进港大道压力链\n${focusRoad.queueLength} · ${focusRoad.vehicles}辆 · ${focusRoad.durationMinutes}min`,
        position: [
          (MAIN_PRESSURE_PATH[1][0] + MAIN_PRESSURE_PATH[2][0]) / 2 + 0.008,
          (MAIN_PRESSURE_PATH[1][1] + MAIN_PRESSURE_PATH[2][1]) / 2 + 0.006,
        ],
        style: {
          'background-color': 'rgba(255,71,87,0.15)',
          border: '1px solid rgba(255,71,87,0.35)',
          'border-radius': '7px',
          padding: '6px 10px',
          'font-size': '11px',
          color: '#FF4757',
          'white-space': 'pre-line',
          'text-align': 'center',
          'line-height': '1.5',
        },
        zIndex: 120,
      });
      map.add(mainLabel);
      mainPressureLabelRef.current = mainLabel;

      // S376 分流标签
      const s376Label = new AMap.Text({
        text: `S376 分流走廊\n分流 ~200辆`,
        position: [
          (S376_PATH[1][0] + S376_PATH[2][0]) / 2 - 0.008,
          (S376_PATH[1][1] + S376_PATH[2][1]) / 2,
        ],
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
      map.add(s376Label);
      s376LabelRef.current = s376Label;

      // 应急车道标签
      const emergencyLabel = new AMap.Text({
        text: `应急车道借用\n减压 ~350辆`,
        position: [
          (EMERGENCY_LANE_PATH[1][0] + EMERGENCY_LANE_PATH[2][0]) / 2 + 0.006,
          (EMERGENCY_LANE_PATH[1][1] + EMERGENCY_LANE_PATH[2][1]) / 2,
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
      map.add(emergencyLabel);
      emergencyLabelRef.current = emergencyLabel;

      // G207 标签
      const g207Label = new AMap.Text({
        text: 'G207 城区来车',
        position: [
          G207_PATH[0][0] - 0.002,
          G207_PATH[0][1] + 0.004,
        ],
        style: {
          'background-color': 'rgba(148,163,184,0.15)',
          border: '1px solid rgba(148,163,184,0.3)',
          'border-radius': '7px',
          padding: '4px 8px',
          'font-size': '11px',
          color: '#94A3B8',
          'white-space': 'nowrap',
        },
        zIndex: 120,
      });
      map.add(g207Label);
      g207LabelRef.current = g207Label;

      // === 固定节点 Marker ===

      const nodeDefs = [
        {
          id: 'urban-gate',
          position: COMMAND_NODES.urbanGate,
          marker: 'G',
          label: 'G207交叉口',
          caption: `${focusRoad.futureInflow}辆待流入`,
          tone: 'amber',
          shape: 'square',
        },
        {
          id: 'huasi-gate',
          position: COMMAND_NODES.huasiGate,
          marker: 'H',
          label: '华四村卡口',
          caption: '分流执行点',
          tone: 'green',
          shape: 'circle',
        },
        {
          id: 'maichen-gate',
          position: COMMAND_NODES.maichenGate,
          marker: 'M',
          label: '迈陈镇路口',
          caption: '应急车道管控',
          tone: 'amber',
          shape: 'circle',
        },
        {
          id: 'nanshan-gate',
          position: COMMAND_NODES.nanshanGate,
          marker: 'N',
          label: '南山镇卡口',
          caption: '交通疏导',
          tone: 'amber',
          shape: 'circle',
        },
        {
          id: 's376-gate',
          position: COMMAND_NODES.s376Gate,
          marker: 'S',
          label: 'S376路口',
          caption: '分流执行点',
          tone: 'green',
          shape: 'circle',
        },
        {
          id: 'lane-control',
          position: COMMAND_NODES.laneControl,
          marker: 'L',
          label: '借道起点',
          caption: '应急车道入口',
          tone: 'amber',
          shape: 'diamond',
        },
        {
          id: 'xuwen-port',
          position: COMMAND_NODES.xuwenPort,
          marker: '港',
          label: '徐闻港闸口',
          caption: `排队${focusRoad.queueLength}`,
          tone: 'red',
          shape: 'square',
          clickable: true,
        },
        {
          id: 'haian-yard',
          position: COMMAND_NODES.haianYard,
          marker: 'H',
          label: '海安前场',
          caption: '承接分流',
          tone: 'cyan',
          shape: 'circle',
        },
        {
          id: 'dispatch-center',
          position: COMMAND_NODES.dispatchCenter,
          marker: 'D',
          label: '调度中心',
          caption: '指挥枢纽',
          tone: 'blue',
          shape: 'square',
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

      nodeDefs.forEach((node) => {
        const color = toneColors[node.tone] || '#00D0E9';
        const shapeClass = `command-node--${node.shape}`;
        const marker = new AMap.Marker({
          position: node.position,
          content: `
            <div class="command-node ${shapeClass} ${node.clickable ? 'command-node--clickable' : ''}" data-tone="${node.tone}">
              <div class="command-node__halo" style="border-color:${color}33;box-shadow:0 0 16px ${color}22"></div>
              <div class="command-node__core" style="background:${color}22;border-color:${color}88;color:${color}">${node.marker}</div>
              <div class="command-node__pin" style="background:${color}55"></div>
              <div class="command-node__label">
                <div class="command-node__label-bg" style="background:rgba(10,15,25,0.88);border-color:${color}44"></div>
                <div class="command-node__label-text" style="color:${color}">${node.label}</div>
                <div class="command-node__caption-text">${node.caption}</div>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(-40, -90),
          zIndex: 200,
        });

        if (node.clickable) {
          marker.on('click', () => onNodeClick(node.id));
        }

        map.add(marker);
        nodeMarkersRef.current[node.id] = marker;
      });

      // === 人员 Marker ===

      const roleIcons: Record<string, string> = {
        '交警': '警',
        '拖车司机': '拖',
        '无人机操作员': '机',
        '港口调度员': '调',
      };

      const statusLabels: Record<string, string> = {
        idle: '待命',
        moving: '移动中',
        executing: '执行中',
        calling: '通话中',
      };

      const roleColorMap: Record<string, string> = {
        '交警': '#00D0E9',
        '拖车司机': '#F5A623',
        '无人机操作员': '#60A5FA',
        '港口调度员': '#2ED573',
      };

      fieldPersons.forEach((person) => {
        const roleChar = roleIcons[person.role] || '人';
        const statusText = person.task || statusLabels[person.status] || person.status;
        const roleColor = roleColorMap[person.role] || '#94A3B8';

        const personMarker = new AMap.Marker({
          position: person.position,
          content: `
            <div class="command-person" data-status="${person.status}">
              <div class="command-person__core" style="background:${roleColor}22;border-color:${roleColor}88;color:${roleColor}">${roleChar}</div>
              <div class="command-person__info">
                <div class="command-person__name" style="color:${roleColor}">${person.name} ${person.role}</div>
                <div class="command-person__task">${statusText}</div>
              </div>
            </div>
          `,
          offset: new AMap.Pixel(-16, -16),
          zIndex: 180,
        });

        map.add(personMarker);
        personMarkersRef.current[person.id] = personMarker;
      });

      console.log('[useCommandMap] Map initialization complete, setting mapReady to true');
      setMapReady(true);
    }).catch((err: any) => {
      console.error('[useCommandMap] AMap load failed:', err);
      console.error('[useCommandMap] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
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

  // 动态更新：拥堵指数变化 → 走廊颜色（分段更新）
  useEffect(() => {
    if (mainPressureSegmentsRef.current.length === 0) return;
    // 根据拥堵指数调整各段颜色强度
    mainPressureSegmentsRef.current.forEach((segment, i) => {
      const style = SEGMENT_STYLES[i];
      // 拥堵指数越高，颜色越深
      const intensityFactor = Math.min(1.0, 0.6 + (congestionIndex / 10) * 0.4);
      segment.setOptions({
        strokeOpacity: style.opacity * intensityFactor,
      });
    });
  }, [congestionIndex]);

  // 动态更新：进港大道标签
  useEffect(() => {
    if (!mainPressureLabelRef.current) return;
    // 使用最后一段（最拥堵）的颜色
    const color = SEGMENT_STYLES[SEGMENT_STYLES.length - 1].color;
    mainPressureLabelRef.current.setText(
      `进港大道压力链\n${focusRoad.queueLength} · ${focusRoad.vehicles}辆 · ${focusRoad.durationMinutes}min`
    );
    mainPressureLabelRef.current.setStyle({
      'background-color': `${color}22`,
      border: `1px solid ${color}55`,
      'border-radius': '7px',
      padding: '6px 10px',
      'font-size': '11px',
      color: color,
      'white-space': 'pre-line',
      'text-align': 'center',
      'line-height': '1.5',
    });
  }, [congestionIndex, focusRoad]);

  // 动态更新：节点 caption
  useEffect(() => {
    if (!mapReady) return;
    const AMap = (window as any).AMap;
    if (!AMap) return;

    const toneColors: Record<string, string> = {
      cyan: '#00D0E9', green: '#2ED573', amber: '#F5A623',
      red: '#FF4757', blue: '#60A5FA', muted: '#94A3B8',
    };

    // 更新城区入口
    const urbanGate = nodeMarkersRef.current['urban-gate'];
    if (urbanGate) {
      const color = toneColors.amber;
      urbanGate.setContent(`
        <div class="command-node command-node--square" data-tone="amber">
          <div class="command-node__halo" style="border-color:${color}33;box-shadow:0 0 16px ${color}22"></div>
          <div class="command-node__core" style="background:${color}22;border-color:${color}88;color:${color}">G</div>
          <div class="command-node__pin" style="background:${color}55"></div>
          <div class="command-node__label">
            <div class="command-node__label-bg" style="background:rgba(10,15,25,0.88);border-color:${color}44"></div>
            <div class="command-node__label-text" style="color:${color}">G207交叉口</div>
            <div class="command-node__caption-text">${focusRoad.futureInflow}辆待流入</div>
          </div>
        </div>
      `);
    }

    // 更新徐闻港
    const xuwenPort = nodeMarkersRef.current['xuwen-port'];
    if (xuwenPort) {
      const color = toneColors.red;
      xuwenPort.setContent(`
        <div class="command-node command-node--square command-node--clickable" data-tone="red">
          <div class="command-node__halo" style="border-color:${color}33;box-shadow:0 0 16px ${color}22"></div>
          <div class="command-node__core" style="background:${color}22;border-color:${color}88;color:${color}">港</div>
          <div class="command-node__pin" style="background:${color}55"></div>
          <div class="command-node__label">
            <div class="command-node__label-bg" style="background:rgba(10,15,25,0.88);border-color:${color}44"></div>
            <div class="command-node__label-text" style="color:${color}">徐闻港闸口</div>
            <div class="command-node__caption-text">排队${focusRoad.queueLength}</div>
          </div>
        </div>
      `);
    }
  }, [focusRoad, mapReady]);

  // 动态更新：人员位置和状态
  useEffect(() => {
    if (!mapReady) return;
    const AMap = (window as any).AMap;
    if (!AMap) return;

    const roleIcons: Record<string, string> = {
      '交警': '警', '拖车司机': '拖', '无人机操作员': '机', '港口调度员': '调',
    };
    const statusLabels: Record<string, string> = {
      idle: '待命', moving: '移动中', executing: '执行中', calling: '通话中',
    };

    const roleColorMap: Record<string, string> = {
      '交警': '#00D0E9', '拖车司机': '#F5A623', '无人机操作员': '#60A5FA', '港口调度员': '#2ED573',
    };

    fieldPersons.forEach((person) => {
      const marker = personMarkersRef.current[person.id];
      if (!marker) return;

      const roleChar = roleIcons[person.role] || '人';
      const statusText = person.task || statusLabels[person.status] || person.status;
      const roleColor = roleColorMap[person.role] || '#94A3B8';

      marker.setPosition(new AMap.LngLat(person.position[0], person.position[1]));
      marker.setContent(`
        <div class="command-person" data-status="${person.status}">
          <div class="command-person__core" style="background:${roleColor}22;border-color:${roleColor}88;color:${roleColor}">${roleChar}</div>
          <div class="command-person__info">
            <div class="command-person__name" style="color:${roleColor}">${person.name} ${person.role}</div>
            <div class="command-person__task">${statusText}</div>
          </div>
        </div>
      `);
    });
  }, [fieldPersons, mapReady]);

  // === Strategy execution visual effects ===
  useEffect(() => {
    if (!mapReady) return;

    const executingStrategy = strategies.find((s) => s.status === 'executing');
    if (!executingStrategy) return;

    const timers: NodeJS.Timeout[] = [];

    // Stage 1 (immediate): Route activation
    const activateRoute = () => {
      if (executingStrategy.id === 'S-02' && s376LineRef.current) {
        // S376 diversion: dashed → animated flow
        s376LineRef.current.setOptions({
          strokeColor: '#00D0E9',
          strokeWeight: 6,
          strokeOpacity: 1.0,
          strokeStyle: 'solid',
          strokeDasharray: undefined,
        });
        // Add animation class via custom overlay
        const path = s376LineRef.current.getPath();
        if (path && path.length > 0) {
          // Create animated overlay
          const animatedLine = new (window as any).AMap.Polyline({
            path: S376_PATH,
            strokeColor: '#00D0E9',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 15,
            showDir: true,
          });
          mapInstance.current?.add(animatedLine);
          timers.push(setTimeout(() => animatedLine.hide(), 15000) as any);
        }
      } else if (executingStrategy.id === 'S-01' && emergencyLaneRef.current) {
        // Emergency lane: dashed → animated flow
        emergencyLaneRef.current.setOptions({
          strokeColor: '#00D0E9',
          strokeWeight: 6,
          strokeOpacity: 1.0,
          strokeStyle: 'solid',
          strokeDasharray: undefined,
        });
        const animatedLine = new (window as any).AMap.Polyline({
          path: EMERGENCY_LANE_PATH,
          strokeColor: '#00D0E9',
          strokeWeight: 6,
          strokeOpacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 15,
          showDir: true,
        });
        mapInstance.current?.add(animatedLine);
        timers.push(setTimeout(() => animatedLine.hide(), 15000) as any);
      } else if (executingStrategy.id === 'S-03' && g207LineRef.current) {
        // G207 diversion
        g207LineRef.current.setOptions({
          strokeColor: '#00D0E9',
          strokeWeight: 7,
          strokeOpacity: 1.0,
        });
      }
    };

    activateRoute();

    // Stage 2 (~3s): Personnel movement animation
    const timer1 = setTimeout(() => {
      // Find personnel assigned to this strategy
      const assignedPersonIds = executingStrategy.id === 'S-02'
        ? ['p-01'] // Zhang San for S376
        : executingStrategy.id === 'S-01'
        ? ['p-06'] // Zhou Ba for emergency lane
        : [];

      assignedPersonIds.forEach((personId) => {
        const marker = personMarkersRef.current[personId];
        if (marker) {
          const person = fieldPersons.find((p) => p.id === personId);
          if (person) {
            const roleColorMap: Record<string, string> = {
              '交警': '#00D0E9',
              '拖车司机': '#F5A623',
              '无人机操作员': '#60A5FA',
              '港口调度员': '#2ED573',
            };
            const roleIcons: Record<string, string> = {
              '交警': '警',
              '拖车司机': '拖',
              '无人机操作员': '机',
              '港口调度员': '调',
            };
            const roleChar = roleIcons[person.role] || '人';
            const roleColor = roleColorMap[person.role] || '#00D0E9';

            // Add pulsing animation
            marker.setContent(`
              <div class="command-person command-person--executing" data-status="executing">
                <div class="command-person__core" style="background:${roleColor}44;border-color:${roleColor};color:${roleColor};box-shadow:0 0 12px ${roleColor}88">${roleChar}</div>
                <div class="command-person__info">
                  <div class="command-person__name" style="color:${roleColor}">${person.name} ${person.role}</div>
                  <div class="command-person__task">执行中...</div>
                </div>
              </div>
            `);
          }
        }
      });
    }, 3000);
    timers.push(timer1);

    // Stage 3 (~6s): Equipment activation
    const timer2 = setTimeout(() => {
      // Flash equipment markers related to the strategy
      const equipmentNodes = executingStrategy.id === 'S-02'
        ? ['huasi-gate', 's376-gate']
        : executingStrategy.id === 'S-01'
        ? ['lane-control', 'maichen-gate']
        : [];

      equipmentNodes.forEach((nodeId) => {
        const marker = nodeMarkersRef.current[nodeId];
        if (marker) {
          const content = marker.getContent();
          if (typeof content === 'string') {
            // Add flashing effect by temporarily changing color
            const flashContent = content.replace(/color:#[A-F0-9]{6}/gi, 'color:#00D0E9');
            marker.setContent(flashContent);

            // Restore after 2s
            timers.push(setTimeout(() => {
              marker.setContent(content);
            }, 2000) as any);
          }
        }
      });
    }, 6000);
    timers.push(timer2);

    // Stage 4 (~15s): Result visualization - congestion heat change
    const timer3 = setTimeout(() => {
      // Gradually change congestion segment colors
      mainPressureSegmentsRef.current.forEach((segment, i) => {
        const style = SEGMENT_STYLES[i];
        // Reduce intensity to show relief
        const reliefFactor = 0.6;
        segment.setOptions({
          strokeOpacity: style.opacity * reliefFactor,
          strokeColor: i < SEGMENT_STYLES.length - 1 ? style.color : '#F59E0B', // Last segment improves
        });
      });

      // Update main pressure label
      if (mainPressureLabelRef.current) {
        const reducedVehicles = Math.floor(focusRoad.vehicles * 0.85);
        const reducedQueue = `${(parseFloat(focusRoad.queueLength) * 0.85).toFixed(1)} 公里`;
        const reducedTime = Math.floor(focusRoad.durationMinutes * 0.85);

        mainPressureLabelRef.current.setText(
          `进港大道压力链\n${reducedQueue} · ${reducedVehicles}辆 · ${reducedTime}min`
        );
        mainPressureLabelRef.current.setStyle({
          'background-color': 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.35)',
          'border-radius': '7px',
          padding: '6px 10px',
          'font-size': '11px',
          color: '#F59E0B',
          'white-space': 'pre-line',
          'text-align': 'center',
          'line-height': '1.5',
        });
      }
    }, 15000);
    timers.push(timer3);

    // Cleanup timers on unmount or when strategy changes
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [strategies, mapReady, fieldPersons, focusRoad]);

  // === Layer visibility control ===
  const mapLayers = useCommandStore((s) => s.commandState.mapLayers);

  useEffect(() => {
    if (!mapReady) return;

    // Helper: show/hide an AMap overlay
    const setVisible = (overlay: any, visible: boolean) => {
      if (!overlay) return;
      if (visible) {
        overlay.show();
      } else {
        overlay.hide();
      }
    };

    // Congestion layer: main pressure segments + label + back pressure line
    mainPressureSegmentsRef.current.forEach((seg) => setVisible(seg, mapLayers.congestion));
    setVisible(mainPressureLabelRef.current, mapLayers.congestion);
    setVisible(backPressureLineRef.current, mapLayers.congestion);

    // Personnel layer: person markers
    Object.values(personMarkersRef.current).forEach((marker) => setVisible(marker, mapLayers.personnel));

    // Equipment layer: fixed node markers (gates, control points, port, dispatch center)
    Object.values(nodeMarkersRef.current).forEach((marker) => setVisible(marker, mapLayers.equipment));

    // Routes layer: diversion routes (S376, emergency lane, G207, diversion return)
    setVisible(s376LineRef.current, mapLayers.routes);
    setVisible(s376LabelRef.current, mapLayers.routes);
    setVisible(emergencyLaneRef.current, mapLayers.routes);
    setVisible(emergencyLabelRef.current, mapLayers.routes);
    setVisible(g207LineRef.current, mapLayers.routes);
    setVisible(g207LabelRef.current, mapLayers.routes);
    setVisible(diversionReturnRef.current, mapLayers.routes);

    // Vehicles layer: special vehicle markers (placeholder for future implementation)
    // Currently no special vehicle markers on map; this will control them when added
  }, [mapLayers, mapReady]);

  return {
    mapInstance,
    mapReady,
    mapError,
    refs: {
      mainPressureSegmentsRef,
      mainPressureLabelRef,
      s376LineRef,
      s376LabelRef,
      emergencyLaneRef,
      emergencyLabelRef,
      g207LineRef,
      g207LabelRef,
      backPressureLineRef,
      diversionReturnRef,
      nodeMarkersRef,
      personMarkersRef,
    } as CommandMapRefs,
  };
}
