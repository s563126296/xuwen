# 指挥模式 V4.0 打磨设计方案

> 日期：2026-04-17
> 范围：文案同步 + 用户故事补齐 + 地图交互微调 + 数据结构预留
> 前置：V4.0 第三批主体功能已完成

---

## 一、目标

把指挥模式从"功能可用"打磨到"文档、界面、交互一致"。不新增大功能，聚焦三件事：

1. PRD 文案同步到界面（按钮、提示语、状态描述）
2. 用户故事中的关键表达补齐到界面
3. 地图交互细节微调

---

## 二、第一阶段：文案与故事补齐

### 2.1 指挥摘要条（CommandSummaryBar）

**问题：** 摘要条缺少归因信息和预计缓解时间，不符合用户故事"一句话搞定"的体验。

**改动：**

1. 中间区域补充归因类型 + 置信度（从 `cmd.causes[0]` 读取）
2. 补充预计缓解时间显示
3. 达标退出状态文案对齐用户故事第 6.5 步

**改前：**
```
6.5 重度拥堵 | 排队 3.2km | 持续 42min | 建议: S376分流 + 应急车道
```

**改后：**
```
6.5 重度拥堵 | 排队 3.2km | 持续 42min | 原因：港口积压型（70%）| 建议：S376分流 + 应急车道 | 预计 45 分钟缓解
```

**达标退出改后：**
```
🟢 拥堵已缓解（指数 2.8，持续下降 35 分钟）| 策略 S-02 执行有效 | [查看处置报告] [返回总览模式]
```

**涉及文件：** `CommandSummaryBar.tsx`

### 2.2 策略工作台（StrategyCommandPanel）

**问题：** 策略卡片缺少结构化的执行条件和预期效果展示。

**改动：**

1. ActiveStrategyCard 补充"执行条件"行（如"进港大道拥堵指数 > 4.0"）
2. 效果进度条下方补充"预计生效时间"
3. 备选策略卡片补充"预计生效时间"字段
4. "查看追加方案"按钮文案改为"查看追加方案 →"（与用户故事一致）

**涉及文件：** `StrategyCommandPanel.tsx`，`dashboardStore.ts`（CommandStrategy 类型补字段）

### 2.3 通信时间线（CommandCommPanel）

**问题：** 标题"指挥通信时间线"偏技术化，消息分类不够直观。

**改动：**

1. 标题改为"执行动态"（更贴近指挥现场）
2. 消息卡片左上角补充类型标签（系统/现场/AI/审批）
3. 紧急消息增加"紧急"红色标签

**涉及文件：** `CommandCommPanel.tsx`

### 2.4 策略执行流程条（StrategyFlowBar）

**问题：** 流程步骤缺少预计耗时提示。

**改动：**

1. 每个步骤下方补充预计耗时（如"0-1min"）
2. 当前步骤显示实际已用时间

**涉及文件：** `StrategyFlowBar.tsx`

### 2.5 Store 数据补充

**改动：**

1. `CommandStrategy` 类型补充 `effectTime: string`（已有）和 `triggerCondition: string`（新增）
2. Mock 数据补充 `triggerCondition` 字段值
3. `FieldPerson` 类型补充 `targetPosition?: [number, number]` 和 `estimatedArrival?: string`（为轨迹线预留）

**涉及文件：** `dashboardStore.ts`

---

## 三、第二阶段：地图交互微调

### 3.1 人员标注点击反馈

**问题：** 点击人员标注后弹窗位置不稳定，缺少视觉反馈。

**改动：**

1. 点击人员标注时增加 scale 缩放动画（0.9 → 1.0）
2. 弹窗位置计算增加边界检测，避免超出地图区域
3. 弹窗增加 fadeIn 入场动画（opacity 0→1，translateY -8→0）
4. 选中人员标注增加青色光晕

**涉及文件：** `CommandMap.tsx`，`PersonMarker.tsx`

### 3.2 无人机飞行轨迹优化

**问题：** 无人机飞行路径是直线段，缺少轨迹线。

**改动：**

1. 无人机飞行时在地图上绘制淡青色虚线轨迹
2. 轨迹线透明度随时间衰减（最近的最亮，远的渐淡）
3. 无人机图标增加轻微旋转动画（模拟旋翼）

**涉及文件：** `CommandMap.tsx`

### 3.3 粒子动画性能优化

**问题：** 粒子动画 setInterval 80ms 可能在低端设备上卡顿。

**改动：**

1. 将 setInterval 改为 requestAnimationFrame
2. 增加帧率控制（目标 30fps）
3. 粒子数量根据地图缩放级别动态调整

**涉及文件：** `CommandMap.tsx`

---

## 四、数据结构预留（不实现功能，只补类型和空字段）

### 4.1 策略冲突规则类型

```typescript
// 新增到 dashboardStore.ts
interface StrategyConflict {
  type: 'mutex' | 'constraint' | 'linkage';
  strategyA: string;
  strategyB: string;
  reason: string;
  severity: 'error' | 'warning';
}
```

### 4.2 人员移动轨迹类型

```typescript
// FieldPerson 补充字段
interface FieldPerson {
  // ... 现有字段
  targetPosition?: [number, number];
  trajectory?: [number, number][];
  estimatedArrival?: string;
}
```

### 4.3 执行资源类型

```typescript
// 新增到 dashboardStore.ts
interface ExecutionResource {
  strategyId: string;
  personnelIds: string[];
  equipmentIds: string[];
  status: 'dispatching' | 'arrived' | 'standby';
}
```

---

## 五、不做的事

- 不实现策略冲突检测逻辑（只预留类型）
- 不实现人员聚类（只预留数据结构）
- 不实现人员移动轨迹线渲染（只预留坐标字段）
- 不实现执行资源面板 UI（只预留类型）
- 不改动总览模式任何代码
- 不改动 Store 的核心逻辑（只补字段和 Mock 数据）

---

## 六、实施优先级

| 优先级 | 内容 | 涉及文件 |
|--------|------|----------|
| P0 | 摘要条文案优化 | CommandSummaryBar.tsx |
| P0 | 策略工作台文案优化 | StrategyCommandPanel.tsx |
| P0 | 通信时间线文案优化 | CommandCommPanel.tsx |
| P0 | Store 数据补充 | dashboardStore.ts |
| P1 | 流程条耗时提示 | StrategyFlowBar.tsx |
| P1 | 人员标注点击反馈 | CommandMap.tsx, PersonMarker.tsx |
| P1 | 无人机轨迹优化 | CommandMap.tsx |
| P2 | 粒子动画性能优化 | CommandMap.tsx |
| P2 | 数据结构预留 | dashboardStore.ts |
