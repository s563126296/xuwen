import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Video, MessageSquare } from 'lucide-react';
import MapVideoDock from './MapVideoDock';
import PersonMarker from './PersonMarker';
import IncomingCallModal from './IncomingCallModal';
import { useDashboardStore } from '../../store/dashboardStore';
import type { FieldPerson } from '../../store/dashboardStore';

// 徐闻港精确坐标（高德GCJ-02，用户确认）
const XUWEN_PORT: [number, number] = [110.141114, 20.233385];

// 进港公路采集坐标（用户提供的原始 7 个关键点，从北到南）
const JINGANG_ROAD_ORIGINAL: [number, number][] = [
  [110.160745, 20.306732],  // 北端 G207 交叉口
  [110.157380, 20.291170],  // 华四村
  [110.153524, 20.278910],  // 迈陈镇
  [110.150478, 20.264358],  // 中段
  [110.147502, 20.250149],  // 南山镇
  [110.143228, 20.245138],  // 近港区
  [110.141114, 20.233385],  // 徐闻港
];

// 临时使用原始坐标，等待用户提供更密集的真实采集点
const JINGANG_ROAD = JINGANG_ROAD_ORIGINAL;

// 拥堵程度从北到南递增（越靠近港口越堵）
const SEGMENT_STYLES = [
  { color: '#2ED573', weight: 4, opacity: 0.6 },  // 北端：畅通
  { color: '#F5A623', weight: 6, opacity: 0.7 },  // 华四村：缓行
  { color: '#FF8C00', weight: 8, opacity: 0.8 },  // 迈陈镇：拥堵
  { color: '#FF4757', weight: 10, opacity: 0.9 },  // 中段：严重拥堵
  { color: '#FF4757', weight: 12, opacity: 1.0 },  // 南山镇：严重拥堵
  { color: '#DC143C', weight: 14, opacity: 1.0 },  // 近港区：极度拥堵
];

// 粒子配置
const PARTICLE_COUNT = 6;
const PARTICLE_INTERVAL = 80; // ms

