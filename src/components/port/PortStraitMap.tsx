import { usePortStore } from '../../stores/portStore';
import SemanticOperationsMap, {
  type SemanticCorridor,
  type SemanticFlow,
  type SemanticHazard,
  type SemanticNode,
  type SemanticTone,
} from '../map/SemanticOperationsMap';

const statusToneMap: Record<string, SemanticTone> = {
  open: 'green',
  restricted: 'amber',
  closed: 'red',
};

const statusTextMap: Record<string, string> = {
  open: '通航',
  restricted: '限航',
  closed: '停航',
};

// 船舶状态映射
const vesselTone: Record<string, SemanticTone> = {
  sailing: 'cyan',
  docked: 'green',
  waiting: 'amber',
};
const vesselStatusText: Record<string, string> = {
  sailing: '航行中',
  docked: '靠泊',
  waiting: '候泊',
};

// 船舶位置（匹配新的港口坐标布局）
function vesselPosition(progress: number, laneId: string): { x: number; y: number } {
  const lanes: Record<string, { start: [number, number]; end: [number, number] }> = {
    'lane-徐闻港---新海港': { start: [600, 240], end: [650, 470] },
    'lane-海安新港---秀英港': { start: [1100, 250], end: [1300, 480] },
    'lane-粤海轮渡线': { start: [280, 260], end: [340, 480] },
    'lane-徐闻港---马村港': { start: [560, 240], end: [240, 510] },
  };
  const lane = lanes[laneId] || lanes['lane-徐闻港---新海港'];
  const p = Math.max(0, Math.min(1, progress));
  return {
    x: lane.start[0] + (lane.end[0] - lane.start[0]) * p + Math.sin(p * Math.PI) * 25,
    y: lane.start[1] + (lane.end[1] - lane.start[1]) * p,
  };
}

