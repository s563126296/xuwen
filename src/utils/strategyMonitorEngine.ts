import { useCommandStore } from '../stores/commandStore';
import { useEvolutionStore } from '../stores/evolutionStore';
import type {
  CurveDataPoint,
  ExpectationVersion,
  DeviationLevel,
  ActiveInquiry,
  CommandFeedItem,
  DeviationType,
  DeviationFactor,
  DeviationAnalysis,
} from '../stores/commandStore';

let pollTimer: ReturnType<typeof setInterval> | null = null;
let inquiryTimer: ReturnType<typeof setTimeout> | null = null;

function calculateDeviation(expected: number, actual: number): {
  percent: number;
  level: DeviationLevel;
} {
  if (expected === 0) return { percent: 0, level: 'none' };
  const percent = Math.abs((actual - expected) / expected) * 100;
  if (percent > 15) return { percent: Math.round(percent), level: 'red' };
  if (percent > 10) return { percent: Math.round(percent), level: 'orange' };
  if (percent > 5) return { percent: Math.round(percent), level: 'yellow' };
  return { percent: Math.round(percent), level: 'none' };
}

function interpolateExpected(
  checkpoints: { minutesAfter: number; expected: number }[],
  minutesAfter: number,
  startIndex: number
): number {
  if (checkpoints.length === 0) return startIndex;
  if (minutesAfter <= 0) return startIndex;

  const first = checkpoints[0];
  if (minutesAfter <= first.minutesAfter) {
    const ratio = minutesAfter / first.minutesAfter;
    return startIndex + (first.expected - startIndex) * ratio;
  }

  for (let i = 0; i < checkpoints.length - 1; i++) {
    const a = checkpoints[i];
    const b = checkpoints[i + 1];
    if (minutesAfter >= a.minutesAfter && minutesAfter <= b.minutesAfter) {
      const ratio = (minutesAfter - a.minutesAfter) / (b.minutesAfter - a.minutesAfter);
      return a.expected + (b.expected - a.expected) * ratio;
    }
  }

  return checkpoints[checkpoints.length - 1].expected;
}

function generateExpectedCurve(_strategyId: string): { minutesAfter: number; expected: number }[] {
  const store = useCommandStore.getState();
  const currentIndex = store.commandState.congestionIndex;
  const predictedIndex = store.commandState.predictedIndex;

  const targetIndex = predictedIndex || (currentIndex - 2);
  const midIndex = currentIndex - (currentIndex - targetIndex) * 0.4;

  return [
    { minutesAfter: 30, expected: Number(midIndex.toFixed(1)) },
    { minutesAfter: 60, expected: Number((targetIndex + 0.5).toFixed(1)) },
    { minutesAfter: 90, expected: Number((targetIndex + 0.2).toFixed(1)) },
    { minutesAfter: 120, expected: Number(targetIndex.toFixed(1)) },
  ];
}

