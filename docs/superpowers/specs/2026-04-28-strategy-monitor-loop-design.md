# 策略执行闭环监控系统设计

> v2.0 P1-1 | 2026-04-28

## 1. 目标

让指挥模式的 AI 从"推荐策略"升级为"盯执行、发现偏差、主动纠偏"。完整闭环：

```
策略推荐 → 预期效果 → 执行监控 → 偏差检测 → 主动询问 → 决策建议 → 更新预期 → 用户反馈
```

## 2. 设计决策

| 决策项 | 选择 | 理由 |
| ------ | ---- | ---- |
| 数据更新机制 | 定时轮询（30 秒） | 实现简单，适合当前 mock 阶段 |
| 偏差告警 | 分级告警（黄/橙/红） | 细粒度监控，避免过度告警 |
| 主动询问 | 智能路由 | 数据问题→现场人员，决策问题→指挥员，超时自动升级 |

## 3. 数据结构

### 3.1 MonitorState（新增到 commandStore）

```typescript
interface ExpectationVersion {
  version: number;
  checkpoints: { minutesAfter: number; expected: number }[];
  reason: string;
  timestamp: number;
}

interface CurveDataPoint {
  timestamp: number;
  minutesAfter: number;
  expected: number;
  actual: number;
}

interface ActiveInquiry {
  id: string;
  target: 'commander' | 'field';
  question: string;
  options: string[];
  status: 'pending' | 'answered' | 'timeout';
  answer?: string;
  createdAt: number;
}

interface StrategyFeedback {
  rating: 'effective' | 'ineffective' | null;
  comment: string;
  timestamp: number;
}

interface MonitorState {
  isMonitoring: boolean;
  monitorStartTime: number;
  curveData: CurveDataPoint[];
  deviationLevel: 'none' | 'yellow' | 'orange' | 'red';
  deviationPercent: number;
  expectationVersions: ExpectationVersion[];
  activeInquiry: ActiveInquiry | null;
  feedback: StrategyFeedback | null;
}
```

### 3.2 默认值

```typescript
const defaultMonitorState: MonitorState = {
  isMonitoring: false,
  monitorStartTime: 0,
  curveData: [],
  deviationLevel: 'none',
  deviationPercent: 0,
  expectationVersions: [],
  activeInquiry: null,
  feedback: null,
};
```

## 4. 核心引擎：strategyMonitorEngine.ts

### 4.1 职责

- `startMonitoring(strategyId)` — 启动监控，初始化预期曲线 v1，开始 30 秒轮询
- `stopMonitoring()` — 停止轮询，触发反馈面板
- `pollAndUpdate()` — 每 30 秒执行：读取拥堵指数 → 写入 curveData → 计算偏差 → 判断告警级别
- `analyzeDeviation()` — 偏差原因分析（基于当前数据：天气、车型、路况、事故）
- `routeInquiry(deviationInfo)` — 智能路由：数据问题→通信面板推送现场人员，决策问题→大屏弹窗
- `handleInquiryResponse(answer)` — 处理回答 → 生成决策建议 → 更新预期曲线
- `generateExpectedCurve(strategyId, factors)` — 根据策略和环境因子生成预期拥堵指数曲线

### 4.2 偏差计算

```ts
function calculateDeviation(expected: number, actual: number): {
  percent: number;
  level: 'none' | 'yellow' | 'orange' | 'red';
} {
  const percent = Math.abs((actual - expected) / expected) * 100;
  if (percent > 15) return { percent, level: 'red' };
  if (percent > 10) return { percent, level: 'orange' };
  if (percent > 5) return { percent, level: 'yellow' };
  return { percent, level: 'none' };
}
```

### 4.3 智能路由规则

| 偏差原因 | 路由目标 | 问题示例 |
| -------- | -------- | -------- |
| 数据异常（车流突增、路况变化） | 现场人员 | "S376 分流效率低于预期，现场是否有异常？" |
| 外部因素（事故、天气突变） | 现场人员 | "进港大道是否发生事故？" |
| 策略效果不佳 | 指挥员 | "当前策略效果不达预期，是否启动备用方案？" |
| 多策略冲突 | 指挥员 | "S-02 和 S-04 效果相互抵消，建议保留哪个？" |

快捷回答选项（现场人员）：

- S376 发生事故
- 路段畅通无异常
- 新增大量车辆涌入
- 大货车占比较高
- 其他（自由输入）

快捷回答选项（指挥员）：

- 启动备用方案
- 继续观察
- 追加资源
- 终止当前策略
- 其他（自由输入）

### 4.4 预期曲线版本管理

策略执行过程中，每次收到反馈并调整预期时，生成新版本：

```text
v1 原始预期：1h → 5.2, 2h → 4.3
v2 调整：1h → 5.8, 2h → 4.8（原因：S376 事故，分流效率降低）
v3 调整：1h → 5.5, 2h → 4.5（原因：启动 S207 备用分流）
```