export default function PortStraitMap() {
  const straitIndex = usePortStore((s) => s.straitIndex);
  const weather = usePortStore((s) => s.weather);
  const portCapacity = usePortStore((s) => s.portCapacity);
  const vessels = usePortStore((s) => s.vessels);
  const queue = usePortStore((s) => s.queue);
  const crossingStats = usePortStore((s) => s.crossingStats);
  const selectedVessel = usePortStore((s) => s.selectedVessel);
  const setSelectedVessel = usePortStore((s) => s.setSelectedVessel);
  const selectedPort = usePortStore((s) => s.selectedPort);
  const setSelectedPort = usePortStore((s) => s.setSelectedPort);

  const navStatus = straitIndex.navigationStatus;
  const statusTone = statusToneMap[navStatus] || 'cyan';
  const sailingCount = vessels.filter((v) => v.status === 'sailing').length;
  const dockedCount = vessels.filter((v) => v.status === 'docked').length;

  // === 港口节点（重新规划坐标，充分利用 1600x720 空间）===
  const portNodes: SemanticNode[] = [
    // 北岸（y=200-240，横向展开 x=250-1350）
    {
      id: 'yuehai', x: 280, y: 220, marker: '铁', shape: 'diamond', tone: 'blue',
      label: '粤海铁路北港', caption: '铁路轮渡',
    },
    {
      id: 'xuwen', x: 600, y: 200, marker: '徐', shape: 'square', tone: 'cyan',
      label: '徐闻港',
      caption: `${portCapacity.xuwen.availableSlots}车位 · ${portCapacity.xuwen.loadRate}%`,
      active: selectedPort === 'xuwen',
      onClick: () => setSelectedPort(selectedPort === 'xuwen' ? null : 'xuwen'),
    },
    {
      id: 'haian', x: 1100, y: 210, marker: '海', shape: 'square', tone: 'cyan',
      label: '海安新港',
      caption: `${portCapacity.haian.availableSlots}车位 · ${portCapacity.haian.loadRate}%`,
      active: selectedPort === 'haian',
      onClick: () => setSelectedPort(selectedPort === 'haian' ? null : 'haian'),
    },
    // 南岸（y=500-560，横向展开 x=200-1400）
    {
      id: 'macun', x: 220, y: 540, marker: '马', shape: 'circle', tone: 'muted',
      label: '马村港', caption: '辅助锚地',
    },
    {
      id: 'xinhai', x: 650, y: 500, marker: '新', shape: 'square', tone: 'amber',
      label: '新海港', caption: '南岸主接卸',
    },
    {
      id: 'nangang', x: 850, y: 520, marker: '南', shape: 'diamond', tone: 'amber',
      label: '南港码头', caption: '铁路南港',
    },
    {
      id: 'xiuying', x: 1300, y: 510, marker: '秀', shape: 'square', tone: 'amber',
      label: '秀英港', caption: '客滚分流',
    },
  ];

  // === 船舶节点 ===
  const vesselNodes: SemanticNode[] = vessels.map((v) => {
    const pos = vesselPosition(v.progress, v.laneId);
    return {
      id: v.id,
      x: pos.x,
      y: pos.y,
      marker: v.name.slice(-1),
      label: v.name,
      caption: `${vesselStatusText[v.status]} · ${v.speed}节`,
      tone: vesselTone[v.status] || 'cyan',
      shape: 'circle',
      active: selectedVessel === v.id,
      pulse: v.status === 'sailing',
      onClick: () => setSelectedVessel(selectedVessel === v.id ? null : v.id),
    };
  });

  // === 航线走廊（匹配新坐标，路径拉开间距）===
  const corridors: SemanticCorridor[] = [
    {
      id: 'xuwen-xinhai',
      label: '徐闻港 → 新海港',
      path: 'M600,230 C590,290 600,350 620,400 C635,440 645,470 650,500',
      tone: 'cyan',
      width: 14,
      pulse: true,
      status: `${crossingStats.todayTotal.toLocaleString()}辆/日 · 装载${portCapacity.xuwen.loadRate}%`,
      labelX: 560,
      labelY: 360,
    },
    {
      id: 'haian-xiuying',
      label: '海安新港 → 秀英港',
      path: 'M1100,240 C1120,300 1160,370 1200,420 C1240,460 1270,480 1300,510',
      tone: 'amber',
      width: 10,
      status: `${portCapacity.haian.loadRate}% 装载率`,
      labelX: 1220,
      labelY: 370,
    },
    {
      id: 'yuehai-ferry',
      label: '粤海轮渡线',
      path: 'M280,250 C290,310 310,380 330,430 C345,460 355,480 370,510',
      tone: 'blue',
      width: 8,
      dashed: true,
      status: '铁路轮渡',
      labelX: 250,
      labelY: 400,
    },
    {
      id: 'xuwen-macun',
      label: '徐闻港 → 马村港',
      path: 'M570,230 C500,280 400,350 320,420 C270,470 240,510 230,540',
      tone: 'muted',
      width: 6,
      dashed: true,
      status: '辅助航线',
      labelX: 400,
      labelY: 440,
    },
  ];

  // === 车辆流线（利用左右两侧空间）===
  const flows: SemanticFlow[] = [
    {
      id: 'inbound',
      path: 'M60,120 C180,140 350,160 540,190',
      tone: 'cyan',
      label: `进港车流 ${queue.totalVehicles}辆`,
      labelX: 280,
      labelY: 130,
      width: 4,
    },
    {
      id: 'outbound',
      path: 'M720,520 C900,540 1150,550 1500,530',
      tone: 'green',
      label: '出港疏散',
      labelX: 1120,
      labelY: 540,
      width: 3,
      dashed: true,
    },
    {
      id: 'queue-pressure',
      path: 'M540,190 C480,170 400,150 320,140 C260,135 200,145 160,160',
      tone: queue.estimatedWait > 60 ? 'red' : 'amber',
      label: `待渡 ${queue.estimatedWait}min`,
      labelX: 380,
      labelY: 130,
      width: 3,
      dashed: true,
    },
  ];

  // === 危险区（居中海峡区域）===
  const hazards: SemanticHazard[] = [];
  if (weather.suspensionWarning) {
    hazards.push({
      id: 'suspension',
      x: 750,
      y: 370,
      radius: 90,
      label: '停航预警',
      caption: `风速${weather.windSpeed.toFixed(1)}m/s · 浪高${straitIndex.waveHeight}m`,
      tone: 'red',
      variant: 'impact',
    });
  }
  if (queue.estimatedWait > 90) {
    hazards.push({
      id: 'congestion',
      x: 600,
      y: 200,
      radius: 55,
      label: '拥堵预警',
      caption: `${queue.totalVehicles}辆排队 · 预计${queue.estimatedWait}min`,
      tone: 'amber',
      variant: 'impact',
    });
  }

  // === 图例 ===
  const legend = [
    { label: '主航道', tone: 'cyan' as const, type: 'line' as const },
    { label: '分流航道', tone: 'amber' as const, type: 'dash' as const },
    { label: '港口', tone: 'cyan' as const, type: 'dot' as const },
    { label: '船舶', tone: 'green' as const, type: 'dot' as const },
  ];

  const subtitle = `AIS ${sailingCount}艘航行 · ${dockedCount}艘靠泊 · 风速${weather.windSpeed.toFixed(1)}米/秒 · 浪高${straitIndex.waveHeight}米 · 今日过海${crossingStats.todayTotal.toLocaleString()}辆`;

  return (
    <SemanticOperationsMap
      mode="command"
      title="琼州海峡港航态势"
      subtitle={subtitle}
      statusLabel={statusTextMap[navStatus] || '通航'}
      statusTone={statusTone}
      corridors={corridors}
      nodes={[...portNodes, ...vesselNodes]}
      flows={flows}
      hazards={hazards}
      legend={legend}
    />
  );
}
