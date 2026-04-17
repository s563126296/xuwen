# 指挥模式 V4.0 第一批（核心框架）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前“分析型指挥页”重构为“地图主屏 + 右侧策略栏 + 底部指挥通信面板”的真实指挥中枢框架。

**Architecture:** 保留现有高德地图与策略引擎、Execution 状态机、Store 数据结构，在其上重构布局与交互焦点。顶部只保留一条更强的指挥摘要；中部以地图为主，右侧集中展示 AI 方案与资源状态；底部用“策略执行进度 + 现场反馈消息流”替代拥堵趋势时间轴。

**Tech Stack:** React 18, TypeScript, Zustand, Recharts, Lucide React, AMap JS API

---

## 文件结构

### 新建
- `src/components/command/CommandCommPanel.tsx` — 底部指挥通信面板（策略进度 + 消息流）
- `src/components/command/StrategyCommandPanel.tsx` — 右侧策略指挥栏（策略、资源状态、历史参考）
- `src/components/command/MapVideoDock.tsx` — 地图右下角视频停靠面板（摄像头/无人机入口，先做 Mock）

### 修改
- `src/components/command/CommandMode.tsx` — 重排布局为地图主屏 + 右栏 + 底栏
- `src/components/command/CommandSummaryBar.tsx` — 增加强主因、拥堵车辆、危化品/冷链关注、推荐策略摘要
- `src/components/command/CommandMap.tsx` — 暴露地图区域标题/聚焦信息、加入点击路段后的聚焦态占位
- `src/store/dashboardStore.ts` — 新增现场消息流、资源状态、指令单状态、当前聚焦路段信息
- `src/utils/commandEngine.ts` — 补充 recommended summary 文案生成所需工具（如需要）

### 归档/停用（不立刻物理删除，先停止引用）
- `src/components/command/DecisionChainSteps.tsx`
- `src/components/command/StepSituation.tsx`
- `src/components/command/StepAttribution.tsx`
- `src/components/command/StepImpact.tsx`
- `src/components/command/StepStrategy.tsx`
- `src/components/command/StepPrediction.tsx`
- `src/components/command/StepTracking.tsx`
- `src/components/command/StrategyExecutionBoard.tsx`
- `src/components/command/CommandTimeline.tsx`

---

### Task 1: 扩展 Store 为“指挥中枢”数据结构

**Files:**
- Modify: `src/store/dashboardStore.ts`

- [ ] **Step 1: 定义新增类型**

在 `CommandState` 相关类型附近补充：

```ts
export interface CommandFeedItem {
  id: string;
  type: 'text' | 'image' | 'call';
  source: string;
  time: string;
  content: string;
  urgent?: boolean;
}

export interface CommandResourceStatus {
  policeOnDuty: number;
  policeAvailable: number;
  dronesAvailable: number;
  towTrucksAvailable: number;
}

export interface CommandFocusRoad {
  road: string;
  queueLength: string;
  vehicles: number;
  dangerousGoods: number;
  coldChain: number;
  durationMinutes: number;
  futureInflow: number;
}
```

- [ ] **Step 2: 扩展 `CommandState` 接口**

在 `CommandState` 中追加：

```ts
  focusRoad: CommandFocusRoad;
  commandFeed: CommandFeedItem[];
  resources: CommandResourceStatus;
```

- [ ] **Step 3: 扩展 `defaultCommandState`**

写入最小可演示 Mock：

```ts
focusRoad: {
  road: '进港大道',
  queueLength: '3.2 公里',
  vehicles: 1200,
  dangerousGoods: 3,
  coldChain: 47,
  durationMinutes: 42,
  futureInflow: 300,
},
commandFeed: [
  { id: 'f1', type: 'text', source: '张三', time: '15:27', content: '已到达路口A，开始引导分流' },
  { id: 'f2', type: 'image', source: '张三', time: '15:32', content: '现场照片已上传' },
  { id: 'f3', type: 'call', source: '张三', time: '15:35', content: '请求视频通话', urgent: true },
],
resources: {
  policeOnDuty: 6,
  policeAvailable: 3,
  dronesAvailable: 1,
  towTrucksAvailable: 2,
},
```

- [ ] **Step 4: 运行类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

---

### Task 2: 重写顶部指挥摘要条

**Files:**
- Modify: `src/components/command/CommandSummaryBar.tsx`

- [ ] **Step 1: 将左侧文案改为“堵况 + 主因”**

把当前左侧文案替换为：

```tsx
<span style={{ fontSize: 14, fontWeight: 700, color: levelInfo.color }}>
  {cmd.focusRoad.road}{levelInfo.label} {cmd.congestionIndex.toFixed(1)}
</span>
<span style={{ fontSize: 12, color: '#94A3B8' }}>
  · {cmd.focusRoad.vehicles}辆 · 排队{cmd.focusRoad.queueLength} · 持续{cmd.focusRoad.durationMinutes}min
</span>
```

- [ ] **Step 2: 中间文案改为“主因 + 推荐策略”**

