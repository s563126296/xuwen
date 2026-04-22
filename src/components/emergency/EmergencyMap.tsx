import { useState } from 'react';
import { useEmergencyStore, type EmergencyResourcePoint, type SpecialVehicleDetail } from '../../stores/emergencyStore';
import SemanticOperationsMap, {
  type SemanticCorridor,
  type SemanticFlow,
  type SemanticHazard,
  type SemanticNode,
  type SemanticTone,
} from '../map/SemanticOperationsMap';

type SelectedEmergencyEntity =
  | { kind: 'resource'; id: string }
  | { kind: 'vehicle'; id: string };

// 坐标基于 1600x720 viewBox
const RESOURCE_POSITIONS: Record<string, { x: number; y: number; marker: string }> = {
  p1: { x: 450, y: 340, marker: 'P1' },
  p2: { x: 580, y: 310, marker: 'P2' },
  s1: { x: 650, y: 350, marker: '物' },
  g1: { x: 520, y: 370, marker: '警' },
  d1: { x: 720, y: 280, marker: 'U' },
};

const VEHICLE_POSITIONS: Record<string, { x: number; y: number }> = {
  'sv-1': { x: 420, y: 390 },
  'sv-2': { x: 500, y: 370 },
  'sv-3': { x: 580, y: 340 },
  'sv-4': { x: 660, y: 310 },
  'sv-5': { x: 740, y: 270 },
  'sv-6': { x: 810, y: 230 },
};

const typeLabel: Record<SpecialVehicleDetail['type'], string> = {
  cold_chain: '冷链车',
  hazardous: '危化品车',
  lithium_battery: '锂电池车',
};

const alertTone: Record<SpecialVehicleDetail['alertLevel'], SemanticTone> = {
  normal: 'cyan',
  yellow: 'amber',
  orange: 'amber',
  red: 'red',
};

const resourceTone: Record<EmergencyResourcePoint['status'], SemanticTone> = {
  normal: 'cyan',
  warning: 'amber',
  critical: 'red',
};

const resourceTypeLabel: Record<EmergencyResourcePoint['type'], string> = {
  parking: '停车承接',
  supply: '物资保障',
  personnel: '现场警力',
  drone: '空中巡查',
  fuel: '燃油补给',
};

function getEmergencyTone(level: string): SemanticTone {
  if (level === 'I' || level === 'II') return 'red';
  if (level === 'III') return 'amber';
  return 'cyan';
}

function getResourceMarker(point: EmergencyResourcePoint) {
  return RESOURCE_POSITIONS[point.id]?.marker ?? resourceTypeLabel[point.type].slice(0, 1);
}