export default function CommandMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const fieldPersons = useDashboardStore((s) => s.commandState.fieldPersons);
  const commandFeed = useDashboardStore((s) => s.commandState.commandFeed);
  const addCommandFeedItem = useDashboardStore((s) => s.addCommandFeedItem);
  const startCall = useDashboardStore((s) => s.startCall);
  const openChatWith = useDashboardStore((s) => s.openChatWith);
  const strategies = useDashboardStore((s) => s.commandState.strategies);
  const setActiveModal = useDashboardStore((s) => s.setActiveModal);
  const isDroneDeployed = useDashboardStore((s) => s.commandState.isDroneDeployed);

  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallMessage, setIncomingCallMessage] = useState('');
  const [incomingCallPerson, setIncomingCallPerson] = useState<FieldPerson | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<FieldPerson | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const lastPhoneFeedIdRef = useRef<string | null>(null);

  // 存储地图元素引用，供脉冲效果使用
  const diversionLineRef = useRef<any>(null);
  const diversionLabelRef = useRef<any>(null);
  const pulseLineRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const dronePatrolIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const droneTrajectoryRef = useRef<any>(null);

  // 监听 commandFeed 中的 phone 类型消息
  useEffect(() => {
    const phoneMsg = commandFeed.find(f => f.icon === 'phone');
    if (phoneMsg && phoneMsg.id !== lastPhoneFeedIdRef.current) {
      lastPhoneFeedIdRef.current = phoneMsg.id;
      // 根据 source 匹配人员
      const person = fieldPersons.find(p => p.name === phoneMsg.source);
      if (person) {
        setIncomingCallPerson(person);
        setIncomingCallMessage(phoneMsg.content);
        setShowIncomingCall(true);
      }
    }
  }, [commandFeed, fieldPersons]);

  const handleAcceptVideo = () => {
    setShowIncomingCall(false);
    if (incomingCallPerson) {
      startCall(incomingCallPerson.id);
      addCommandFeedItem(`已接通${incomingCallPerson.name}视频通话`);
    }
  };

  const handleAcceptVoice = () => {
    setShowIncomingCall(false);
    if (incomingCallPerson) {
      addCommandFeedItem(`已接通${incomingCallPerson.name}语音通话`);
    }
  };

  const handleDeclineCall = () => {
    setShowIncomingCall(false);
  };

  const handlePersonClick = (person: FieldPerson) => {
    if (selectedPerson?.id === person.id) {
      setSelectedPerson(null);
      setPopupPosition(null);
      return;
    }

    setSelectedPerson(person);

    if (mapInstance.current && (window as any).AMap) {
      const AMap = (window as any).AMap;
      const pixel = mapInstance.current.lngLatToContainer(
        new AMap.LngLat(person.position[0], person.position[1])
      );

      const mapContainer = mapRef.current;
      const popupWidth = 200;
      const popupHeight = 140;
      const padding = 20;

      let x = pixel.getX() + 20;
      let y = pixel.getY() - 70;

      if (mapContainer) {
        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;

        // 右边界检测
        if (x + popupWidth > mapWidth - padding) {
          x = pixel.getX() - popupWidth - 20;
        }
        // 左边界检测
        if (x < padding) {
          x = padding;
        }
        // 上边界检测
        if (y < padding) {
          y = padding;
        }
        // 下边界检测
        if (y + popupHeight > mapHeight - padding) {
          y = mapHeight - popupHeight - padding;
        }
      }

      setPopupPosition({ x, y });
    }
  };

  useEffect(() => {
    let destroyed = false;

    AMapLoader.load({
      key: 'd68ecc01797b67df1d265f2aa29ebc87',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.Driving'],
    }).then((AMap: any) => {
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

        // 添加深色遮罩层到地图容器
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

      // 点击地图空白处关闭人员弹窗
      map.on('click', () => {
        setSelectedPerson(null);
        setPopupPosition(null);
      });

      // 地图缩放/平移时更新弹窗位置
      map.on('moveend', () => {
        if (selectedPerson && mapInstance.current) {
          const AMap = (window as any).AMap;
          const pixel = mapInstance.current.lngLatToContainer(
            new AMap.LngLat(selectedPerson.position[0], selectedPerson.position[1])
          );
          setPopupPosition({ x: pixel.getX(), y: pixel.getY() });
        }
      });

      map.on('zoomend', () => {
        if (selectedPerson && mapInstance.current) {
          const AMap = (window as any).AMap;
          const pixel = mapInstance.current.lngLatToContainer(
            new AMap.LngLat(selectedPerson.position[0], selectedPerson.position[1])
          );
          setPopupPosition({ x: pixel.getX(), y: pixel.getY() });
        }
      });

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

        // 主线条
        const segment = new AMap.Polyline({
          path: segmentPath,
          strokeColor: style.color,
          strokeWeight: style.weight,
          strokeOpacity: style.opacity,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 15,
          isOutline: true,
          outlineColor: style.color + '66', // 40% opacity
          borderWeight: 2,
        });
        map.add(segment);
        congestionSegments.push(segment);

        // 严重拥堵路段（后3段）添加光晕
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

      // S376分流路线（绿色虚线，从华四村向西绕行）
      const huasiPos = JINGANG_ROAD[1]; // 华四村附近
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

      // 卡口标记（沿路径分布）
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

      // 无人机 Marker（初始隐藏）— 与总览模式统一的白色无人机图标
      const droneMarker = new AMap.Marker({
        position: JINGANG_ROAD[1], // 华四村起飞点
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

      // 车流粒子动画
      const particles: any[] = [];
      const particleProgress: number[] = [];

      // 计算路径总长度（用于均匀分布粒子）
      const segmentLengths: number[] = [];
      let totalLength = 0;
      for (let i = 0; i < JINGANG_ROAD.length - 1; i++) {
        const len = Math.sqrt(
          Math.pow(JINGANG_ROAD[i + 1][0] - JINGANG_ROAD[i][0], 2) +
          Math.pow(JINGANG_ROAD[i + 1][1] - JINGANG_ROAD[i][1], 2)
        );
        segmentLengths.push(len);
        totalLength += len;
      }

      // 创建粒子
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = new AMap.Marker({
          position: JINGANG_ROAD[0],
          content: `<div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00D0E9;
            box-shadow: 0 0 6px #00D0E9, 0 0 12px rgba(0,208,233,0.4);
          "></div>`,
          offset: new AMap.Pixel(-4, -4),
          zIndex: 50,
        });
        map.add(particle);
        particles.push(particle);
        particleProgress.push((i / PARTICLE_COUNT) * totalLength); // 均匀分布
      }

      // 粒子动画循环
      const particleInterval = setInterval(() => {
        if (destroyed) return;

        particles.forEach((particle, idx) => {
          let progress = particleProgress[idx];

          // 根据路段拥堵程度调整速度
          let currentSegment = 0;
          let accumulatedLength = 0;
          for (let i = 0; i < segmentLengths.length; i++) {
            if (progress < accumulatedLength + segmentLengths[i]) {
              currentSegment = i;
              break;
            }
            accumulatedLength += segmentLengths[i];
          }

          // 速度映射：畅通段快，拥堵段慢
          let speed: number;
          if (currentSegment === 0) speed = 0.0005; // 畅通
          else if (currentSegment === 1) speed = 0.0003; // 缓行
          else if (currentSegment === 2) speed = 0.0002; // 拥堵
          else if (currentSegment === 3) speed = 0.0001; // 严重拥堵
          else if (currentSegment === 4) speed = 0.00005; // 严重拥堵
          else speed = 0.00003; // 极度拥堵

          progress += speed;

          // 重置到起点
          if (progress >= totalLength) {
            progress = 0;
          }

          particleProgress[idx] = progress;

          // 计算粒子位置
          let accLen = 0;
          for (let i = 0; i < segmentLengths.length; i++) {
            if (progress < accLen + segmentLengths[i]) {
              const t = (progress - accLen) / segmentLengths[i];
              const lng = JINGANG_ROAD[i][0] + t * (JINGANG_ROAD[i + 1][0] - JINGANG_ROAD[i][0]);
              const lat = JINGANG_ROAD[i][1] + t * (JINGANG_ROAD[i + 1][1] - JINGANG_ROAD[i][1]);
              particle.setPosition([lng, lat]);
              break;
            }
            accLen += segmentLengths[i];
          }
        });
      }, PARTICLE_INTERVAL);

      // 进港大道脉冲叠加线（S-01 执行时使用）
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
              // 更新分段路径
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
              console.log('✅ 进港大道路径已贴合真实道路，共', realPath.length, '个坐标点');
            } else {
              console.warn('⚠️ Driving API 返回点数过少:', realPath.length);
            }
          } else {
            console.warn('⚠️ Driving API 状态:', status, '使用原始采集坐标');
          }
        });
      });

      // 清理函数
      return () => {
        clearInterval(particleInterval);
        particles.forEach(p => map.remove(p));
      };
    }).catch((e: any) => {
      console.error('高德地图加载失败:', e);
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  // 执行中路段脉冲效果（独立 useEffect，响应策略变化）
  useEffect(() => {
    if (!mapReady) return;

    const executingStrategy = strategies.find(s => s.status === 'executing');

    // S-02 执行中：S376 分流路线脉冲
    let diversionOpacity = 0.3;
    let diversionDirection = 1;
    let diversionInterval: number | null = null;

    if (executingStrategy?.id === 'S-02' && diversionLineRef.current && diversionLabelRef.current) {
      diversionInterval = window.setInterval(() => {
        diversionOpacity += diversionDirection * 0.7;
        if (diversionOpacity >= 1.0) {
          diversionOpacity = 1.0;
          diversionDirection = -1;
        } else if (diversionOpacity <= 0.3) {
          diversionOpacity = 0.3;
          diversionDirection = 1;
        }
        diversionLineRef.current?.setOptions({ strokeOpacity: diversionOpacity });
      }, 1000);

      if (diversionLabelRef.current && diversionLabelRef.current.setText && diversionLabelRef.current.setStyle) {
        diversionLabelRef.current.setText('S376 分流执行中 ●');
        diversionLabelRef.current.setStyle({
          'font-size': '11px',
          'font-weight': '600',
          color: '#00D0E9',
          'background-color': 'rgba(0,208,233,0.15)',
          border: '1px solid rgba(0,208,233,0.3)',
          'border-radius': '4px',
          padding: '3px 8px',
        });
      }
    } else if (diversionLineRef.current && diversionLabelRef.current) {
      if (diversionLabelRef.current.setText && diversionLabelRef.current.setStyle) {
        diversionLineRef.current.setOptions({ strokeOpacity: 0.6 });
        diversionLabelRef.current.setText('S376 建议分流路线');
        diversionLabelRef.current.setStyle({
          'font-size': '11px',
          'font-weight': '600',
          color: '#2ED573',
          'background-color': 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          'border-radius': '4px',
          padding: '3px 8px',
        });
      }
    }

    // S-01 执行中：进港大道青色脉冲
    let roadOpacity = 0;
    let roadDirection = 1;
    let roadInterval: number | null = null;

    if (executingStrategy?.id === 'S-01' && pulseLineRef.current) {
      roadInterval = window.setInterval(() => {
        roadOpacity += roadDirection * 0.8;
        if (roadOpacity >= 0.8) {
          roadOpacity = 0.8;
          roadDirection = -1;
        } else if (roadOpacity <= 0) {
          roadOpacity = 0;
          roadDirection = 1;
        }
        pulseLineRef.current?.setOptions({ strokeOpacity: roadOpacity });
      }, 1000);
    } else if (pulseLineRef.current) {
      pulseLineRef.current.setOptions({ strokeOpacity: 0 });
    }

    return () => {
      if (diversionInterval) clearInterval(diversionInterval);
      if (roadInterval) clearInterval(roadInterval);
    };
  }, [mapReady, strategies]);

  // 无人机部署状态监听
  useEffect(() => {
    if (!mapReady || !droneMarkerRef.current) return;

    const droneMarker = droneMarkerRef.current;

    // 清理之前的巡逻定时器
    if (dronePatrolIntervalRef.current) {
      clearInterval(dronePatrolIntervalRef.current);
      dronePatrolIntervalRef.current = null;
    }

    if (isDroneDeployed) {
      // 直接从华四村开始巡逻
      droneMarker.setPosition(JINGANG_ROAD[1]);
      droneMarker.show();

      // 巡逻路径：华四村(1) → 迈陈镇(2) → 中段(3) → 南山镇(4) → 近港区/港口入口(5)
      const patrolPath = [
        JINGANG_ROAD[1], // 华四村
        JINGANG_ROAD[2], // 迈陈镇
        JINGANG_ROAD[3], // 中段
        JINGANG_ROAD[4], // 南山镇
        JINGANG_ROAD[5], // 近港区（港口入口）
      ];

      let pathIndex = 0;
      let direction = 1;
      let currentPos: [number, number] = [JINGANG_ROAD[1][0], JINGANG_ROAD[1][1]];
      let targetPos = patrolPath[1]; // 第一个目标：迈陈镇

      dronePatrolIntervalRef.current = setInterval(() => {
        const dx = targetPos[0] - currentPos[0];
        const dy = targetPos[1] - currentPos[1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 到达当前目标点，切换到下一个目标点
        if (distance < 0.0002) {
          pathIndex += direction;

          // 到达终点（近港区），反向巡逻
          if (pathIndex >= patrolPath.length) {
            pathIndex = patrolPath.length - 2;
            direction = -1;
          }
          // 到达起点（华四村），正向巡逻
          else if (pathIndex < 0) {
            pathIndex = 1;
            direction = 1;
          }

          targetPos = patrolPath[pathIndex];
        }

        // 向目标点移动（每次移动 0.00035 经纬度，加快速度）
        const moveSpeed = 0.00035;
        const ratio = distance > 0 ? moveSpeed / distance : 0;
        currentPos = [
          currentPos[0] + dx * ratio,
          currentPos[1] + dy * ratio,
        ];

        droneMarker.setPosition(currentPos);

        // Update trajectory line
        if (!droneTrajectoryRef.current && mapInstance.current && (window as any).AMap) {
          const AMap = (window as any).AMap;
          droneTrajectoryRef.current = new AMap.Polyline({
            path: [],
            strokeColor: '#00D0E9',
            strokeWeight: 2,
            strokeOpacity: 0.4,
            strokeStyle: 'dashed',
            strokeDasharray: [10, 5],
            zIndex: 150,
          });
          droneTrajectoryRef.current.setMap(mapInstance.current);
        }

        if (droneTrajectoryRef.current && (window as any).AMap) {
          const AMap = (window as any).AMap;
          const path = droneTrajectoryRef.current.getPath() || [];
          path.push(new AMap.LngLat(currentPos[0], currentPos[1]));
          if (path.length > 20) {
            path.shift();
          }
          droneTrajectoryRef.current.setPath(path);
        }
      }, 100); // 每 100ms 更新一次位置

      return () => {
        if (dronePatrolIntervalRef.current) {
          clearInterval(dronePatrolIntervalRef.current);
          dronePatrolIntervalRef.current = null;
        }
        if (droneTrajectoryRef.current) {
          droneTrajectoryRef.current.setMap(null);
          droneTrajectoryRef.current = null;
        }
      };
    } else {
      droneMarker.hide();
      if (droneTrajectoryRef.current) {
        droneTrajectoryRef.current.setMap(null);
        droneTrajectoryRef.current = null;
      }
    }
  }, [isDroneDeployed, mapReady]);

  return (
    <div
      className="card"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onClick={(e) => {
        // Close popup when clicking outside
        if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
          setSelectedPerson(null);
          setPopupPosition(null);
        }
      }}
    >
      {/* 地图容器 */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

      {/* 加载状态 */}
      {!mapReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: '#0D1B2A'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span style={{ fontSize: 14, color: '#475569' }}>加载高德地图...</span>
        </div>
      )}

      {/* 地图标题和聚焦提示 */}
      <div
        onClick={() => setActiveModal('congestion-detail')}
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.9)', border: '1px solid rgba(0,208,233,0.15)', cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,208,233,0.15)'; }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>进港大道拥堵态势</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>点击查看详情 · 路段车辆/危化品/流入趋势</div>
      </div>

      <MapVideoDock />

      {/* 人员 Markers */}
      {mapReady && fieldPersons.map(person => (
        <PersonMarker
          key={person.id}
          person={person}
          map={mapInstance.current}
          onClick={handlePersonClick}
          isSelected={selectedPerson?.id === person.id}
        />
      ))}

      {/* 来电弹窗 */}
      {showIncomingCall && incomingCallPerson && (
        <IncomingCallModal
          person={incomingCallPerson}
          message={incomingCallMessage}
          onAcceptVideo={handleAcceptVideo}
          onAcceptVoice={handleAcceptVoice}
          onDecline={handleDeclineCall}
        />
      )}

      {/* 人员操作弹窗 */}
      {selectedPerson && popupPosition && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            left: popupPosition.x - 100,
            top: popupPosition.y - 140,
            width: 200,
            background: 'rgba(13,27,42,0.95)',
            border: '1px solid rgba(0,208,233,0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: 8,
            padding: 12,
            zIndex: 300,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'personPopupFadeIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 人员信息 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>
              {selectedPerson.name} · {selectedPerson.department}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              状态：{selectedPerson.task || '空闲'}
            </div>
          </div>

          {/* 分隔线 */}
          <div style={{ height: 1, background: 'rgba(0,208,233,0.15)', marginBottom: 12 }} />

          {/* 操作按钮 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => {
                startCall(selectedPerson.id);
                addCommandFeedItem(`发起与${selectedPerson.name}的视频通话`);
                setSelectedPerson(null);
                setPopupPosition(null);
              }}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 6,
                border: '1px solid rgba(0,208,233,0.3)',
                background: 'rgba(0,208,233,0.1)',
                color: '#00D0E9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,208,233,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,208,233,0.1)';
              }}
            >
              <Video size={14} />
              视频通话
            </button>

            <button
              onClick={() => {
                openChatWith(selectedPerson.id);
                setSelectedPerson(null);
                setPopupPosition(null);
              }}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 6,
                border: '1px solid rgba(0,208,233,0.3)',
                background: 'rgba(0,208,233,0.1)',
                color: '#00D0E9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,208,233,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,208,233,0.1)';
              }}
            >
              <MessageSquare size={14} />
              发送消息
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dronePulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0,208,233,0.6); }
          50% { box-shadow: 0 0 20px rgba(0,208,233,1), 0 0 30px rgba(0,208,233,0.4); }
        }
        @keyframes personPopupFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes droneRotorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 地图控制按钮 */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 10
      }}>
        <button aria-label="放大地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16
        }} onClick={() => mapInstance.current?.zoomIn()}>+</button>
        <button aria-label="缩小地图" style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: '1px solid rgba(0, 208, 233, 0.2)',
          background: 'rgba(10, 15, 25, 0.9)',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16
        }} onClick={() => mapInstance.current?.zoomOut()}>-</button>
      </div>
    </div>
  );
}
