import type { EmergencyPlan, PlanId } from '../store/dashboardStore';

export const EMERGENCY_PLANS: EmergencyPlan[] = [
  {
    id: 'typhoon',
    name: '台风停航应急预案',
    scenario: '台风导致琼州海峡停航，大量车辆滞留徐闻',
    triggerConditions: [
      '气象台发布台风蓝色及以上预警',
      '海事局发布停航通知',
      '预计停航时间超过 6 小时',
    ],
    coreMeasures: ['交通管控与车辆分流', '滞留人员生活保障', '特殊车辆优先通行'],
    responsibleDepts: ['公安交警', '交通运输局', '港口管理方', '民政局', '城管局', '应急管理局'],
    steps: [
      // 预警期
      { id: 'typhoon-warning-01', phase: 'warning', department: '港口管理方', title: '发布停航预警公告', detail: '通过官网、微信公众号、现场广播发布停航预警', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 30, completionCriteria: '公告已发布且覆盖全渠道', order: 1 },
      { id: 'typhoon-warning-02', phase: 'warning', department: '公安交警', title: '部署警力到关键路口', detail: '在进港公路、G15 出口、县城主干道部署警力', priority: 'high', owner: '交警大队', timeLimitMinutes: 60, completionCriteria: '6 个关键点位警力到位', order: 2 },
      { id: 'typhoon-warning-03', phase: 'warning', department: '民政局', title: '开放临时安置点', detail: '启用体育馆、文化中心作为临时安置点', priority: 'medium', owner: '民政局应急科', timeLimitMinutes: 90, completionCriteria: '安置点开放且具备接待能力', order: 3 },
      { id: 'typhoon-warning-04', phase: 'warning', department: '交通运输局', title: '协调客运班线加密', detail: '联系客运站增加发车频次，疏导旅客', priority: 'medium', owner: '运管所', timeLimitMinutes: 60, completionCriteria: '班线频次提升 30%', order: 4 },
      // 停航初期
      { id: 'typhoon-shutdown-01', phase: 'shutdown_start', department: '港口管理方', title: '正式停航并发布公告', detail: '停止售票、关闭进港通道、发布正式停航公告', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 15, completionCriteria: '停航公告已发布', order: 1 },
      { id: 'typhoon-shutdown-02', phase: 'shutdown_start', department: '公安交警', title: '启动交通管制', detail: '在进港公路设置分流点，引导车辆到临时停车区', priority: 'high', owner: '交警大队', timeLimitMinutes: 30, completionCriteria: '分流点设置完成', order: 2 },
      { id: 'typhoon-shutdown-03', phase: 'shutdown_start', department: '城管局', title: '启动临时停车区', detail: '开放 P-1、P-2 停车区，部署引导人员', priority: 'high', owner: '城管执法大队', timeLimitMinutes: 45, completionCriteria: '停车区开放且有序引导', order: 3 },
      { id: 'typhoon-shutdown-04', phase: 'shutdown_start', department: '民政局', title: '启动物资发放', detail: '在安置点和停车区设置物资发放点', priority: 'medium', owner: '民政局应急科', timeLimitMinutes: 60, completionCriteria: '发放点设置完成', order: 4 },
      // 滞留高峰
      { id: 'typhoon-peak-01', phase: 'peak', department: '民政局', title: '加强物资供应', detail: '增加盒饭、饮用水、雨衣等物资配送频次', priority: 'high', owner: '民政局应急科', timeLimitMinutes: 30, completionCriteria: '物资供应充足', order: 1 },
      { id: 'typhoon-peak-02', phase: 'peak', department: '公安交警', title: '增派现场警力', detail: '增派警力维护停车区秩序，防止拥堵', priority: 'high', owner: '交警大队', timeLimitMinutes: 45, completionCriteria: '现场秩序良好', order: 2 },
      { id: 'typhoon-peak-03', phase: 'peak', department: '交通运输局', title: '协调冷库资源', detail: '联系周边县市冷库企业，为冷链车提供临时冷藏', priority: 'high', owner: '运管所', timeLimitMinutes: 60, completionCriteria: '冷库资源对接完成', order: 3 },
      { id: 'typhoon-peak-04', phase: 'peak', department: '应急管理局', title: '请求上级支援', detail: '向市应急管理局汇报，请求物资和人员支援', priority: 'medium', owner: '应急指挥中心', timeLimitMinutes: 90, completionCriteria: '支援请求已发出', order: 4 },
      // 复航准备
      { id: 'typhoon-recovery-prep-01', phase: 'recovery_prepare', department: '港口管理方', title: '检查港口设施', detail: '检查码头、引桥、设备是否受损', priority: 'high', owner: '港务工程部', timeLimitMinutes: 60, completionCriteria: '设施检查完成且无安全隐患', order: 1 },
      { id: 'typhoon-recovery-prep-02', phase: 'recovery_prepare', department: '公安交警', title: '检查道路通行条件', detail: '巡查进港公路，清理障碍物', priority: 'high', owner: '交警大队', timeLimitMinutes: 45, completionCriteria: '道路畅通', order: 2 },
      { id: 'typhoon-recovery-prep-03', phase: 'recovery_prepare', department: '港口管理方', title: '通知滞留司机准备', detail: '通过广播、短信通知司机做好进港准备', priority: 'medium', owner: '港务调度中心', timeLimitMinutes: 30, completionCriteria: '通知已发送', order: 3 },
      // 复航消化
      { id: 'typhoon-recovery-01', phase: 'recovery', department: '港口管理方', title: '恢复售票和进港', detail: '开放售票窗口，恢复进港通道', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 15, completionCriteria: '售票和进港已恢复', order: 1 },
      { id: 'typhoon-recovery-02', phase: 'recovery', department: '公安交警', title: '组织有序进港', detail: '按批次放行车辆，避免拥堵', priority: 'high', owner: '交警大队', timeLimitMinutes: 120, completionCriteria: '车辆有序进港', order: 2 },
      { id: 'typhoon-recovery-03', phase: 'recovery', department: '港口管理方', title: '监控疏散进度', detail: '实时监控滞留车辆数量，调整放行节奏', priority: 'medium', owner: '港务调度中心', timeLimitMinutes: 180, completionCriteria: '滞留车辆降至 200 辆以下', order: 3 },
    ],
  },
  {
    id: 'fog',
    name: '大雾停航应急预案',
    scenario: '海峡大雾导致能见度不足，港口临时停航',
    triggerConditions: ['能见度低于 1000 米', '海事局发布大雾预警', '预计停航超过 3 小时'],
    coreMeasures: ['发布预警信息', '车辆分流管控', '复航快速响应'],
    responsibleDepts: ['公安交警', '港口管理方', '交通运输局'],
    steps: [
      { id: 'fog-warning-01', phase: 'warning', department: '港口管理方', title: '发布大雾预警通知', detail: '通过广播和公众号发布大雾预警，提示司机等待', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 15, completionCriteria: '预警通知已发布', order: 1 },
      { id: 'fog-warning-02', phase: 'warning', department: '公安交警', title: '部署路口引导警力', detail: '在进港公路关键路口部署警力，防止车辆盲目进港', priority: 'high', owner: '交警大队', timeLimitMinutes: 30, completionCriteria: '路口警力到位', order: 2 },
      { id: 'fog-shutdown-01', phase: 'shutdown_start', department: '港口管理方', title: '暂停进港通道', detail: '关闭进港通道，引导车辆到等待区', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 10, completionCriteria: '进港通道已关闭', order: 1 },
      { id: 'fog-shutdown-02', phase: 'shutdown_start', department: '公安交警', title: '启动临时等待区', detail: '开放 P-1 停车区作为临时等待区', priority: 'medium', owner: '交警大队', timeLimitMinutes: 20, completionCriteria: '等待区开放', order: 2 },
      { id: 'fog-peak-01', phase: 'peak', department: '民政局', title: '发放基本物资', detail: '为等待司机发放饮用水和简餐', priority: 'medium', owner: '民政局应急科', timeLimitMinutes: 60, completionCriteria: '物资发放到位', order: 1 },
      { id: 'fog-recovery-prep-01', phase: 'recovery_prepare', department: '港口管理方', title: '确认能见度恢复', detail: '与海事局确认能见度已达复航标准', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 15, completionCriteria: '复航条件确认', order: 1 },
      { id: 'fog-recovery-01', phase: 'recovery', department: '港口管理方', title: '恢复进港通道', detail: '开放进港通道，有序放行等待车辆', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 10, completionCriteria: '进港通道已恢复', order: 1 },
      { id: 'fog-recovery-02', phase: 'recovery', department: '公安交警', title: '疏导等待车辆进港', detail: '按批次引导等待区车辆进港', priority: 'high', owner: '交警大队', timeLimitMinutes: 60, completionCriteria: '等待车辆有序进港', order: 2 },
    ],
  },
  {
    id: 'spring_rush',
    name: '春运高峰应急预案',
    scenario: '春节前后旅客返乡高峰，港口及道路超负荷',
    triggerConditions: ['日车流量超过日常 3 倍', '港口等待车辆超过 2000 辆', '进港大道拥堵超过 5 公里'],
    coreMeasures: ['多通道分流', '增加运力', '旅客服务保障'],
    responsibleDepts: ['公安交警', '交通运输局', '港口管理方', '民政局'],
    steps: [
      { id: 'spring-warning-01', phase: 'warning', department: '交通运输局', title: '发布春运高峰预警', detail: '提前 3 天发布春运高峰预警，建议错峰出行', priority: 'high', owner: '运管所', timeLimitMinutes: 60, completionCriteria: '预警信息已发布', order: 1 },
      { id: 'spring-warning-02', phase: 'warning', department: '港口管理方', title: '增加班次运力', detail: '协调增加渡轮班次，提升运力 30%', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 120, completionCriteria: '增班方案已落实', order: 2 },
      { id: 'spring-shutdown-01', phase: 'shutdown_start', department: '公安交警', title: '启动多通道分流', detail: '启用 G207、S376、环半岛公路三条分流通道', priority: 'high', owner: '交警大队', timeLimitMinutes: 30, completionCriteria: '三条分流通道已启用', order: 1 },
      { id: 'spring-shutdown-02', phase: 'shutdown_start', department: '城管局', title: '开放全部停车区', detail: '开放 P-1 至 P-4 全部临时停车区', priority: 'high', owner: '城管执法大队', timeLimitMinutes: 45, completionCriteria: '全部停车区开放', order: 2 },
      { id: 'spring-peak-01', phase: 'peak', department: '民政局', title: '设立旅客服务站', detail: '在主要等待区设立旅客服务站，提供饮食、医疗、充电服务', priority: 'high', owner: '民政局应急科', timeLimitMinutes: 60, completionCriteria: '服务站运营正常', order: 1 },
      { id: 'spring-peak-02', phase: 'peak', department: '应急管理局', title: '协调省级支援', detail: '向省应急管理厅申请增援警力和物资', priority: 'medium', owner: '应急指挥中心', timeLimitMinutes: 120, completionCriteria: '支援申请已提交', order: 2 },
      { id: 'spring-recovery-prep-01', phase: 'recovery_prepare', department: '港口管理方', title: '评估运力消化进度', detail: '统计当前等待车辆数，预测消化完毕时间', priority: 'medium', owner: '港务调度中心', timeLimitMinutes: 30, completionCriteria: '消化进度报告已出', order: 1 },
      { id: 'spring-recovery-01', phase: 'recovery', department: '公安交警', title: '逐步撤除管控措施', detail: '随车流恢复正常，逐步撤除分流管控', priority: 'medium', owner: '交警大队', timeLimitMinutes: 120, completionCriteria: '管控措施已撤除', order: 1 },
    ],
  },
  {
    id: 'major_accident',
    name: '重大交通事故应急预案',
    scenario: '进港公路发生重大交通事故，导致道路封闭',
    triggerConditions: ['事故造成人员伤亡', '道路封闭时间预计超过 2 小时', '拥堵蔓延超过 3 公里'],
    coreMeasures: ['快速救援处置', '道路绕行分流', '信息及时发布'],
    responsibleDepts: ['公安交警', '应急管理局', '交通运输局'],
    steps: [
      { id: 'accident-warning-01', phase: 'warning', department: '公安交警', title: '封锁事故现场', detail: '立即封锁事故路段，设置警戒线', priority: 'high', owner: '交警大队', timeLimitMinutes: 10, completionCriteria: '现场已封锁', order: 1 },
      { id: 'accident-warning-02', phase: 'warning', department: '应急管理局', title: '调度救援力量', detail: '调度消防、急救、拖车等救援力量到场', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 15, completionCriteria: '救援力量已到场', order: 2 },
      { id: 'accident-shutdown-01', phase: 'shutdown_start', department: '公安交警', title: '启动绕行分流', detail: '在事故上游设置绕行指示，引导车辆走 G207 绕行', priority: 'high', owner: '交警大队', timeLimitMinutes: 20, completionCriteria: '绕行分流已启动', order: 1 },
      { id: 'accident-shutdown-02', phase: 'shutdown_start', department: '交通运输局', title: '发布道路封闭信息', detail: '通过交通广播、导航平台发布封闭信息', priority: 'high', owner: '运管所', timeLimitMinutes: 15, completionCriteria: '封闭信息已发布', order: 2 },
      { id: 'accident-peak-01', phase: 'peak', department: '应急管理局', title: '协调清障作业', detail: '协调拖车公司清除事故车辆，恢复通行条件', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 60, completionCriteria: '事故车辆已清除', order: 1 },
      { id: 'accident-recovery-prep-01', phase: 'recovery_prepare', department: '公安交警', title: '检查道路通行条件', detail: '检查路面是否有油污、碎片，确认安全后开放', priority: 'high', owner: '交警大队', timeLimitMinutes: 20, completionCriteria: '道路安全确认', order: 1 },
      { id: 'accident-recovery-01', phase: 'recovery', department: '公安交警', title: '恢复道路通行', detail: '撤除封锁，恢复双向通行', priority: 'high', owner: '交警大队', timeLimitMinutes: 10, completionCriteria: '道路已恢复通行', order: 1 },
    ],
  },
  {
    id: 'extreme_stranding',
    name: '极端滞留应急预案',
    scenario: '停航超过 72 小时，滞留车辆超过 5000 辆',
    triggerConditions: ['停航时间超过 72 小时', '滞留车辆超过 5000 辆', '物资保障出现短缺'],
    coreMeasures: ['省级协调支援', '大规模物资保障', '特殊群体优先疏散'],
    responsibleDepts: ['应急管理局', '民政局', '公安交警', '交通运输局', '港口管理方'],
    steps: [
      { id: 'extreme-warning-01', phase: 'warning', department: '应急管理局', title: '启动省级协调机制', detail: '向省应急管理厅报告，请求启动省级协调', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 30, completionCriteria: '省级协调已启动', order: 1 },
      { id: 'extreme-warning-02', phase: 'warning', department: '民政局', title: '扩大安置容量', detail: '启用学校、体育场等大型场所作为安置点', priority: 'high', owner: '民政局应急科', timeLimitMinutes: 120, completionCriteria: '安置容量扩大至 5000 人', order: 2 },
      { id: 'extreme-shutdown-01', phase: 'shutdown_start', department: '公安交警', title: '实施区域交通管制', detail: '对徐闻县全域实施交通管制，禁止新增车辆进入', priority: 'high', owner: '交警大队', timeLimitMinutes: 60, completionCriteria: '区域管制已实施', order: 1 },
      { id: 'extreme-peak-01', phase: 'peak', department: '民政局', title: '大规模物资调配', detail: '协调省级物资储备，调入大批食品、饮水、药品', priority: 'high', owner: '民政局应急科', timeLimitMinutes: 120, completionCriteria: '省级物资已到位', order: 1 },
      { id: 'extreme-peak-02', phase: 'peak', department: '交通运输局', title: '组织特殊群体疏散', detail: '优先安排老人、儿童、病患等特殊群体乘客运班车离开', priority: 'high', owner: '运管所', timeLimitMinutes: 180, completionCriteria: '特殊群体已疏散', order: 2 },
      { id: 'extreme-recovery-prep-01', phase: 'recovery_prepare', department: '港口管理方', title: '制定分批复航方案', detail: '制定冷链车、危化品车、普通车辆分批进港方案', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 60, completionCriteria: '分批方案已制定', order: 1 },
      { id: 'extreme-recovery-01', phase: 'recovery', department: '港口管理方', title: '按优先级分批放行', detail: '按冷链→危化品→普通车辆顺序分批放行', priority: 'high', owner: '港务调度中心', timeLimitMinutes: 480, completionCriteria: '滞留车辆全部消化', order: 1 },
    ],
  },
  {
    id: 'cross_dept',
    name: '跨部门联合应急预案',
    scenario: '多重突发事件叠加，需要多部门高度协同',
    triggerConditions: ['同时发生两类及以上突发事件', '单部门无法独立处置', '需要县级统一指挥'],
    coreMeasures: ['统一指挥协调', '信息共享机制', '资源统一调配'],
    responsibleDepts: ['应急管理局', '公安交警', '民政局', '交通运输局', '港口管理方', '城管局'],
    steps: [
      { id: 'cross-warning-01', phase: 'warning', department: '应急管理局', title: '启动联合指挥部', detail: '在县应急管理局设立联合指挥部，各部门派驻联络员', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 30, completionCriteria: '联合指挥部已成立', order: 1 },
      { id: 'cross-warning-02', phase: 'warning', department: '应急管理局', title: '建立信息共享机制', detail: '开通各部门信息共享频道，统一信息报送格式', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 20, completionCriteria: '信息共享机制已建立', order: 2 },
      { id: 'cross-shutdown-01', phase: 'shutdown_start', department: '公安交警', title: '统一交通管控方案', detail: '由联合指挥部统一制定交通管控方案，各部门协同执行', priority: 'high', owner: '交警大队', timeLimitMinutes: 45, completionCriteria: '统一管控方案已执行', order: 1 },
      { id: 'cross-peak-01', phase: 'peak', department: '应急管理局', title: '统一资源调配', detail: '由联合指挥部统一调配警力、物资、设备等资源', priority: 'high', owner: '应急指挥中心', timeLimitMinutes: 60, completionCriteria: '资源调配完成', order: 1 },
      { id: 'cross-recovery-prep-01', phase: 'recovery_prepare', department: '应急管理局', title: '评估各事件处置进度', detail: '汇总各部门处置进度，评估整体恢复条件', priority: 'medium', owner: '应急指挥中心', timeLimitMinutes: 30, completionCriteria: '评估报告已完成', order: 1 },
      { id: 'cross-recovery-01', phase: 'recovery', department: '应急管理局', title: '有序解除应急状态', detail: '各事件处置完毕后，有序解除联合应急状态', priority: 'medium', owner: '应急指挥中心', timeLimitMinutes: 60, completionCriteria: '应急状态已解除', order: 1 },
    ],
  },
];

export function getPlanById(id: PlanId): EmergencyPlan | undefined {
  return EMERGENCY_PLANS.find(p => p.id === id);
}