曲线图上同时展示所有版本（v1 虚线灰色，最新版本虚线青色，实际值实线白色）。

## 5. UI 组件

### 5.1 DeviationMonitorPanel（增强 StrategyTimelinePanel）

位置：指挥模式右侧策略栏

内容：

- 顶部：策略名称 + 执行时长 + 当前偏差百分比（颜色随告警级别变化）
- 中部：Recharts AreaChart 预期 vs 实际曲线
  - 预期曲线：虚线，青色
  - 实际曲线：实线，白色
  - 偏差区域：红色半透明填充（actual > expected 时）
  - 检查点标记：30/60/90/120 分钟竖线
- 底部：AI 置信度 + 版本记录（可展开查看历史版本）

告警样式：

- 黄色（5-10%）：偏差数字变黄
- 橙色（10-15%）：偏差数字变橙 + 面板边框橙色
- 红色（>15%）：偏差数字变红 + 面板边框红色脉冲 + 触发询问

### 5.2 InquiryModal（新增）

位置：全局弹窗（居中）

触发：偏差 > 15% 且路由目标为指挥员

内容：

- 标题："AI 检测到策略执行偏差"
- 偏差摘要：当前值 vs 预期值 + 偏差百分比
- AI 分析的可能原因（1-2 条）
- 快捷回答按钮（4-5 个选项）
- 自由输入框
- 60 秒倒计时（超时自动选择"继续观察"）

### 5.3 StrategyFeedbackPanel（新增）

位置：策略完成/达标退出时弹出

内容：

- 策略执行摘要（执行时长、最终拥堵指数、偏差次数）
- 三个评价按钮：有效 / 无效 / 补充说明
- 补充说明输入框（点击"补充说明"时展开）
- 跳过按钮

### 5.4 通信面板增强（修改 CommandCommPanel）

新增消息类型：

- `monitor-alert`：偏差告警消息（黄/橙/红色标识）
- `monitor-inquiry`：现场询问消息（带快捷回答按钮）
- `monitor-suggestion`：AI 决策建议消息

## 6. 监控流程详细

```text
1. 指挥员确认执行策略
   → startMonitoring(strategyId)
   → 生成预期曲线 v1（基于策略参数 + 当前环境因子）
   → 启动 30 秒轮询定时器

2. 每 30 秒轮询
   → 读取 commandStore.congestionIndex
   → 计算当前时间对应的预期值（线性插值）
   → 写入 curveData
   → calculateDeviation()

3. 偏差 5-10%（黄色）
   → 通信面板推送："当前拥堵指数 X.X，略高于预期 X.X，偏差 X%，持续观察中"
   → DeviationMonitorPanel 偏差数字变黄

4. 偏差 10-15%（橙色）
   → 通信面板推送："注意：拥堵指数偏差达 X%，可能原因：XXX"
   → DeviationMonitorPanel 面板边框变橙

5. 偏差 > 15%（红色）
   → analyzeDeviation() 分析原因
   → routeInquiry() 智能路由
   → 若路由到现场人员：通信面板推送询问 + 快捷回答按钮
   → 若路由到指挥员：弹出 InquiryModal
   → 60 秒超时：现场人员超时 → 升级到指挥员弹窗

6. 收到回答
   → handleInquiryResponse()
   → 生成决策建议（通信面板推送）
   → 更新预期曲线（新版本）
   → 通信面板推送："预期已更新为 vX，原因：XXX"

7. 策略达标（拥堵指数 ≤ 目标值）
   → stopMonitoring()
   → 弹出 StrategyFeedbackPanel
   → 记录反馈到 commandStore

8. 覆盖场景
   → 效果达预期：通信面板推送"策略生效，建议继续执行"
   → 效果超预期：通信面板推送"效果优于预期，建议提前结束"
   → 效果不达预期：走偏差检测 → 询问 → 建议流程
   → 外部因素干扰：AI 分析区分"策略没效果"和"外部因素干扰"
```

## 7. 文件清单

| 文件 | 操作 | 说明 |
| ---- | ---- | ---- |
| `src/utils/strategyMonitorEngine.ts` | 新增 | 闭环监控引擎 |
| `src/stores/commandStore.ts` | 修改 | 新增 MonitorState + actions |
| `src/components/command/DeviationMonitorPanel.tsx` | 新增 | 替代 StrategyTimelinePanel |
| `src/components/command/InquiryModal.tsx` | 新增 | 指挥员询问弹窗 |
| `src/components/command/StrategyFeedbackPanel.tsx` | 新增 | 用户反馈面板 |
| `src/components/command/CommandCommPanel.tsx` | 修改 | 新增告警/询问/建议消息类型 |
| `src/components/command/StrategyCommandPanel.tsx` | 修改 | 集成 DeviationMonitorPanel |

## 8. 不做的事情

- 真实数据对接（继续用 mock 模拟器）
- AI 自我进化（P1-4 范围）
- 多策略贡献度拆分（后续迭代）
- 语音播报偏差告警（P2 级）