export default function EmergencyMap() {
  const emergency = useEmergencyStore((s) => s.emergencyState);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEmergencyEntity>({ kind: 'resource', id: 'p1' });

  const {
    emergencyLevel,
    forecast,
    isDroneDeployed,
    phaseLabel,
    portShutdown,
    resourcePoints,
    specialVehicles,
    tasks,
    typhoon,
  } = emergency;

  const emergencyTone = getEmergencyTone(emergencyLevel);
  const typhoonProgress = Math.max(0, Math.min(1, 1 - typhoon.distance / 85));
  const typhoonX = 1350 - typhoonProgress * 600;
  const typhoonY = 500 + typhoonProgress * 50;

  const p1Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 82));
  const p2Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 46));
  const executingTaskCount = tasks.filter((task) => task.status === 'executing' || task.status === 'arrived').length;

  const corridors: SemanticCorridor[] = [
    {
      id: 'stranded-main',
      label: 'S548 进港大道',
      path: 'M860,200 C780,260 660,310 540,360 C480,385 430,400 380,412',
      tone: emergencyTone,
      width: 16,
      status: `${forecast.currentStrandedVehicles.toLocaleString()}辆滞留 · 峰值${forecast.peakStrandedVehicles.toLocaleString()}辆`,
      labelX: 720,
      labelY: 260,
      pulse: true,
    },
    {
      id: 'parking-transfer',
      label: '停车分拨',
      path: 'M540,360 C510,350 480,345 450,340 M660,310 C640,310 610,310 580,310',
      tone: 'amber',
      width: 9,
      dashed: true,
      status: `P-1 ${p1Usage}% · P-2 ${p2Usage}%`,
      labelX: 430,
      labelY: 290,
    },
    {
      id: 'supply-line',
      label: '物资配送',
      path: 'M650,350 C600,355 550,360 510,370 M650,350 C630,340 610,325 580,310',
      tone: 'green',
      width: 7,
      dashed: true,
      status: '盒饭·饮水·燃油',
      labelX: 760,
      labelY: 370,
    },
    {
      id: 'drone-loop',
      label: '无人机巡查',
      path: 'M720,280 C800,260 880,300 860,360 C840,390 740,380 630,350 C580,330 620,280 720,280',
      tone: isDroneDeployed ? 'cyan' : 'muted',
      width: 4,
      dashed: true,
      status: isDroneDeployed ? 'UAV-01巡查中' : '待派出',
      labelX: 900,
      labelY: 300,
    },
  ];

  const flows: SemanticFlow[] = [
    {
      id: 'typhoon-forecast',
      path: `M1350,500 C${1200 - typhoonProgress * 300},${520 - typhoonProgress * 20} ${1000 - typhoonProgress * 200},${540 - typhoonProgress * 40} ${typhoonX},${typhoonY}`,
      tone: 'red',
      label: '台风预测路径',
      labelX: 1100,
      labelY: 520,
      dashed: true,
      width: 3,
    },
    {
      id: 'recovery-output',
      path: 'M380,412 C550,480 850,530 1200,570',
      tone: 'cyan',
      label: '复航疏散方向',
      labelX: 850,
      labelY: 540,
      dashed: true,
      width: 3,
    },
  ];

  const hazards: SemanticHazard[] = [
    {
      id: 'typhoon',
      x: typhoonX,
      y: typhoonY,
      radius: 66,
      label: `台风${typhoon.name}`,
      caption: `${typhoon.warningLevel}预警 / ${typhoon.distance}km`,
      tone: emergencyTone,
      variant: 'storm',
    },
    {
      id: 'shutdown-impact',
      x: 380,
      y: 412,
      radius: 58,
      label: '停航影响圈',
      caption: `预计停航 ${forecast.estimatedShutdownHours}h`,
      tone: 'red',
      variant: 'impact',
    },
  ];

  const resourceNodes: SemanticNode[] = resourcePoints.map((point) => {
    const position = RESOURCE_POSITIONS[point.id] ?? { x: 620, y: 390, marker: getResourceMarker(point) };
    const tone = resourceTone[point.status];
    return {
      id: point.id,
      x: position.x,
      y: position.y,
      label: point.name.replace(' 港口周边', '').replace(' S376 交叉口', ''),
      caption: resourceTypeLabel[point.type],
      marker: getResourceMarker(point),
      tone,
      shape: point.type === 'parking' ? 'square' : point.type === 'drone' ? 'diamond' : 'circle',
      active: selectedEntity.kind === 'resource' && selectedEntity.id === point.id,
      pulse: point.status !== 'normal' || point.type === 'drone',
      onClick: () => setSelectedEntity({ kind: 'resource', id: point.id }),
    };
  });

  const vehicleNodes: SemanticNode[] = specialVehicles.map((vehicle) => {
    const position = VEHICLE_POSITIONS[vehicle.id] ?? { x: 520, y: 440 };
    const tone = alertTone[vehicle.alertLevel];
    const marker = vehicle.type === 'hazardous' ? '危' : vehicle.type === 'lithium_battery' ? '锂' : '冷';
    return {
      id: vehicle.id,
      x: position.x,
      y: position.y,
      label: vehicle.plateNumber,
      caption: typeLabel[vehicle.type],
      marker,
      tone,
      shape: 'square',
      active: selectedEntity.kind === 'vehicle' && selectedEntity.id === vehicle.id,
      pulse: vehicle.alertLevel === 'red' || vehicle.alertLevel === 'orange',
      onClick: () => setSelectedEntity({ kind: 'vehicle', id: vehicle.id }),
    };
  });

  const fixedNodes: SemanticNode[] = [
    {
      id: 'xuwen-port-closed',
      x: 380,
      y: 412,
      label: '徐闻港',
      caption: portShutdown ? '已停航' : '可通行',
      marker: '港',
      tone: portShutdown ? 'red' : 'green',
      shape: 'square',
      pulse: portShutdown,
    },
    {
      id: 'command-base',
      x: 1100,
      y: 120,
      label: '县应急指挥点',
      caption: `${executingTaskCount}项执行中`,
      marker: '指',
      tone: 'cyan',
      shape: 'diamond',
    },
  ];

  const nodes = [...fixedNodes, ...resourceNodes, ...vehicleNodes];

  const legend = [
    { label: '滞留主链', tone: emergencyTone, type: 'line' as const },
    { label: '停车分拨', tone: 'amber' as const, type: 'dash' as const },
    { label: '物资配送', tone: 'green' as const, type: 'dash' as const },
    { label: '特殊车辆', tone: 'red' as const, type: 'dot' as const },
  ];

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <SemanticOperationsMap
        mode="emergency"
        title=""
        subtitle={`${phaseLabel} · 滞留${forecast.currentStrandedVehicles.toLocaleString()}辆 · 冷链${forecast.coldChainVehicles}辆 · 危化${forecast.hazardousVehicles}辆 · 台风${typhoon.distance}km · ${typhoon.warningLevel}预警`}
        statusLabel={`${emergencyLevel}级响应`}
        statusTone={emergencyTone}
        corridors={corridors}
        nodes={nodes}
        flows={flows}
        hazards={hazards}
        legend={legend}
      />
    </div>
  );
}
