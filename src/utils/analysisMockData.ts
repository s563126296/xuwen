import type { HistoryEventType, HistoryEventSeverity, HistoryEventStatus } from '../stores/analysisStore';

export interface TrendDataPoint {
  date: string;
  flow: number;
  congestionIndex: number;
  portDigestion: number;
}

export interface HeatmapCell {
  day: number; // 0=Mon, 6=Sun
  hour: number; // 0-23
  value: number;
}

const STRATEGY_NAMES: Record<string, string> = {
  'S-01': '进港大道单向通行',
  'S-02': 'S376省道分流',
  'S-03': 'G207国道分流',
  'S-04': '港口入口潮汐车道',
  'S-05': '信号灯绿波协调',
  'S-06': '货车限时通行',
  'S-07': '临时停车区启用',
  'S-08': '交警现场疏导',
  'S-09': '诱导屏信息发布',
  'S-10': '无人机巡查监控',
  'S-11': '应急车道开放',
  'S-12': '港口分批放行',
  'S-13': '进港大道双向通行恢复',
  'S-14': '冷链车优先通道',
  'S-15': '危化品车专用时段',
};

export function generateHistoryEvents() {
  return [
    {
      id: 'evt-001',
      name: '台风"摩羯"停航事件',
      type: 'typhoon' as HistoryEventType,
      severity: 'critical' as HistoryEventSeverity,
      startTime: '2026-04-15T06:00:00',
      endTime: '2026-04-17T18:00:00',
      status: 'archived' as HistoryEventStatus,
      location: '徐闻港+海安港',
      peakCongestionIndex: 8.7,
      maxStrandedVehicles: 3280,
      strategiesUsed: ['S-01', 'S-07', 'S-08', 'S-09', 'S-12'],
      responseLevel: 'II' as const,
      summary: '台风摩羯红色预警，双港停航62小时，启动II级应急响应，最大滞留3280辆',
      timeline: [
        { time: '2026-04-15 06:00', action: '港口宣布停航', actor: '港口管理方', result: '停航通知发布' },
        { time: '2026-04-15 06:30', action: '启动II级应急响应', actor: '县应急办', result: '应急预案激活' },
        { time: '2026-04-15 08:00', action: '开放P-1/P-2临时停车区', actor: '交通局', result: '容纳1200辆' },
        { time: '2026-04-17 18:00', action: '港口复航', actor: '港口管理方', result: '逐步消化积压' },
      ],
    },
    {
      id: 'evt-002',
      name: '清明节返程高峰',
      type: 'congestion' as HistoryEventType,
      severity: 'major' as HistoryEventSeverity,
      startTime: '2026-04-07T14:00:00',
      endTime: '2026-04-07T22:00:00',
      status: 'archived' as HistoryEventStatus,
      location: '进港大道',
      peakCongestionIndex: 6.8,
      maxStrandedVehicles: 1850,
      strategiesUsed: ['S-01', 'S-04', 'S-05', 'S-08'],
      responseLevel: null,
      summary: '清明假期最后一天返程高峰，进港大道拥堵8小时，采用单向通行+潮汐车道缓解',
      timeline: [
        { time: '2026-04-07 14:00', action: '拥堵指数突破6.0', actor: '系统监测', result: 'AI建议启动S-01' },
        { time: '2026-04-07 14:30', action: '进港大道单向通行', actor: '交警支队', result: '拥堵指数降至5.2' },
        { time: '2026-04-07 22:00', action: '恢复双向通行', actor: '交警支队', result: '拥堵解除' },
      ],
    },
    {
      id: 'evt-003',
      name: '大雾停航（能见度<200m）',
      type: 'fog' as HistoryEventType,
      severity: 'major' as HistoryEventSeverity,
      startTime: '2026-03-28T02:00:00',
      endTime: '2026-03-28T11:00:00',
      status: 'archived' as HistoryEventStatus,
      location: '琼州海峡',
      peakCongestionIndex: 5.4,
      maxStrandedVehicles: 980,
      strategiesUsed: ['S-07', 'S-09', 'S-12'],
      responseLevel: 'III' as const,
      summary: '凌晨大雾导致停航9小时，启动III级响应，临时停车区分流',
      timeline: [
        { time: '2026-03-28 02:00', action: '海事局发布大雾预警', actor: '海事局', result: '港口暂停发船' },
        { time: '2026-03-28 02:30', action: '启动III级应急响应', actor: '县应急办', result: '开放临时停车区' },
        { time: '2026-03-28 11:00', action: '能见度恢复，复航', actor: '港口管理方', result: '逐步放行' },
      ],
    },
    {
      id: 'evt-004', name: '春运返程高峰', type: 'spring_rush' as HistoryEventType, severity: 'critical' as HistoryEventSeverity,
      startTime: '2026-02-15T08:00:00', endTime: '2026-02-16T20:00:00', status: 'archived' as HistoryEventStatus,
      location: '全域', peakCongestionIndex: 7.9, maxStrandedVehicles: 2650, strategiesUsed: ['S-01', 'S-02', 'S-03', 'S-04', 'S-06', 'S-08', 'S-12'],
      responseLevel: 'II' as const, summary: '春运返程最高峰，全域拥堵36小时，7项策略联合执行',
      timeline: [
        { time: '2026-02-15 08:00', action: '车流量突破日常3倍', actor: '系统监测', result: '启动春运预案' },
        { time: '2026-02-15 10:00', action: '全域策略联合执行', actor: '指挥中心', result: '拥堵指数从7.9降至5.1' },
        { time: '2026-02-16 20:00', action: '车流恢复正常', actor: '系统监测', result: '春运高峰结束' },
      ],
    },
    {
      id: 'evt-005', name: 'G207货车追尾事故', type: 'accident' as HistoryEventType, severity: 'minor' as HistoryEventSeverity,
      startTime: '2026-03-12T09:30:00', endTime: '2026-03-12T12:00:00', status: 'archived' as HistoryEventStatus,
      location: 'G207国道K12+500', peakCongestionIndex: 4.2, maxStrandedVehicles: 320, strategiesUsed: ['S-03', 'S-08', 'S-09'],
      responseLevel: null, summary: 'G207国道两辆货车追尾，占用一车道2.5小时，分流至S376',
      timeline: [
        { time: '2026-03-12 09:30', action: '事故报警', actor: '122报警', result: '交警出警' },
        { time: '2026-03-12 09:45', action: '启动G207分流', actor: '交警支队', result: '引导车辆走S376' },
        { time: '2026-03-12 12:00', action: '事故清理完毕', actor: '拖车公司', result: '恢复通行' },
      ],
    },
    {
      id: 'evt-006', name: '进港大道施工拥堵', type: 'congestion' as HistoryEventType, severity: 'minor' as HistoryEventSeverity,
      startTime: '2026-03-05T22:00:00', endTime: '2026-03-06T06:00:00', status: 'archived' as HistoryEventStatus,
      location: '进港大道K3~K5', peakCongestionIndex: 3.8, maxStrandedVehicles: 180, strategiesUsed: ['S-09', 'S-05'],
      responseLevel: null, summary: '进港大道夜间施工，限速40km/h，诱导屏提前提示绕行',
      timeline: [
        { time: '2026-03-05 22:00', action: '施工开始', actor: '施工方', result: '封闭一车道' },
        { time: '2026-03-06 06:00', action: '施工结束', actor: '施工方', result: '恢复通行' },
      ],
    },
    {
      id: 'evt-007', name: '台风"银杏"预警', type: 'typhoon' as HistoryEventType, severity: 'major' as HistoryEventSeverity,
      startTime: '2026-02-20T12:00:00', endTime: '2026-02-21T18:00:00', status: 'archived' as HistoryEventStatus,
      location: '琼州海峡', peakCongestionIndex: 6.1, maxStrandedVehicles: 1420, strategiesUsed: ['S-07', 'S-08', 'S-09', 'S-12'],
      responseLevel: 'III' as const, summary: '台风银杏黄色预警升级橙色，停航30小时，III级响应',
      timeline: [
        { time: '2026-02-20 12:00', action: '台风预警发布', actor: '气象台', result: '黄色预警' },
        { time: '2026-02-20 16:00', action: '港口停航', actor: '港口管理方', result: '启动应急预案' },
        { time: '2026-02-21 18:00', action: '复航', actor: '港口管理方', result: '积压消化' },
      ],
    },
    {
      id: 'evt-008', name: '元旦假期高峰', type: 'congestion' as HistoryEventType, severity: 'minor' as HistoryEventSeverity,
      startTime: '2026-01-01T10:00:00', endTime: '2026-01-01T18:00:00', status: 'archived' as HistoryEventStatus,
      location: '进港大道', peakCongestionIndex: 4.5, maxStrandedVehicles: 560, strategiesUsed: ['S-04', 'S-05'],
      responseLevel: null, summary: '元旦假期车流量增加40%，潮汐车道+绿波协调缓解',
      timeline: [
        { time: '2026-01-01 10:00', action: '车流量上升', actor: '系统监测', result: '启动潮汐车道' },
        { time: '2026-01-01 18:00', action: '车流回落', actor: '系统监测', result: '恢复正常' },
      ],
    },
    {
      id: 'evt-009', name: '春运启动日', type: 'spring_rush' as HistoryEventType, severity: 'major' as HistoryEventSeverity,
      startTime: '2026-01-28T06:00:00', endTime: '2026-01-28T22:00:00', status: 'archived' as HistoryEventStatus,
      location: '全域', peakCongestionIndex: 5.8, maxStrandedVehicles: 1100, strategiesUsed: ['S-01', 'S-04', 'S-06', 'S-08'],
      responseLevel: null, summary: '春运首日车流量为日常2.5倍，4项策略联合执行',
      timeline: [
        { time: '2026-01-28 06:00', action: '春运正式启动', actor: '交通局', result: '预案启动' },
        { time: '2026-01-28 08:00', action: '车流高峰到来', actor: '系统监测', result: '启动分流策略' },
        { time: '2026-01-28 22:00', action: '高峰结束', actor: '系统监测', result: '恢复正常' },
      ],
    },
    {
      id: 'evt-010', name: '冷链车集中到港', type: 'congestion' as HistoryEventType, severity: 'minor' as HistoryEventSeverity,
      startTime: '2026-03-18T04:00:00', endTime: '2026-03-18T08:00:00', status: 'archived' as HistoryEventStatus,
      location: '港口入口', peakCongestionIndex: 3.5, maxStrandedVehicles: 210, strategiesUsed: ['S-14', 'S-06'],
      responseLevel: null, summary: '凌晨冷链车集中到港，启用冷链优先通道',
      timeline: [
        { time: '2026-03-18 04:00', action: '冷链车集中到达', actor: '系统监测', result: '港口入口拥堵' },
        { time: '2026-03-18 04:30', action: '启用冷链优先通道', actor: '港口管理方', result: '冷链车优先通行' },
        { time: '2026-03-18 08:00', action: '冷链车全部通过', actor: '系统监测', result: '恢复正常' },
      ],
    },
    {
      id: 'evt-011', name: '港口设备故障停航', type: 'fog' as HistoryEventType, severity: 'major' as HistoryEventSeverity,
      startTime: '2026-02-08T10:00:00', endTime: '2026-02-08T16:00:00', status: 'archived' as HistoryEventStatus,
      location: '徐闻港', peakCongestionIndex: 5.0, maxStrandedVehicles: 780, strategiesUsed: ['S-07', 'S-09'],
      responseLevel: 'IV' as const, summary: '徐闻港栈桥设备故障，停航6小时，IV级响应',
      timeline: [
        { time: '2026-02-08 10:00', action: '设备故障报告', actor: '港口管理方', result: '暂停发船' },
        { time: '2026-02-08 16:00', action: '设备修复', actor: '港口管理方', result: '恢复运营' },
      ],
    },
    {
      id: 'evt-012', name: '五一假期首日', type: 'congestion' as HistoryEventType, severity: 'info' as HistoryEventSeverity,
      startTime: '2026-04-19T08:00:00', endTime: null, status: 'active' as HistoryEventStatus,
      location: '全域', peakCongestionIndex: 3.2, maxStrandedVehicles: 0, strategiesUsed: [],
      responseLevel: null, summary: '五一假期首日，车流量为日常1.8倍，态势平稳',
      timeline: [
        { time: '2026-04-19 08:00', action: '假期车流开始上升', actor: '系统监测', result: '态势正常' },
      ],
    },
  ];
}