function analyzeDeviation(): DeviationAnalysis {
  const store = useCommandStore.getState();
  const { congestionIndex, congestionTrend, causes, focusRoad, monitorState } = store.commandState;
  const deviationPercent = monitorState.deviationPercent;

  // 11-factor analysis
  const factors: DeviationFactor[] = [];

  // 1. Congestion index severity (strategy)
  const congestionWeight = congestionIndex > 7 ? 15 : congestionIndex > 5 ? 10 : 5;
  factors.push({
    factor: '拥堵指数',
    weight: congestionWeight,
    category: 'strategy',
    description: `当前拥堵指数 ${congestionIndex.toFixed(1)}，${congestionIndex > 7 ? '严重超出策略设计范围' : congestionIndex > 5 ? '高于策略预期' : '在可控范围'}`,
  });

  // 2. Road capacity (environment)
  const vehicleLoad = focusRoad.vehicles / 1500; // normalized
  const capacityWeight = vehicleLoad > 0.9 ? 14 : vehicleLoad > 0.7 ? 9 : 4;
  factors.push({
    factor: '道路承载力',
    weight: capacityWeight,
    category: 'environment',
    description: `${focusRoad.road}当前 ${focusRoad.vehicles} 辆，${vehicleLoad > 0.9 ? '已接近饱和' : vehicleLoad > 0.7 ? '负荷较高' : '尚有余量'}`,
  });

  // 3. Weather impact (environment)
  const weatherCause = causes.find((c) => c.type === 'weather');
  const weatherWeight = weatherCause ? Math.round(weatherCause.confidence * 0.15) : 2;
  factors.push({
    factor: '天气影响',
    weight: weatherWeight,
    category: 'environment',
    description: weatherCause ? `天气因素置信度 ${weatherCause.confidence}%，影响路面通行` : '天气条件正常，无显著影响',
  });

  // 4. Time period (environment)
  const hour = new Date().getHours();
  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
  const timeWeight = isPeak ? 10 : 3;
  factors.push({
    factor: '时段因素',
    weight: timeWeight,
    category: 'environment',
    description: isPeak ? `当前为高峰时段（${hour}:00），车流量大` : `当前为平峰时段（${hour}:00），车流量适中`,
  });

  // 5. Port backlog (environment)
  const portCause = causes.find((c) => c.type === 'port_backlog');
  const portWeight = portCause ? Math.round(portCause.confidence * 0.15) : 2;
  factors.push({
    factor: '港口积压',
    weight: portWeight,
    category: 'environment',
    description: portCause ? `港口积压置信度 ${portCause.confidence}%，${portCause.description}` : '港口运行正常',
  });

  // 6. Historical effect accuracy (strategy)
  const histEffectWeight = deviationPercent > 15 ? 12 : deviationPercent > 10 ? 8 : 3;
  factors.push({
    factor: '历史效果偏差',
    weight: histEffectWeight,
    category: 'strategy',
    description: `策略历史效果与当前偏差 ${deviationPercent}%，${deviationPercent > 15 ? '策略模型需校准' : '在合理范围'}`,
  });

  // 7. Resource arrival (execution)
  const resourceWeight = 8;
  factors.push({
    factor: '资源到位情况',
    weight: resourceWeight,
    category: 'execution',
    description: '执行资源到位率需现场确认，可能存在延迟',
  });

  // 8. Diversion road condition (execution)
  const diversionWeight = congestionTrend === 'rising' ? 10 : 5;
  factors.push({
    factor: '分流道路状况',
    weight: diversionWeight,
    category: 'execution',
    description: congestionTrend === 'rising' ? '分流道路可能拥堵，分流效率降低' : '分流道路通行正常',
  });

  // 9. Truck ratio (environment)
  const truckRatio = focusRoad.dangerousGoods > 5 ? 0.3 : 0.15;
  const truckWeight = truckRatio > 0.25 ? 8 : 4;
  factors.push({
    factor: '货车占比',
    weight: truckWeight,
    category: 'environment',
    description: `危化品车 ${focusRoad.dangerousGoods} 辆，冷链车 ${focusRoad.coldChain} 辆，${truckRatio > 0.25 ? '大型车辆占比高，通行效率低' : '车型结构正常'}`,
  });

  // 10. Inflow rate (environment)
  const inflowWeight = focusRoad.futureInflow > 250 ? 10 : focusRoad.futureInflow > 150 ? 6 : 3;
  factors.push({
    factor: '车流涌入量',
    weight: inflowWeight,
    category: 'environment',
    description: `未来 30min 预计涌入 ${focusRoad.futureInflow} 辆，${focusRoad.futureInflow > 250 ? '远超策略消化能力' : '在策略处理范围内'}`,
  });

  // 11. Signal timing (execution)
  const signalWeight = 5;
  factors.push({
    factor: '信号配时',
    weight: signalWeight,
    category: 'execution',
    description: '信号配时方案执行中，需验证绿波协调效果',
  });

  // Normalize weights to sum to 100
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  factors.forEach((f) => {
    f.weight = Math.round((f.weight / totalWeight) * 100);
  });

  // Sort by weight descending
  factors.sort((a, b) => b.weight - a.weight);

  // Determine primary type by summing weights per category
  const categoryWeights: Record<DeviationType, number> = { strategy: 0, execution: 0, environment: 0 };
  factors.forEach((f) => { categoryWeights[f.category] += f.weight; });

  const primaryType = (Object.entries(categoryWeights) as [DeviationType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // Generate recommendation based on primary type
  const recommendations: Record<DeviationType, string> = {
    strategy: '建议调整策略参数或切换备用方案，当前策略模型与实际场景存在偏差',
    execution: '建议确认现场执行情况，资源到位和分流道路可能存在瓶颈',
    environment: '外部环境变化超出预期，建议追加资源应对或等待环境改善',
  };

  return {
    timestamp: Date.now(),
    deviationPercent,
    primaryType,
    factors,
    recommendation: recommendations[primaryType],
  };
}

function pushFeedMessage(
  type: 'system' | 'ai' | 'alert',
  content: string,
  icon: CommandFeedItem['icon'] = 'info'
) {
  const store = useCommandStore.getState();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const msg: CommandFeedItem = {
    id: `monitor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: type === 'alert' ? 'ai' : type,
    source: type === 'ai' || type === 'alert' ? 'AI监控' : '系统',
    time: timeStr,
    content,
    icon,
    urgent: type === 'alert',
  };

  store.setCommandState({
    commandFeed: [msg, ...store.commandState.commandFeed],
  });
}

let lastAlertLevel: DeviationLevel = 'none';

function pollAndUpdate() {
  const store = useCommandStore.getState();
  const { monitorState, congestionIndex } = store.commandState;

  if (!monitorState.isMonitoring) return;

  const minutesAfter = (Date.now() - monitorState.monitorStartTime) / 60000;
  const latestVersion = monitorState.expectationVersions[monitorState.expectationVersions.length - 1];
  if (!latestVersion) return;

  const expected = interpolateExpected(latestVersion.checkpoints, minutesAfter, congestionIndex);
  const actual = congestionIndex + (Math.random() - 0.3) * 0.5;

  const point: CurveDataPoint = {
    timestamp: Date.now(),
    minutesAfter: Number(minutesAfter.toFixed(1)),
    expected: Number(expected.toFixed(1)),
    actual: Number(actual.toFixed(1)),
  };

  store.addCurveDataPoint(point);

  const { percent, level } = calculateDeviation(expected, actual);
  store.setMonitorState({ deviationLevel: level, deviationPercent: percent });

  if (level !== lastAlertLevel) {
    if (level === 'yellow' && lastAlertLevel === 'none') {
      pushFeedMessage('ai', `当前拥堵指数 ${actual.toFixed(1)}，略高于预期 ${expected.toFixed(1)}，偏差 ${percent}%，持续观察中`, 'info');
    } else if (level === 'orange') {
      const analysis = analyzeDeviation();
      const topFactors = analysis.factors.slice(0, 3).map((f) => f.factor).join('、');
      pushFeedMessage('ai', `注意：拥堵指数偏差达 ${percent}%，主要因素：${topFactors}（${analysis.primaryType === 'environment' ? '环境类' : analysis.primaryType === 'execution' ? '执行类' : '策略类'}）`, 'warning');
    } else if (level === 'red') {
      triggerInquiry();
    } else if (level === 'none' && lastAlertLevel !== 'none') {
      pushFeedMessage('ai', '策略生效，拥堵指数回到预期范围，建议继续执行', 'info');
    }
    lastAlertLevel = level;
  }
}

function triggerInquiry() {
  const store = useCommandStore.getState();
  if (store.commandState.monitorState.activeInquiry) return;

  const analysis = analyzeDeviation();
  const { deviationPercent } = store.commandState.monitorState;

  // Map primaryType to inquiry target: execution/environment -> field, strategy -> commander
  const target: 'commander' | 'field' = analysis.primaryType === 'strategy' ? 'commander' : 'field';
  const topFactors = analysis.factors.slice(0, 3).map((f) => `${f.factor}(${f.weight}%)`).join('、');

  const options = target === 'field'
    ? ['S376 发生事故', '路段畅通无异常', '新增大量车辆涌入', '大货车占比较高']
    : ['启动备用方案', '继续观察', '追加资源', '终止当前策略'];

  const question = target === 'field'
    ? `分流效率低于预期（偏差 ${deviationPercent}%），主要因素：${topFactors}，现场是否有异常情况？`
    : `当前策略效果不达预期（偏差 ${deviationPercent}%），${analysis.recommendation}，如何处置？`;

  const inquiry: ActiveInquiry = {
    id: `inq-${Date.now()}`,
    target,
    question,
    options,
    status: 'pending',
    createdAt: Date.now(),
  };

  store.setActiveInquiry(inquiry);

  if (target === 'field') {
    pushFeedMessage('alert', `[现场询问] ${question}`, 'warning');
  }

  inquiryTimer = setTimeout(() => {
    const current = useCommandStore.getState().commandState.monitorState.activeInquiry;
    if (current && current.status === 'pending') {
      if (current.target === 'field') {
        store.setActiveInquiry({ ...current, target: 'commander', status: 'pending' });
        pushFeedMessage('ai', '现场人员未响应，已升级至指挥员', 'warning');
      } else {
        store.setActiveInquiry({ ...current, status: 'timeout', answer: '继续观察' });
        pushFeedMessage('ai', '询问超时，默认继续观察', 'info');
      }
    }
  }, 60000);
}

export function handleInquiryResponse(answer: string) {
  const store = useCommandStore.getState();
  const inquiry = store.commandState.monitorState.activeInquiry;
  if (!inquiry) return;

  if (inquiryTimer) {
    clearTimeout(inquiryTimer);
    inquiryTimer = null;
  }

  store.setActiveInquiry({ ...inquiry, status: 'answered', answer });

  const latestVersion = store.commandState.monitorState.expectationVersions;
  const currentVersion = latestVersion[latestVersion.length - 1];
  if (!currentVersion) return;

  const newVersion: ExpectationVersion = {
    version: currentVersion.version + 1,
    checkpoints: currentVersion.checkpoints.map((cp) => ({
      ...cp,
      expected: Number((cp.expected + 0.3).toFixed(1)),
    })),
    reason: answer,
    timestamp: Date.now(),
  };

  store.addExpectationVersion(newVersion);

  pushFeedMessage('ai', `已收到反馈「${answer}」，预期已更新为 v${newVersion.version}，原因：${answer}`, 'ai');

  setTimeout(() => {
    store.setActiveInquiry(null);
  }, 2000);
}

export function startMonitoring(strategyId: string) {
  const store = useCommandStore.getState();

  const checkpoints = generateExpectedCurve(strategyId);
  const v1: ExpectationVersion = {
    version: 1,
    checkpoints,
    reason: '初始预期',
    timestamp: Date.now(),
  };

  // Create initial execution record
  const execId = `exec-${Date.now()}`;
  store.addExecutionRecord({
    id: execId,
    strategyId: strategyId,
    startTime: Date.now(),
    endTime: null,
    versions: [{
      version: 'v1',
      content: `执行策略 ${strategyId}`,
      reason: '初始方案',
      expectedCurve: checkpoints,
      timestamp: Date.now(),
    }],
    actualCurve: [{ timestamp: Date.now(), congestionIndex: store.commandState.congestionIndex }],
    deviationEvents: [],
    resourceArrival: { estimated: 10, actual: 0 },
    rating: null,
    comment: '',
    aiLearnings: [],
  });
  store.setActiveExecutionId(execId);

  store.setMonitorState({
    isMonitoring: true,
    monitorStartTime: Date.now(),
    monitorStrategyId: strategyId,
    curveData: [],
    deviationLevel: 'none',
    deviationPercent: 0,
    expectationVersions: [v1],
    activeInquiry: null,
    feedback: null,
  });

  lastAlertLevel = 'none';

  pushFeedMessage('ai', `已启动策略执行监控，预期 30min 后拥堵指数降至 ${checkpoints[0].expected}`, 'ai');

  pollTimer = setInterval(pollAndUpdate, 30000);
  setTimeout(pollAndUpdate, 3000);
}

export function stopMonitoring() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (inquiryTimer) {
    clearTimeout(inquiryTimer);
    inquiryTimer = null;
  }

  const store = useCommandStore.getState();
  store.setMonitorState({ isMonitoring: false });

  pushFeedMessage('ai', '策略执行监控已结束', 'info');
}

export function completeExecution() {
  const cmdStore = useCommandStore.getState();
  const evoStore = useEvolutionStore.getState();
  const { monitorState, congestionIndex, activeExecutionId } = cmdStore.commandState;

  if (!monitorState.isMonitoring || !monitorState.monitorStrategyId) return;

  // Stop monitoring timers
  stopMonitoring();

  // If there's an active execution record, finalize it
  if (activeExecutionId) {
    const record = cmdStore.commandState.executionRecords.find(r => r.id === activeExecutionId);
    if (record) {
      cmdStore.updateExecutionRecord(activeExecutionId, {
        endTime: Date.now(),
        actualCurve: [
          ...record.actualCurve,
          { timestamp: Date.now(), congestionIndex },
        ],
      });

      // Check if we should create an evolution record
      if (record.aiLearnings.length > 0) {
        const lastVersion = evoStore.currentVersion;
        const versionNum = parseFloat(lastVersion.replace('v', ''));
        const newVersion = `v${(versionNum + 0.1).toFixed(1)}`;

        record.aiLearnings.forEach((learning) => {
          evoStore.addRecord({
            version: newVersion,
            date: new Date().toISOString().split('T')[0],
            triggerEvent: learning.newFactor,
            triggerExecutionId: record.id,
            changeDescription: `+${learning.newFactor}`,
            affectedStrategies: learning.affectedStrategies,
            accuracyBefore: evoStore.currentAccuracy,
            accuracyAfter: Math.min(
              evoStore.currentAccuracy + (learning.accuracyChange.after - learning.accuracyChange.before),
              99
            ),
          });
        });
      }
    }
  }
}

export { calculateDeviation, interpolateExpected, generateExpectedCurve, analyzeDeviation };