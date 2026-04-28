import { useCommandStore } from '../stores/commandStore';
import type {
  CurveDataPoint,
  ExpectationVersion,
  DeviationLevel,
  ActiveInquiry,
  CommandFeedItem,
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

function analyzeDeviation(): { reason: string; target: 'commander' | 'field' } {
  const store = useCommandStore.getState();
  const { congestionTrend, causes } = store.commandState;

  const topCause = causes[0];
  if (topCause?.type === 'accident') {
    return { reason: '疑似发生交通事故，分流效率降低', target: 'field' };
  }
  if (topCause?.type === 'weather') {
    return { reason: '天气因素影响，能见度/路面条件变差', target: 'field' };
  }
  if (congestionTrend === 'rising') {
    return { reason: '车流量持续上升，超出策略处理能力', target: 'field' };
  }
  return { reason: '策略效果不达预期，建议调整方案', target: 'commander' };
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
      const { reason } = analyzeDeviation();
      pushFeedMessage('ai', `注意：拥堵指数偏差达 ${percent}%，可能原因：${reason}`, 'warning');
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

  const { reason, target } = analyzeDeviation();
  const { deviationPercent } = store.commandState.monitorState;

  const options = target === 'field'
    ? ['S376 发生事故', '路段畅通无异常', '新增大量车辆涌入', '大货车占比较高']
    : ['启动备用方案', '继续观察', '追加资源', '终止当前策略'];

  const question = target === 'field'
    ? `分流效率低于预期（偏差 ${deviationPercent}%），现场是否有异常情况？`
    : `当前策略效果不达预期（偏差 ${deviationPercent}%），${reason}，如何处置？`;

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

export { calculateDeviation, interpolateExpected, generateExpectedCurve, analyzeDeviation };