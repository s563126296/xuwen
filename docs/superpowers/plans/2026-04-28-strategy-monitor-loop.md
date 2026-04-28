# 策略执行闭环监控 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让指挥模式 AI 从"推荐策略"升级为"盯执行、发现偏差、主动纠偏"的完整闭环监控系统。

**Architecture:** 在现有 commandStore + commandEngine 基础上新增 strategyMonitorEngine.ts 作为闭环监控核心引擎，通过 30 秒定时轮询驱动偏差检测和分级告警。新增 3 个 UI 组件（DeviationMonitorPanel、InquiryModal、StrategyFeedbackPanel），增强 CommandCommPanel 支持告警/询问/建议消息。

**Tech Stack:** React 18 + TypeScript + Zustand + Recharts

**Spec:** `docs/superpowers/specs/2026-04-28-strategy-monitor-loop-design.md`

---

### Task 1: commandStore 数据结构扩展

**Files:**

- Modify: `src/stores/commandStore.ts`

- [ ] **Step 1: 新增 MonitorState 类型定义**

在 `CommandState` 接口之前（约第 109 行），新增以下类型：

```typescript
export interface ExpectationVersion {
  version: number;
  checkpoints: { minutesAfter: number; expected: number }[];
  reason: string;
  timestamp: number;
}

export interface CurveDataPoint {
  timestamp: number;
  minutesAfter: number;
  expected: number;
  actual: number;
}

export interface ActiveInquiry {
  id: string;
  target: 'commander' | 'field';
  question: string;
  options: string[];
  status: 'pending' | 'answered' | 'timeout';
  answer?: string;
  createdAt: number;
}

export interface StrategyFeedback {
  rating: 'effective' | 'ineffective' | null;
  comment: string;
  timestamp: number;
}

export type DeviationLevel = 'none' | 'yellow' | 'orange' | 'red';

export interface MonitorState {
  isMonitoring: boolean;
  monitorStartTime: number;
  monitorStrategyId: string | null;
  curveData: CurveDataPoint[];
  deviationLevel: DeviationLevel;
  deviationPercent: number;
  expectationVersions: ExpectationVersion[];
  activeInquiry: ActiveInquiry | null;
  feedback: StrategyFeedback | null;
}
```

- [ ] **Step 2: 在 CommandState 中添加 monitorState 字段**

在 `CommandState` 接口末尾（`strategyTimeline` 字段之后）添加：

```typescript
  // v2.0 P1-1: Strategy execution closed-loop monitoring
  monitorState: MonitorState;
```

- [ ] **Step 3: 添加默认值**

在 `defaultCommandState` 对象末尾添加：

```typescript
  monitorState: {
    isMonitoring: false,
    monitorStartTime: 0,
    monitorStrategyId: null,
    curveData: [],
    deviationLevel: 'none',
    deviationPercent: 0,
    expectationVersions: [],
    activeInquiry: null,
    feedback: null,
  },
```

- [ ] **Step 4: 新增 store actions**

在 `useCommandStore` 的 create 函数中，`setCommandScene` 之后添加：

```typescript
  setMonitorState: (data: Partial<MonitorState>) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, ...data },
    },
  })),

  addCurveDataPoint: (point: CurveDataPoint) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: {
        ...state.commandState.monitorState,
        curveData: [...state.commandState.monitorState.curveData, point],
      },
    },
  })),

  addExpectationVersion: (version: ExpectationVersion) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: {
        ...state.commandState.monitorState,
        expectationVersions: [...state.commandState.monitorState.expectationVersions, version],
      },
    },
  })),

  setActiveInquiry: (inquiry: ActiveInquiry | null) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, activeInquiry: inquiry },
    },
  })),

  setStrategyFeedback: (feedback: StrategyFeedback | null) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, feedback },
    },
  })),
```

- [ ] **Step 5: 更新 CommandStoreState 接口**

在 store 的接口类型中添加新 actions 的签名：

```typescript
  setMonitorState: (data: Partial<MonitorState>) => void;
  addCurveDataPoint: (point: CurveDataPoint) => void;
  addExpectationVersion: (version: ExpectationVersion) => void;
  setActiveInquiry: (inquiry: ActiveInquiry | null) => void;
  setStrategyFeedback: (feedback: StrategyFeedback | null) => void;
```

- [ ] **Step 6: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 7: 提交**

```bash
git add src/stores/commandStore.ts
git commit -m "feat(command): add MonitorState to commandStore for closed-loop monitoring"
```

---

### Task 2: 闭环监控引擎 strategyMonitorEngine.ts

**Files:**

- Create: `src/utils/strategyMonitorEngine.ts`

