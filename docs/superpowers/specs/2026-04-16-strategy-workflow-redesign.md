# 指挥模式策略工作流重设计

> 日期：2026-04-16
> 状态：设计中

---

## 一、设计目标

将策略执行从"静态卡片列表"升级为"流程可视化 + 决策工作台"，解决当前问题：
1. 策略执行流程不可见（用户不知道执行到哪了）
2. 策略步骤与通信消息割裂（看消息看不到流程，看流程看不到消息）
3. 右侧面板信息密度低（只有 ExecutionTracker）
4. 缺少"下一步做什么"的决策支持

---

## 二、新信息架构

### 2.1 底部通信面板改造

**原结构：**
```
┌─────────────────────────────────┐
│ 通信时间线（17 条 Mock 消息）    │
│ [f01] [f02] [f03] ... [f17]     │
└─────────────────────────────────┘
```

**新结构：**
```
┌─────────────────────────────────────────────────────────┐
│ 策略执行流程条（横向）                                    │
│ [1.策略确认] → [2.指令下发] → [3.现场执行] → [4.效果验证] │
│    ✓ 15:25      ✓ 15:25       ● 15:27        ○ --:--   │
│ 下一步：等待现场反馈（预计 2 分钟）                       │
├─────────────────────────────────────────────────────────┤
│ 通信时间线（消息列表）                                    │
│ [f01] [f02] [f03] ... [f17]                             │
└─────────────────────────────────────────────────────────┘
```

**流程条交互：**
- 点击某个步骤，消息列表自动滚动到该步骤对应的消息并高亮
- 当前步骤显示青色脉冲边框
- 已完成步骤显示绿色 ✓ + 时间戳
- 进行中步骤显示青色 ● + 时间戳
- 未开始步骤显示灰色 ○ + "--:--"

**消息与步骤关联：**
每条消息增加 `step?: number` 字段（1-4），对应 4 个步骤：
- step 1: 策略确认消息（指挥员确认）
- step 2: 指令下发消息（系统生成指令单）
- step 3: 现场执行消息（现场人员反馈）
- step 4: 效果验证消息（系统报告效果）

---

### 2.2 右侧策略面板改造

**原结构：**
```
┌─────────────────────┐
│ 策略卡片 1           │
│ 策略卡片 2           │
│ 策略卡片 3           │
│ ...                 │
│ ExecutionTracker    │
└─────────────────────┘
```

**新结构（策略决策工作台）：**

```
┌─────────────────────────────────┐
│ A. 当前执行策略                  │
│ ┌─────────────────────────────┐ │
│ │ S-02 S376 省道分流           │ │
│ │ 责任人: 张三                 │ │
│ │ 状态: ● 现场执行中           │ │
│ │ 已用时: 3 分钟               │ │
│ │                             │ │
│ │ 效果追踪:                    │ │
│ │ 6.5 ━━●━━━ 4.8             │ │
│ │     当前 5.8 ↓0.7           │ │
│ │                             │ │
│ │ [📞 呼叫现场] [📷 查看视频]   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ B. 备选策略（2-3 个）            │
│ ┌─────────────────────────────┐ │
│ │ 🤖 AI 推荐                   │ │
│ │ S-01 应急车道借用            │ │
│ │ 预计效果: 6.5→4.2 ↓35%      │ │
│ │ 需审批 | 难度 ★★☆            │ │
│ │ [追加执行]                   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ S-04 信号灯配时优化          │ │
│ │ 预计效果: 6.5→5.2 ↓20%      │ │
│ │ 自动执行 | 难度 ★☆☆          │ │
│ │ [替换当前]                   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ C. 自定义策略入口                │
│ [+ 调整分流比例]                 │
│ [+ 增加警力]                     │
│ [+ 调整信号灯时长]               │
│ [+ 发送诱导屏信息]               │
└─────────────────────────────────┘
```

---

## 三、核心组件设计

### 3.1 StrategyFlowBar（策略执行流程条）

**位置：** CommandCommPanel 顶部

**Props：**
```typescript
interface StrategyFlowBarProps {
  steps: Array<{
    id: number;
    label: string;
    status: 'done' | 'active' | 'pending';
    time: string | null;
  }>;
  currentStep: number;
  nextStepHint: string;
  onStepClick: (stepId: number) => void;
}
```

**状态映射：**
- `currentStep` 从 store 的 `commandState.currentStep` 获取（1-6）
- 映射到 4 个步骤：
  - step 1-2 → 流程步骤 1（策略确认）
  - step 3 → 流程步骤 2（指令下发）
  - step 4 → 流程步骤 3（现场执行）
  - step 5-6 → 流程步骤 4（效果验证）