```tsx
const mainCause = cmd.causes[0]?.label ?? '待分析';
const strategyText = activeStrategies.map((s) => s.name).join(' + ') || '待推荐';
```

替换中间区域为：

```tsx
<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
  <span style={{ fontSize: 12, color: '#F59E0B' }}>主因：{mainCause}</span>
  <span style={{ fontSize: 12, color: '#64748B' }}>|</span>
  <span style={{ fontSize: 12, color: '#00D0E9' }}>建议：{strategyText}</span>
</div>
```

- [ ] **Step 3: 右侧增加危化品/冷链提示**

在预计缓解时间前增加：

```tsx
<span style={{ fontSize: 12, color: '#94A3B8' }}>
  危化品{cmd.focusRoad.dangerousGoods}辆 · 冷链{cmd.focusRoad.coldChain}辆
</span>
```

- [ ] **Step 4: 运行类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

---

### Task 3: 右侧策略栏改为“策略指挥栏”

**Files:**
- Create: `src/components/command/StrategyCommandPanel.tsx`
- Modify: `src/components/command/CommandMode.tsx`

- [ ] **Step 1: 创建新组件骨架**

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

export default function StrategyCommandPanel() {
  const cmd = useDashboardStore((s) => s.commandState);
  const executeStrategy = useDashboardStore((s) => s.executeStrategy);

  return <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }} />;
}
```

- [ ] **Step 2: 添加 AI 策略建议区**

复用当前 `StrategyExecutionBoard` 中策略卡片区，只保留：
- 策略卡片
- 执行按钮
- 推荐标记

不要放“执行状态跟踪”和“历史策略效果”在这个区域。

- [ ] **Step 3: 添加资源状态区**

```tsx
<div className="card" style={{ padding: 14 }}>
  <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>可调度资源</div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 11, color: '#64748B' }}>在岗交警</span><span style={{ fontSize: 12, color: '#E2E8F0' }}>{cmd.resources.policeOnDuty} / 可调{cmd.resources.policeAvailable}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 11, color: '#64748B' }}>无人机</span><span style={{ fontSize: 12, color: '#E2E8F0' }}>{cmd.resources.dronesAvailable} 架</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 11, color: '#64748B' }}>拖车</span><span style={{ fontSize: 12, color: '#E2E8F0' }}>{cmd.resources.towTrucksAvailable} 辆</span></div>
  </div>
</div>
```

- [ ] **Step 4: 添加历史参考区**

使用现有 `historyEffects` 数据，改标题为“历史参考”，顶部加一句：

```tsx
<div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>上次类似拥堵：上周五 45 分钟缓解</div>
```

- [ ] **Step 5: 在 `CommandMode.tsx` 中替换右侧组件**

把：

```tsx
<StrategyExecutionBoard />
```

改为：

```tsx
<StrategyCommandPanel />
```

- [ ] **Step 6: 运行类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

---

### Task 4: 底部替换为“指挥通信面板”

**Files:**
- Create: `src/components/command/CommandCommPanel.tsx`
- Modify: `src/components/command/CommandMode.tsx`

- [ ] **Step 1: 创建底部面板组件**

```tsx
import { Phone, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function CommandCommPanel() {
  const cmd = useDashboardStore((s) => s.commandState);
  const activeStrategies = cmd.strategies.filter((s) => s.status === 'executing' || s.status === 'done');

  return <div className="card" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, height: 118, padding: 12 }} />;
}
```

- [ ] **Step 2: 左侧加入策略执行进度**

每个执行中的策略一行：

```tsx
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: '#E2E8F0', marginBottom: 4 }}>{strategy.id} {strategy.name}</div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    {cmd.executionSteps.map((step, i) => (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.status === 'done' ? '#10B981' : step.status === 'active' ? '#00D0E9' : 'transparent', border: step.status === 'pending' ? '1px solid #475569' : 'none' }} />
          <span style={{ fontSize: 11, color: step.status === 'active' ? '#00D0E9' : step.status === 'done' ? '#10B981' : '#64748B' }}>{step.label}</span>
        </div>
        {i < cmd.executionSteps.length - 1 && <div style={{ width: 18, height: 1, background: '#334155' }} />}
      </>
    ))}
  </div>
</div>
```

- [ ] **Step 3: 右侧加入消息流**

```tsx
<div style={{ width: 360, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 12 }}>
  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>现场反馈</div>
  {cmd.commandFeed.map((item) => (
    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {item.type === 'text' && <MessageSquare size={12} color="#00D0E9" />}
      {item.type === 'image' && <ImageIcon size={12} color="#F59E0B" />}
      {item.type === 'call' && <Phone size={12} color="#DC2626" />}
      <span style={{ fontSize: 11, color: '#64748B' }}>{item.time}</span>
      <span style={{ fontSize: 11, color: '#C9CDD4' }}>{item.source}：{item.content}</span>
    </div>
  ))}