- [ ] **Step 1: 创建引擎文件，实现核心函数**

```typescript
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

function generateExpectedCurve(strategyId: string): { minutesAfter: number; expected: number }[] {
  const store = useCommandStore.getState();
  const strategy = store.commandState.strategies.find((s) => s.id === strategyId);
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
  const { congestionIndex, congestionTrend, causes } = store.commandState;

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
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/utils/strategyMonitorEngine.ts
git commit -m "feat(command): add strategyMonitorEngine for closed-loop monitoring"
```

---

### Task 3: DeviationMonitorPanel 组件

**Files:**

- Create: `src/components/command/DeviationMonitorPanel.tsx`

- [ ] **Step 1: 创建偏差监控面板组件**

```tsx
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

const levelColors: Record<string, string> = {
  none: '#2ED573',
  yellow: '#F5A623',
  orange: '#F97316',
  red: '#FF4757',
};

export default function DeviationMonitorPanel() {
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const [showVersions, setShowVersions] = useState(false);

  if (!monitorState.isMonitoring && monitorState.curveData.length === 0) return null;

  const { curveData, deviationLevel, deviationPercent, expectationVersions } = monitorState;
  const borderColor = deviationLevel === 'red' ? '#FF4757' : deviationLevel === 'orange' ? '#F97316' : 'rgba(0, 208, 233, 0.2)';
  const latestVersion = expectationVersions[expectationVersions.length - 1];
  const elapsedMin = monitorState.isMonitoring
    ? Math.round((Date.now() - monitorState.monitorStartTime) / 60000)
    : '--';

  return (
    <div style={{
      background: '#0D1137',
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      padding: 16,
      width: '100%',
      animation: deviationLevel === 'red' ? 'pulse 1.5s infinite' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="#00D0E9" />
          <span style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}>执行偏差监控</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>已执行 {elapsedMin} min</span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: levelColors[deviationLevel],
          }}>
            偏差 {deviationPercent}%
          </span>
        </div>
      </div>

      {/* Chart */}
      {curveData.length > 1 && (
        <div style={{ height: 140, marginBottom: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="minutesAfter"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(v) => `${Math.round(v)}m`}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(13,17,55,0.95)',
                  border: '1px solid rgba(0,208,233,0.3)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [
                  value.toFixed(1),
                  name === 'expected' ? '预期' : '实际',
                ]}
              />
              <ReferenceLine y={0} stroke="rgba(148,163,184,0.1)" />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#00D0E9"
                strokeDasharray="5 3"
                fill="none"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#FFFFFF"
                fill="rgba(255,71,87,0.1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No data placeholder */}
      {curveData.length <= 1 && (
        <div style={{
          height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#64748B', fontSize: 12, marginBottom: 12,
        }}>
          等待数据采集中...
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          AI 置信度：<span style={{ color: '#00D0E9' }}>
            {latestVersion ? `${85 - (expectationVersions.length - 1) * 3}%` : '85%'}
          </span>
        </span>
        <button
          onClick={() => setShowVersions(!showVersions)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: '#94A3B8',
          }}
        >
          v{latestVersion?.version ?? 1} 预期
          {showVersions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Version history */}
      {showVersions && expectationVersions.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: '#94A3B8' }}>
          {expectationVersions.map((v) => (
            <div key={v.version} style={{
              padding: '4px 0',
              borderBottom: '1px solid rgba(148,163,184,0.05)',
            }}>
              <span style={{ color: '#00D0E9' }}>v{v.version}</span>
              {' '}{v.reason}
              {' · '}检查点：{v.checkpoints.map((cp) => `${cp.minutesAfter}min→${cp.expected}`).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/command/DeviationMonitorPanel.tsx
git commit -m "feat(command): add DeviationMonitorPanel with real-time curve chart"
```

---

### Task 4: InquiryModal 组件

**Files:**

- Create: `src/components/command/InquiryModal.tsx`

- [ ] **Step 1: 创建询问弹窗组件**

