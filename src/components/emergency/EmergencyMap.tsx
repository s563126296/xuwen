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

const RESOURCE_POSITIONS: Record<string, { x: number; y: number; marker: string }> = {
  p1: { x: 350, y: 340, marker: 'P1' },
  p2: { x: 450, y: 310, marker: 'P2' },
  s1: { x: 500, y: 350, marker: '物' },
  g1: { x: 400, y: 370, marker: '警' },
  d1: { x: 550, y: 280, marker: 'U' },
};

const VEHICLE_POSITIONS: Record<string, { x: number; y: number }> = {
  'sv-1': { x: 320, y: 390 },
  'sv-2': { x: 380, y: 370 },
  'sv-3': { x: 440, y: 340 },
  'sv-4': { x: 500, y: 310 },
  'sv-5': { x: 560, y: 270 },
  'sv-6': { x: 610, y: 230 },
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
  const typhoonX = 1000 - typhoonProgress * 450;
  const typhoonY = 500 + typhoonProgress * 50;

  const p1Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 82));
  const p2Usage = Math.min(100, Math.round((forecast.currentStrandedVehicles / 3200) * 46));
  const executingTaskCount = tasks.filter((task) => task.status === 'executing' || task.status === 'arrived').length;

  const corridors: SemanticCorridor[] = [
    {
      id: 'stranded-main',
      label: '进港大道滞留链',
      path: 'M650,200 C580,260 480,310 400,360 C360,380 330,395 300,410',
      tone: emergencyTone,
      width: 16,
      status: `${forecast.currentStrandedVehicles.toLocaleString()}辆滞留 · 峰值${forecast.peakStrandedVehicles.toLocaleString()}辆`,
      labelX: 540,
      labelY: 260,
      pulse: true,
    },
    {
      id: 'parking-transfer',
      label: '停车区分拨线',
      path: 'M400,360 C380,350 360,345 350,340 M480,310 C470,310 460,310 450,310',
      tone: 'amber',
      width: 9,
      dashed: true,
      status: `P-1 ${p1Usage}% · P-2 ${p2Usage}%`,
      labelX: 340,
      labelY: 290,
    },
    {
      id: 'supply-line',
      label: '民生物资配送线',
      path: 'M500,350 C460,350 420,355 380,360 M500,350 C480,340 460,330 450,310',
      tone: 'green',
      width: 7,
      dashed: true,
      status: '盒饭·饮水·燃油',
      labelX: 580,
      labelY: 370,
    },
    {
      id: 'drone-loop',
      label: '无人机巡查闭环',
      path: 'M550,280 C620,260 680,300 660,360 C640,390 560,380 480,350 C440,330 480,280 550,280',
      tone: isDroneDeployed ? 'cyan' : 'muted',
      width: 4,
      dashed: true,
      status: isDroneDeployed ? 'UAV-01巡查中' : '待派出',
      labelX: 700,
      labelY: 300,
    },
  ];

  const flows: SemanticFlow[] = [
    {
      id: 'typhoon-forecast',
      path: `M1000,500 C${900 - typhoonProgress * 200},${520 - typhoonProgress * 20} ${700 - typhoonProgress * 100},${540 - typhoonProgress * 40} ${typhoonX},${typhoonY}`,
      tone: 'red',
      label: '台风预测路径',
      labelX: 800,
      labelY: 520,
      dashed: true,
      width: 3,
    },
    {
      id: 'recovery-output',
      path: 'M300,410 C450,480 650,520 900,560',
      tone: 'cyan',
      label: '复航疏散方向',
      labelX: 650,
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
      x: 300,
      y: 410,
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
      x: 300,
      y: 410,
      label: '徐闻港',
      caption: portShutdown ? '已停航' : '可通行',
      marker: '港',
      tone: portShutdown ? 'red' : 'green',
      shape: 'square',
      pulse: portShutdown,
    },
    {
      id: 'command-base',
      x: 850,
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
        title="停航应急资源部署语义图"
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