export function generateStrategyRecords() {
  const records = [
    { id: 'sr-001', strategyId: 'S-01', eventId: 'evt-001', executedAt: '2026-04-15T07:00:00', completedAt: '2026-04-17T18:00:00', preIndex: 7.2, postIndex: 5.8, reliefMinutes: 45, adopted: true, executor: '交警支队李建国' },
    { id: 'sr-002', strategyId: 'S-07', eventId: 'evt-001', executedAt: '2026-04-15T06:30:00', completedAt: '2026-04-17T18:00:00', preIndex: 7.2, postIndex: 6.1, reliefMinutes: 30, adopted: true, executor: '交通局王志强' },
    { id: 'sr-003', strategyId: 'S-08', eventId: 'evt-001', executedAt: '2026-04-15T07:00:00', completedAt: '2026-04-17T18:00:00', preIndex: 8.7, postIndex: 6.5, reliefMinutes: 60, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-004', strategyId: 'S-09', eventId: 'evt-001', executedAt: '2026-04-15T06:15:00', completedAt: '2026-04-17T18:00:00', preIndex: 7.2, postIndex: 7.0, reliefMinutes: 15, adopted: true, executor: '交通局陈明' },
    { id: 'sr-005', strategyId: 'S-12', eventId: 'evt-001', executedAt: '2026-04-17T18:30:00', completedAt: '2026-04-18T06:00:00', preIndex: 5.8, postIndex: 2.1, reliefMinutes: 120, adopted: true, executor: '港口管理方刘海' },
    { id: 'sr-006', strategyId: 'S-01', eventId: 'evt-002', executedAt: '2026-04-07T14:30:00', completedAt: '2026-04-07T22:00:00', preIndex: 6.8, postIndex: 4.5, reliefMinutes: 35, adopted: true, executor: '交警支队李建国' },
    { id: 'sr-007', strategyId: 'S-04', eventId: 'evt-002', executedAt: '2026-04-07T15:00:00', completedAt: '2026-04-07T22:00:00', preIndex: 5.2, postIndex: 3.8, reliefMinutes: 40, adopted: true, executor: '交通局王志强' },
    { id: 'sr-008', strategyId: 'S-05', eventId: 'evt-002', executedAt: '2026-04-07T14:30:00', completedAt: '2026-04-07T22:00:00', preIndex: 6.8, postIndex: 5.5, reliefMinutes: 20, adopted: true, executor: '交通局陈明' },
    { id: 'sr-009', strategyId: 'S-08', eventId: 'evt-002', executedAt: '2026-04-07T14:45:00', completedAt: '2026-04-07T22:00:00', preIndex: 6.5, postIndex: 4.2, reliefMinutes: 50, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-010', strategyId: 'S-07', eventId: 'evt-003', executedAt: '2026-03-28T02:30:00', completedAt: '2026-03-28T11:00:00', preIndex: 4.8, postIndex: 3.5, reliefMinutes: 25, adopted: true, executor: '交通局王志强' },
    { id: 'sr-011', strategyId: 'S-09', eventId: 'evt-003', executedAt: '2026-03-28T02:15:00', completedAt: '2026-03-28T11:00:00', preIndex: 4.8, postIndex: 4.5, reliefMinutes: 10, adopted: true, executor: '交通局陈明' },
    { id: 'sr-012', strategyId: 'S-12', eventId: 'evt-003', executedAt: '2026-03-28T11:30:00', completedAt: '2026-03-28T14:00:00', preIndex: 5.4, postIndex: 2.0, reliefMinutes: 90, adopted: true, executor: '港口管理方刘海' },
    { id: 'sr-013', strategyId: 'S-01', eventId: 'evt-004', executedAt: '2026-02-15T08:30:00', completedAt: '2026-02-16T20:00:00', preIndex: 7.9, postIndex: 5.5, reliefMinutes: 55, adopted: true, executor: '交警支队李建国' },
    { id: 'sr-014', strategyId: 'S-02', eventId: 'evt-004', executedAt: '2026-02-15T09:00:00', completedAt: '2026-02-16T20:00:00', preIndex: 6.2, postIndex: 4.8, reliefMinutes: 40, adopted: true, executor: '交通局王志强' },
    { id: 'sr-015', strategyId: 'S-03', eventId: 'evt-004', executedAt: '2026-02-15T09:00:00', completedAt: '2026-02-16T20:00:00', preIndex: 6.2, postIndex: 4.5, reliefMinutes: 45, adopted: true, executor: '交通局陈明' },
    { id: 'sr-016', strategyId: 'S-04', eventId: 'evt-004', executedAt: '2026-02-15T10:00:00', completedAt: '2026-02-16T20:00:00', preIndex: 5.5, postIndex: 4.0, reliefMinutes: 35, adopted: true, executor: '交通局王志强' },
    { id: 'sr-017', strategyId: 'S-06', eventId: 'evt-004', executedAt: '2026-02-15T08:00:00', completedAt: '2026-02-16T20:00:00', preIndex: 7.9, postIndex: 6.8, reliefMinutes: 20, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-018', strategyId: 'S-08', eventId: 'evt-004', executedAt: '2026-02-15T08:30:00', completedAt: '2026-02-16T20:00:00', preIndex: 7.9, postIndex: 5.1, reliefMinutes: 65, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-019', strategyId: 'S-12', eventId: 'evt-004', executedAt: '2026-02-16T06:00:00', completedAt: '2026-02-16T20:00:00', preIndex: 5.1, postIndex: 2.3, reliefMinutes: 100, adopted: true, executor: '港口管理方刘海' },
    { id: 'sr-020', strategyId: 'S-03', eventId: 'evt-005', executedAt: '2026-03-12T09:45:00', completedAt: '2026-03-12T12:00:00', preIndex: 4.2, postIndex: 2.8, reliefMinutes: 30, adopted: true, executor: '交通局陈明' },
    { id: 'sr-021', strategyId: 'S-08', eventId: 'evt-005', executedAt: '2026-03-12T09:40:00', completedAt: '2026-03-12T12:00:00', preIndex: 4.2, postIndex: 3.0, reliefMinutes: 25, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-022', strategyId: 'S-09', eventId: 'evt-005', executedAt: '2026-03-12T09:35:00', completedAt: '2026-03-12T12:00:00', preIndex: 4.2, postIndex: 4.0, reliefMinutes: 10, adopted: true, executor: '交通局陈明' },
    { id: 'sr-023', strategyId: 'S-09', eventId: 'evt-006', executedAt: '2026-03-05T21:30:00', completedAt: '2026-03-06T06:00:00', preIndex: 3.8, postIndex: 3.5, reliefMinutes: 10, adopted: true, executor: '交通局陈明' },
    { id: 'sr-024', strategyId: 'S-05', eventId: 'evt-006', executedAt: '2026-03-05T22:00:00', completedAt: '2026-03-06T06:00:00', preIndex: 3.8, postIndex: 3.2, reliefMinutes: 15, adopted: true, executor: '交通局王志强' },
    { id: 'sr-025', strategyId: 'S-07', eventId: 'evt-007', executedAt: '2026-02-20T16:30:00', completedAt: '2026-02-21T18:00:00', preIndex: 5.5, postIndex: 4.2, reliefMinutes: 30, adopted: true, executor: '交通局王志强' },
    { id: 'sr-026', strategyId: 'S-08', eventId: 'evt-007', executedAt: '2026-02-20T16:00:00', completedAt: '2026-02-21T18:00:00', preIndex: 6.1, postIndex: 4.8, reliefMinutes: 45, adopted: true, executor: '交警支队张伟' },
    { id: 'sr-027', strategyId: 'S-04', eventId: 'evt-008', executedAt: '2026-01-01T10:30:00', completedAt: '2026-01-01T18:00:00', preIndex: 4.5, postIndex: 3.2, reliefMinutes: 30, adopted: true, executor: '交通局王志强' },
    { id: 'sr-028', strategyId: 'S-05', eventId: 'evt-008', executedAt: '2026-01-01T10:00:00', completedAt: '2026-01-01T18:00:00', preIndex: 4.5, postIndex: 3.8, reliefMinutes: 15, adopted: true, executor: '交通局陈明' },
    { id: 'sr-029', strategyId: 'S-14', eventId: 'evt-010', executedAt: '2026-03-18T04:30:00', completedAt: '2026-03-18T08:00:00', preIndex: 3.5, postIndex: 2.0, reliefMinutes: 20, adopted: true, executor: '港口管理方刘海' },
    { id: 'sr-030', strategyId: 'S-06', eventId: 'evt-010', executedAt: '2026-03-18T04:00:00', completedAt: '2026-03-18T08:00:00', preIndex: 3.5, postIndex: 2.8, reliefMinutes: 15, adopted: false, executor: '交警支队李建国' },
  ];
  return records.map(r => ({ ...r, strategyName: STRATEGY_NAMES[r.strategyId] || r.strategyId }));
}

export function generateTrendData(startDate: string, endDate: string): TrendDataPoint[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: TrendDataPoint[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = current.getMonth();
    const isFestival = (month === 0 && current.getDate() >= 28) || (month === 1 && current.getDate() <= 16);
    const baseFlow = isWeekend ? 8500 : 6200;
    const festivalBoost = isFestival ? 1.8 : 1;
    const noise = 0.85 + Math.random() * 0.3;
    const flow = Math.round(baseFlow * festivalBoost * noise);
    const congestion = +(1.5 + (flow / 6000) * 2 + (Math.random() - 0.5) * 0.8).toFixed(1);
    const digestion = +(65 + Math.random() * 25).toFixed(0);
    data.push({
      date: current.toISOString().slice(0, 10),
      flow,
      congestionIndex: Math.min(congestion, 9.5),
      portDigestion: +digestion,
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

export function generateHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekend = day >= 5;
      const isPeak = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
      const isNight = hour >= 22 || hour <= 5;
      let base = isNight ? 800 : 3500;
      if (isPeak) base *= isWeekend ? 1.6 : 2.0;
      if (isWeekend && !isNight) base *= 1.3;
      const noise = 0.8 + Math.random() * 0.4;
      cells.push({ day, hour, value: Math.round(base * noise) });
    }
  }
  return cells;
}

export function filterEvents(
  events: { id: string; name: string; type: string; startTime: string; location: string; summary: string; [key: string]: any }[],
  filters: { dateRange?: { start: string; end: string }; eventTypes?: string[]; region?: string; searchKeyword?: string }
) {
  return events.filter(e => {
    if (filters.dateRange) {
      if (e.startTime < filters.dateRange.start || e.startTime > filters.dateRange.end + 'T23:59:59') return false;
    }
    if (filters.eventTypes?.length && !filters.eventTypes.includes(e.type)) return false;
    if (filters.region && filters.region !== 'all') {
      const regionMap: Record<string, string[]> = {
        port_road: ['进港大道'], s376: ['S376'], g207: ['G207'], county: ['县城', '城区'], port: ['港口', '徐闻港', '海安港'],
      };
      const keywords = regionMap[filters.region] || [];
      if (keywords.length && !keywords.some(k => e.location.includes(k))) return false;
    }
    if (filters.searchKeyword && !e.name.includes(filters.searchKeyword) && !e.summary.includes(filters.searchKeyword)) return false;
    return true;
  });
}