```tsx
import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import { handleInquiryResponse } from '../../utils/strategyMonitorEngine';

export default function InquiryModal() {
  const inquiry = useCommandStore((s) => s.commandState.monitorState.activeInquiry);
  const deviationPercent = useCommandStore((s) => s.commandState.monitorState.deviationPercent);
  const congestionIndex = useCommandStore((s) => s.commandState.congestionIndex);
  const [customInput, setCustomInput] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!inquiry || inquiry.status !== 'pending' || inquiry.target !== 'commander') return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inquiry?.id]);

  if (!inquiry || inquiry.status !== 'pending' || inquiry.target !== 'commander') return null;

  const handleSelect = (answer: string) => {
    handleInquiryResponse(answer);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      handleInquiryResponse(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
    }}>
      <div style={{
        width: 420, background: '#0D1137',
        border: '1px solid rgba(255, 71, 87, 0.5)',
        borderRadius: 12, padding: 24,
        boxShadow: '0 8px 32px rgba(255, 71, 87, 0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={20} color="#FF4757" />
          <span style={{ color: '#FF4757', fontSize: 15, fontWeight: 600 }}>
            AI 检测到策略执行偏差
          </span>
        </div>

        {/* Deviation summary */}
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.2)',
          borderRadius: 8, padding: 12, marginBottom: 16,
          fontSize: 12, color: '#E0E8FF', lineHeight: 1.8,
        }}>
          当前拥堵指数 <span style={{ color: '#FF4757', fontWeight: 600 }}>{congestionIndex.toFixed(1)}</span>
          ，偏差 <span style={{ color: '#FF4757', fontWeight: 600 }}>{deviationPercent}%</span>
          <br />
          {inquiry.question}
        </div>

        {/* Quick options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {inquiry.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                padding: '10px 14px', background: 'rgba(0, 208, 233, 0.05)',
                border: '1px solid rgba(0, 208, 233, 0.2)',
                borderRadius: 6, color: '#E0E8FF', fontSize: 12,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 208, 233, 0.15)';
                e.currentTarget.style.borderColor = '#00D0E9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 208, 233, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 208, 233, 0.2)';
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="其他原因..."
            style={{
              flex: 1, padding: '8px 12px', background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6,
              color: '#E0E8FF', fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={handleCustomSubmit}
            style={{
              padding: '8px 14px', background: '#00D0E9', border: 'none',
              borderRadius: 6, color: '#0A0F19', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={14} />
          </button>
        </div>

        {/* Countdown */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, color: '#94A3B8', fontSize: 11,
        }}>
          <Clock size={12} />
          <span>{countdown}s 后自动选择「继续观察」</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/command/InquiryModal.tsx
git commit -m "feat(command): add InquiryModal for deviation inquiry with countdown"
```

---

### Task 5: StrategyFeedbackPanel 组件

**Files:**

- Create: `src/components/command/StrategyFeedbackPanel.tsx`

- [ ] **Step 1: 创建用户反馈面板组件**

```tsx
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

export default function StrategyFeedbackPanel() {
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const setStrategyFeedback = useCommandStore((s) => s.setStrategyFeedback);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (monitorState.isMonitoring) return null;
  if (monitorState.feedback) return null;
  if (monitorState.curveData.length === 0) return null;

  const elapsedMin = Math.round(
    (monitorState.curveData[monitorState.curveData.length - 1]?.timestamp - monitorState.monitorStartTime) / 60000
  );
  const finalIndex = monitorState.curveData[monitorState.curveData.length - 1]?.actual ?? 0;
  const deviationCount = monitorState.curveData.filter((p) => {
    const diff = Math.abs((p.actual - p.expected) / p.expected) * 100;
    return diff > 10;
  }).length;

  const handleRate = (rating: 'effective' | 'ineffective') => {
    setStrategyFeedback({
      rating,
      comment: comment || '',
      timestamp: Date.now(),
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: 380, background: '#0D1137',
        border: '1px solid rgba(0, 208, 233, 0.3)',
        borderRadius: 12, padding: 24,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>策略执行评价</span>
          <button
            onClick={() => setDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} color="#94A3B8" />
          </button>
        </div>

        {/* Summary */}
        <div style={{
          background: 'rgba(0, 208, 233, 0.05)',
          border: '1px solid rgba(0, 208, 233, 0.15)',
          borderRadius: 8, padding: 12, marginBottom: 16,
          fontSize: 12, color: '#C9CDD4', lineHeight: 1.8,
        }}>
          执行时长：{elapsedMin} 分钟<br />
          最终拥堵指数：{finalIndex.toFixed(1)}<br />
          偏差告警次数：{deviationCount} 次
        </div>

        {/* Rating buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => handleRate('effective')}
            style={{
              flex: 1, padding: '12px 0', background: 'rgba(46, 213, 115, 0.1)',
              border: '1px solid rgba(46, 213, 115, 0.3)', borderRadius: 8,
              color: '#2ED573', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ThumbsUp size={16} /> 建议有效
          </button>
          <button
            onClick={() => handleRate('ineffective')}
            style={{
              flex: 1, padding: '12px 0', background: 'rgba(255, 71, 87, 0.1)',
              border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: 8,
              color: '#FF4757', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ThumbsDown size={16} /> 建议无效
          </button>
        </div>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComment(!showComment)}
          style={{
            width: '100%', padding: '8px 0', background: 'none',
            border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6,
            color: '#94A3B8', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <MessageCircle size={14} /> 补充说明
        </button>

        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请输入补充说明..."
            style={{
              width: '100%', marginTop: 8, padding: 10,
              background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 6, color: '#E0E8FF', fontSize: 12,
              resize: 'vertical', minHeight: 60, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}

        {/* Skip */}
        <button
          onClick={() => setDismissed(true)}
          style={{
            width: '100%', marginTop: 12, padding: '8px 0',
            background: 'none', border: 'none',
            color: '#64748B', fontSize: 11, cursor: 'pointer',
          }}
        >
          跳过
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/command/StrategyFeedbackPanel.tsx
git commit -m "feat(command): add StrategyFeedbackPanel for post-execution rating"
```