**下一步提示逻辑：**
```typescript
const nextStepHints = {
  1: '下一步：系统生成指令单',
  2: '下一步：等待现场人员响应',
  3: '下一步：等待现场反馈（预计 2 分钟）',
  4: '下一步：等待效果数据验证',
  5: '策略执行完成',
};
```

---

### 3.2 CurrentStrategyCard（当前执行策略卡片）

**位置：** StrategyCommandPanel 右侧顶部

**Props：**
```typescript
interface CurrentStrategyCardProps {
  strategy: CommandStrategy;
  responsible: string;
  elapsedMinutes: number;
  currentIndex: number;
  predictedIndex: number;
  onCallField: () => void;
  onViewVideo: () => void;
}
```

**显示内容：**
- 策略名称 + ID
- 责任人（从 executeStrategy 时记录）
- 状态指示（4 个步骤的当前状态）
- 已用时（从执行开始计时）
- 效果追踪进度条（当前指数 vs 预测指数）
- 快捷操作按钮

---

### 3.3 AlternativeStrategies（备选策略列表）

**位置：** StrategyCommandPanel 右侧中部

**Props：**
```typescript
interface AlternativeStrategiesProps {
  strategies: CommandStrategy[];
  onAddStrategy: (strategyId: string) => void;
  onReplaceStrategy: (strategyId: string) => void;
}
```

**显示逻辑：**
- 最多显示 2-3 个备选策略
- 第一个永远是 AI 推荐（`recommended: true`）
- 其他按 difficulty 升序排列
- 每个卡片显示：
  - 策略名称
  - 预计效果（effect 字段）
  - 权限要求（permission 字段）
  - 难度星级（difficulty 字段）
  - 操作按钮（追加执行 / 替换当前）

---

### 3.4 CustomStrategyEntry（自定义策略入口）

**位置：** StrategyCommandPanel 右侧底部

**Props：**
```typescript
interface CustomStrategyEntryProps {
  templates: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  onSelectTemplate: (templateId: string) => void;
}
```

**模板列表：**
```typescript
const CUSTOM_TEMPLATES = [
  { id: 'adjust-diversion', label: '调整分流比例', icon: '🔀' },
  { id: 'add-police', label: '增加警力', icon: '👮' },
  { id: 'adjust-signal', label: '调整信号灯时长', icon: '🚦' },
  { id: 'send-guidance', label: '发送诱导屏信息', icon: '📢' },
];
```

**交互：**
- 点击模板，弹出 Modal 显示参数配置表单
- 本期只做 UI 入口，不实现完整表单逻辑

---

## 四、Store 扩展

### 4.1 CommandFeedItem 扩展

```typescript
export interface CommandFeedItem {
  id: string;
  type: 'system' | 'ai' | 'command' | 'field' | 'approval' | 'alert';
  source: string;
  time: string;
  content: string;
  urgent?: boolean;
  icon?: 'info' | 'ai' | 'user' | 'photo' | 'phone' | 'check' | 'warning' | 'order';
  step?: number; // 新增：关联的流程步骤（1-4）
}
```

### 4.2 CommandState 扩展

```typescript
export interface CommandState {
  // ... 现有字段 ...
  executingStrategyId: string | null; // 新增：当前执行的策略 ID
  executionStartTime: number | null;  // 新增：执行开始时间戳
  responsible: string | null;         // 新增：责任人
}
```

### 4.3 executeStrategy 修改

在追加消息时，为每条消息设置 `step` 字段：
- 指挥员确认消息：`step: 1`
- 指令单生成消息：`step: 2`
- 现场执行消息：`step: 3`
- 效果确认消息：`step: 4`

同时记录：
```typescript
executingStrategyId: strategyId,
executionStartTime: Date.now(),
responsible: getResponsible(strategyId),
```

---

## 五、实施计划

### Phase 1: 流程条 + 消息关联（1 小时）
1. 创建 StrategyFlowBar 组件
2. 修改 CommandFeedItem 接口，增加 `step` 字段
3. 修改 executeStrategy，为消息设置 step
4. 实现点击步骤滚动到对应消息

### Phase 2: 右侧工作台重构（1.5 小时）
1. 创建 CurrentStrategyCard 组件
2. 创建 AlternativeStrategies 组件
3. 创建 CustomStrategyEntry 组件
4. 重构 StrategyCommandPanel 布局

### Phase 3: 交互联动（30 分钟）
1. 实现"追加策略"逻辑
2. 实现"替换策略"逻辑
3. 实现快捷操作按钮（呼叫现场、查看视频）

---

## 六、不做的事情

- 完全自由文本自定义策略（只做模板化半自定义）
- 多策略并行执行（本期只支持单策略执行）
- 复杂资源编排画布
- 策略效果的历史对比分析（留到分析模式）