</div>
```

- [ ] **Step 4: 在 `CommandMode.tsx` 中替换 `CommandTimeline`**

把：

```tsx
<CommandTimeline />
```

改为：

```tsx
<CommandCommPanel />
```

并删除 `CommandTimeline` import，增加 `CommandCommPanel` import。

- [ ] **Step 5: 调整主内容区 bottom**

`CommandMode.tsx` 中主内容区 `bottom: 90` 改为 `bottom: 146`，为底部 118px 面板留空间。

- [ ] **Step 6: 运行类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

---

### Task 5: 地图主屏增强为“可点击聚焦 + 视频 Dock 入口”

**Files:**
- Create: `src/components/command/MapVideoDock.tsx`
- Modify: `src/components/command/CommandMap.tsx`

- [ ] **Step 1: 创建 `MapVideoDock.tsx`**

```tsx
import { Video, Plane } from 'lucide-react';

export default function MapVideoDock() {
  return (
    <div style={{ position: 'absolute', right: 16, bottom: 16, width: 260, padding: 12, borderRadius: 8, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(0,208,233,0.15)', zIndex: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>视频联动</div>
      <div style={{ height: 110, borderRadius: 6, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#475569' }}>自动调取进港大道沿线视频</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid #334155', background: 'rgba(255,255,255,0.04)', color: '#C9CDD4' }}><Video size={12} style={{ marginRight: 4 }} />切换视频</button>
        <button style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid rgba(0,208,233,0.25)', background: 'rgba(0,208,233,0.08)', color: '#00D0E9' }}><Plane size={12} style={{ marginRight: 4 }} />派出无人机</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 `CommandMap.tsx` 中加入地图标题和聚焦提示**

在 card 内顶部增加：

```tsx
<div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.9)', border: '1px solid rgba(0,208,233,0.15)' }}>
  <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>进港大道拥堵态势</div>
  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>点击路段可聚焦放大，查看车辆数/危化品/未来流入趋势</div>
</div>
```

- [ ] **Step 3: 引入视频 Dock**

在 `CommandMap.tsx` import：

```tsx
import MapVideoDock from './MapVideoDock';
```

并在 JSX 末尾加入：

```tsx
<MapVideoDock />
```

- [ ] **Step 4: 运行类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

---

### Task 6: 清理 V3 旧组件引用并做最终验证

**Files:**
- Modify: `src/components/command/CommandMode.tsx`
- Optional delete later: `src/components/command/DecisionChainSteps.tsx`, `Step*.tsx`, `StrategyExecutionBoard.tsx`, `CommandTimeline.tsx`

- [ ] **Step 1: 从 `CommandMode.tsx` 移除旧组件 import**

删除这些 import：

```tsx
import DecisionChainSteps from './DecisionChainSteps';
import CommandTimeline from './CommandTimeline';
import StepSituation from './StepSituation';
import StepAttribution from './StepAttribution';
import StepImpact from './StepImpact';
import StepStrategy from './StepStrategy';
import StepPrediction from './StepPrediction';
import StepTracking from './StepTracking';
import StrategyExecutionBoard from './StrategyExecutionBoard';
```

增加：

```tsx
import StrategyCommandPanel from './StrategyCommandPanel';
import CommandCommPanel from './CommandCommPanel';
```

- [ ] **Step 2: 删除 `renderStepContent` 逻辑**

直接移除 `currentStep` 读取和 `renderStepContent()` 函数。

- [ ] **Step 3: 替换左栏为简单堵况卡片**

左栏直接放 3 块：

```tsx
<StepSituation />
<StepAttribution />
<StepImpact />
```

注意：这里不是 Tab，而是一屏同时展示三个问题侧卡片。

- [ ] **Step 4: 替换右栏与底部**

```tsx
<StrategyCommandPanel />
```

底部：

```tsx
<CommandCommPanel />
```

- [ ] **Step 5: 最终类型检查**

Run: `npx tsc --noEmit 2>&1 | grep -v "src/pages/"`
Expected: 无输出

- [ ] **Step 6: 最终构建验证**

Run: `npx vite build`
Expected: `✓ built in ...`

- [ ] **Step 7: 浏览器验收清单**

1. 进入指挥模式
2. 顶部摘要条显示：拥堵概况 + 主因 + 推荐策略 + 返回按钮
3. 中间地图正常显示，不是白屏
4. 右侧策略栏显示：AI方案 + 资源状态 + 历史参考
5. 底部显示：策略执行流程节点 + 现场反馈消息流
6. 点击执行策略后：底部进度条状态推进，顶部指数下降，右侧按钮状态变化
7. 点击“派出无人机”按钮能看到交互反馈（第一批可先做按钮反馈）

---

## Self-Review

- **Spec coverage:** 已覆盖 V4.0 第一批核心目标：地图主屏、右侧策略栏、底部通信面板、去掉 6 步 Tab。未包含第二批深交互（真实视频切换、无人机飞行动画、时间滑块），符合第一批范围。
- **Placeholder scan:** 无 TBD/TODO/implement later。所有任务都有具体文件、具体代码、具体命令。
- **Type consistency:** 统一使用现有 `CommandState` 字段：`focusRoad`、`commandFeed`、`resources`、`strategies`、`executionSteps`。未引入未定义字段。