---

### Task 6: 集成到 StrategyCommandPanel + CommandMode

**Files:**

- Modify: `src/components/command/StrategyCommandPanel.tsx`
- Modify: `src/components/command/CommandMode.tsx`

- [ ] **Step 1: 在 StrategyCommandPanel 中集成 DeviationMonitorPanel**

在 `StrategyCommandPanel.tsx` 的 import 区域添加：

```typescript
import DeviationMonitorPanel from './DeviationMonitorPanel';
```

在 `{/* E4. Execution Resources */}` 注释之前插入：

```tsx
      {/* P1-1: Deviation Monitor */}
      <DeviationMonitorPanel />
```

- [ ] **Step 2: 在 CommandMode 中集成 InquiryModal 和 StrategyFeedbackPanel**

在 `CommandMode.tsx` 的 import 区域添加：

```typescript
import InquiryModal from './InquiryModal';
import StrategyFeedbackPanel from './StrategyFeedbackPanel';
```

在 CommandMode 组件的 return JSX 末尾（关闭 `</div>` 之前）添加：

```tsx
      <InquiryModal />
      <StrategyFeedbackPanel />
```

- [ ] **Step 3: 在 executeStrategy 中触发监控启动**

在 `commandStore.ts` 的 `executeStrategy` 函数中，Phase 0 的 `set()` 调用之后，添加：

```typescript
    // Start closed-loop monitoring
    setTimeout(() => {
      import('../utils/strategyMonitorEngine').then(({ startMonitoring }) => {
        startMonitoring(strategyId);
      });
    }, 1000);
```

- [ ] **Step 4: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 5: 提交**

```bash
git add src/components/command/StrategyCommandPanel.tsx src/components/command/CommandMode.tsx src/stores/commandStore.ts
git commit -m "feat(command): integrate closed-loop monitoring into command mode UI"
```

---

### Task 7: CommandCommPanel 增强

**Files:**

- Modify: `src/components/command/CommandCommPanel.tsx`

- [ ] **Step 1: 增强消息渲染，支持新消息类型**

在 `CommandCommPanel.tsx` 中找到消息渲染逻辑，在现有的 `type` 样式映射中添加对 `monitor-alert`、`monitor-inquiry`、`monitor-suggestion` 的支持。

由于监控引擎通过 `pushFeedMessage` 使用现有的 `ai` 和 `system` 类型推送消息，且 `urgent` 标记用于高亮，主要需要增强的是：对 `urgent: true` 的 AI 消息添加红色左边框和脉冲动画。

找到消息项渲染的 style 部分，在现有的 `urgent` 判断逻辑中确保有红色高亮样式：

```typescript
// 在消息项的 style 中，确保 urgent 消息有明显的视觉区分
borderLeft: item.urgent ? '3px solid #FF4757' : 'none',
animation: item.urgent ? 'pulse 2s infinite' : 'none',
```

如果现有代码已有 urgent 样式处理，则此步骤可跳过。

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/command/CommandCommPanel.tsx
git commit -m "feat(command): enhance CommandCommPanel with monitor alert styling"
```

---

### Task 8: 端到端验证

- [ ] **Step 1: 启动开发服务器**

用户手动运行：`npm run dev`

- [ ] **Step 2: 验证完整流程**

1. 进入总览模式，等待拥堵指数 > 4.0 的提示
2. 切换到指挥模式
3. 点击策略卡片 → 确认执行
4. 观察：
   - DeviationMonitorPanel 出现在右侧策略栏
   - 通信面板出现"已启动策略执行监控"消息
   - 3 秒后第一个数据点出现在曲线图上
   - 30 秒后第二个数据点出现
5. 如果偏差 > 15%，观察 InquiryModal 弹出
6. 选择一个回答，观察预期版本更新
7. 策略达标后，观察 StrategyFeedbackPanel 弹出

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat(command): complete P1-1 strategy execution closed-loop monitoring"
```


