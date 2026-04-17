# 指挥模式重新设计 — 第一批实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构指挥模式框架，实现调度中心风格的 6 步决策链 Tab 切换 + 指挥摘要条 + 策略执行状态板 + 视觉紧迫感。

**Architecture:** 指挥摘要条（48px）+ 决策链步骤条（40px）横排在顶部，左侧面板随步骤 Tab 切换内容，右侧固定策略执行状态板，中间保持高德地图。Store 新增 `currentStep` 字段驱动 Tab 切换。

**Tech Stack:** React 18 + TypeScript + Zustand + Recharts + Lucide React

---

## 文件结构

### 新建文件
- `src/components/command/CommandSummaryBar.tsx` — 指挥摘要条（48px）
- `src/components/command/DecisionChainSteps.tsx` — 决策链步骤条（40px，6 步 Tab）
- `src/components/command/StepSituation.tsx` — 步骤①态势感知内容
- `src/components/command/StepAttribution.tsx` — 步骤②归因分析内容
- `src/components/command/StepImpact.tsx` — 步骤③影响评估内容
- `src/components/command/StepStrategy.tsx` — 步骤④策略推荐内容
- `src/components/command/StepPrediction.tsx` — 步骤⑤效果预测内容
- `src/components/command/StepTracking.tsx` — 步骤⑥执行跟踪内容
- `src/components/command/StrategyExecutionBoard.tsx` — 右侧策略执行状态板

### 修改文件
- `src/store/dashboardStore.ts` — CommandState 新增 `currentStep` + `setCurrentStep` + `estimatedRelief`
- `src/components/command/CommandMode.tsx` — 布局重构，集成新组件
- `src/App.tsx` — 删除旧警告栏（指挥摘要条移入 CommandMode）

### 删除文件
- `src/components/command/CommandLeftPanel.tsx` — 拆分为 6 个 Step 组件
- `src/components/command/CommandRightPanel.tsx` — 重构为 StrategyExecutionBoard

### 保留文件（不改动）
- `src/components/command/CommandMap.tsx` — 地图（第二批再改）
- `src/components/command/CommandTimeline.tsx` — 时间轴
- `src/components/command/PredictionCurveChart.tsx` — 预测曲线图（步骤⑤复用）
- `src/utils/commandEngine.ts` — 归因引擎 + 策略推荐引擎

---

## Task 1: Store 新增 currentStep 状态

**Files:**
- Modify: `src/store/dashboardStore.ts`

- [ ] **Step 1: 在 CommandState 接口中新增字段**

在 `src/store/dashboardStore.ts` 的 `CommandState` 接口（第 285 行）中，在 `historyEffects` 之后添加：

```ts
  historyEffects: Array<{ name: string; rate: number; color: string }>;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  estimatedRelief: string; // "约45分钟"
```

- [ ] **Step 2: 在 DashboardState 接口中新增方法**

在 `DashboardState` 接口的 `executeStrategy` 之后添加：

```ts
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
```

- [ ] **Step 3: 更新 defaultCommandState**

在 `defaultCommandState` 中添加：

```ts
  currentStep: 1,
  estimatedRelief: '约 45 分钟',
```

- [ ] **Step 4: 在 Store create 中添加 setter**

在 `executeStrategy` 方法之后添加：

```ts
  setCurrentStep: (step) => set((state) => ({
    commandState: { ...state.commandState, currentStep: step },
  })),
```

- [ ] **Step 5: 更新 enterCommandMode 重置 currentStep**

在 `enterCommandMode` 方法中，`commandState` 对象里添加 `currentStep: 1`。

- [ ] **Step 6: 更新 executeStrategy 自动推进步骤**

在 `executeStrategy` 方法的立即执行部分，添加 `currentStep: 4`（策略推荐步骤）。在 2 秒后的 setTimeout 中添加 `currentStep: 5`（效果预测）。在 4 秒后的 setTimeout 中添加 `currentStep: 6`（执行跟踪）。

- [ ] **Step 7: 验证编译**

```bash
npx tsc --noEmit 2>&1 | grep -v "src/pages/"
```

Expected: 无错误输出

---

## Task 2: CommandSummaryBar 指挥摘要条

**Files:**
- Create: `src/components/command/CommandSummaryBar.tsx`

- [ ] **Step 1: 创建组件**

```tsx
import { AlertTriangle, AlertOctagon, ArrowLeft } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const getCommandLevel = (index: number) => {
  if (index > 8) return { label: '严重拥堵', icon: AlertOctagon, bg: 'rgba(153,27,27,0.18)', border: 'rgba(153,27,27,0.35)', color: '#991B1B', pulse: true };
  if (index > 6) return { label: '重度拥堵', icon: AlertTriangle, bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.3)', color: '#DC2626', pulse: true };
  if (index > 4) return { label: '中度拥堵', icon: AlertTriangle, bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', color: '#F97316', pulse: false };
  if (index > 2) return { label: '轻度拥堵', icon: AlertTriangle, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#F59E0B', pulse: false };
  return { label: '道路通畅', icon: AlertTriangle, bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#10B981', pulse: false };
};

export default function CommandSummaryBar() {
  const cmd = useDashboardStore((s) => s.commandState);
  const exitCommandMode = useDashboardStore((s) => s.exitCommandMode);
  const selectedPort = useDashboardStore((s) => s.selectedPort);
  const level = getCommandLevel(cmd.congestionIndex);
  const LevelIcon = level.icon;

  const topStrategies = cmd.strategies.filter((s) => s.recommended || s.status === 'executing').slice(0, 2);
  const strategyText = topStrategies.map((s) => s.name).join(' + ') || '分析中...';

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', padding: '0 24px',
      background: level.bg, borderBottom: `1px solid ${level.border}`,
      transition: 'background 0.5s ease, border-color 0.5s ease',
      animation: level.pulse ? 'commandPulse 2s infinite' : 'none',
    }}>
      {/* Left: congestion overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 40%' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${level.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LevelIcon size={16} color={level.color} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: level.color }}>
          进港大道{level.label} {cmd.congestionIndex.toFixed(1)}
        </span>
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>
          · 排队{cmd.congestionDist} · 持续{cmd.congestionTime}min
        </span>
      </div>

      {/* Center: recommended strategy */}
      <div style={{ flex: '1 1 auto', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#00D0E9' }}>
          建议：{strategyText}
        </span>
      </div>

      {/* Right: estimated time + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
        <span style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'DIN, sans-serif' }}>
          {cmd.estimatedRelief}缓解
        </span>
        {[{ id: 'xuwen', label: '徐闻港' }, { id: 'haian', label: '海安新港' }].map((port) => (
          <button key={port.id} onClick={() => useDashboardStore.getState().setSelectedPort(port.id as any)}
            style={{
              padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.2s',
              borderColor: selectedPort === port.id ? 'rgba(0,208,233,0.4)' : 'rgba(255,255,255,0.1)',
              background: selectedPort === port.id ? 'rgba(0,208,233,0.15)' : 'transparent',
              color: selectedPort === port.id ? '#00D0E9' : '#A0A8B4',
              fontWeight: selectedPort === port.id ? 600 : 400,
            }}
          >{port.label}</button>
        ))}
        <button onClick={exitCommandMode} aria-label="返回总览"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
            color: '#A0A8B4', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#C9CDD4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#A0A8B4'; }}
        >
          <ArrowLeft size={12} />返回总览
        </button>
      </div>

      <style>{`
        @keyframes commandPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit 2>&1 | grep -v "src/pages/"
```

---

<!-- PLAN_CONTINUE_PLACEHOLDER -->
