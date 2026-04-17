# 指挥模式 V4.0 打磨实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将指挥模式的界面文案、用户故事表达、地图交互打磨到与 PRD 和用户故事一致。

**Architecture:** 纯前端改动，不涉及新组件创建。修改现有组件的文案和交互细节，补充 Store 类型字段和 Mock 数据。所有改动向后兼容，不影响现有功能。

**Tech Stack:** React 18 + TypeScript + Zustand + 高德地图 JS API

---

## 文件结构

| 文件 | 改动类型 | 职责 |
|------|----------|------|
| `src/store/dashboardStore.ts` | 修改 | 补充 CommandStrategy.triggerCondition 字段、FieldPerson 轨迹预留字段、策略冲突类型 |
| `src/utils/commandEngine.ts` | 修改 | STRATEGY_DB 补充 triggerCondition 字段 |
| `src/components/command/CommandSummaryBar.tsx` | 修改 | 摘要条补充归因信息和预计缓解时间 |
| `src/components/command/StrategyCommandPanel.tsx` | 修改 | 策略卡片补充触发条件和生效时间 |
| `src/components/command/CommandCommPanel.tsx` | 修改 | 标题改为"执行动态"，补充消息类型标签 |
| `src/components/command/StrategyFlowBar.tsx` | 修改 | 流程步骤补充预计耗时 |
| `src/components/command/PersonMarker.tsx` | 修改 | 点击反馈动画、选中光晕 |
| `src/components/command/CommandMap.tsx` | 修改 | 人员弹窗入场动画、无人机轨迹线、粒子动画优化 |

---

### Task 1: Store 数据结构补充

**Files:**
- Modify: `src/store/dashboardStore.ts`
- Modify: `src/utils/commandEngine.ts`


- [ ] **Step 1: 给 CommandStrategy 类型补充 triggerCondition 字段**

在 `src/store/dashboardStore.ts` 的 `CommandStrategy` interface 中，在 `risk` 字段后面添加：

```typescript
  triggerCondition: string;
```

- [ ] **Step 2: 给 FieldPerson 类型补充轨迹预留字段**

在 `src/store/dashboardStore.ts` 的 `FieldPerson` interface 中，在 `avatar` 字段后面添加：

```typescript
  targetPosition?: [number, number];
  trajectory?: [number, number][];
  estimatedArrival?: string;
```

- [ ] **Step 3: 新增策略冲突类型定义**

在 `src/store/dashboardStore.ts` 的 `CommandStrategy` interface 后面添加：

```typescript
export interface StrategyConflict {
  type: 'mutex' | 'constraint' | 'linkage';
  strategyA: string;
  strategyB: string;
  reason: string;
  severity: 'error' | 'warning';
}
```

- [ ] **Step 4: 给 commandEngine.ts 的 STRATEGY_DB 补充 triggerCondition**

在 `src/utils/commandEngine.ts` 的每个策略条目中添加 `triggerCondition` 字段：

```typescript
  'S-01': {
    // ... 现有字段
    triggerCondition: '进港大道拥堵指数 > 6.0 且排队 > 2km',
  },
  'S-02': {
    // ... 现有字段
    triggerCondition: '进港大道拥堵指数 > 4.0',
  },
  'S-04': {
    // ... 现有字段
    triggerCondition: '关键路口饱和度 > 80%',
  },
  'S-05': {
    // ... 现有字段
    triggerCondition: '港口待舶车辆 > 800 辆',
  },
  'S-07': {
    // ... 现有字段
    triggerCondition: '检测到交通事故',
  },
  'S-09': {
    // ... 现有字段
    triggerCondition: '任意拥堵策略执行时自动联动',
  },
```

- [ ] **Step 5: 更新 defaultCommandState 中的 Mock 策略数据**

在 `src/store/dashboardStore.ts` 的 `defaultCommandState.strategies` 数组中，给每个策略补充 `triggerCondition`：

```typescript
  strategies: [
    {
      id: 'S-01', name: '应急车道借用', recommended: true, permission: 'approve', permissionLabel: '🔴 需审批',
      effect: '6.5 → 4.8', time: '约 30 分钟', reduce: '~350 辆', difficulty: 2,
      effectTime: '5 分钟生效', risk: '应急车辆通行受限，需保留紧急通道',
      triggerCondition: '进港大道拥堵指数 > 6.0 且排队 > 2km',
      status: 'idle',
    },
    {
      id: 'S-02', name: 'S376 省道分流', recommended: true, permission: 'confirm', permissionLabel: '🟡 需确认',
      effect: '6.5 → 5.2', time: '约 20 分钟', reduce: '~200 辆', difficulty: 1,
      effectTime: '3 分钟生效', risk: 'S376 沿线居民出行受影响',
      triggerCondition: '进港大道拥堵指数 > 4.0',
      status: 'idle',
    },
  ],
```

- [ ] **Step 6: 验证 TypeScript 编译通过**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 7: Commit**

```bash
git add src/store/dashboardStore.ts src/utils/commandEngine.ts
git commit -m "feat(command): add triggerCondition, trajectory fields and conflict types"
```

### Task 2: 指挥摘要条文案优化（CommandSummaryBar）

**Files:**
- Modify: `src/components/command/CommandSummaryBar.tsx`

- [ ] **Step 1: 补充归因信息显示**

在 `CommandSummaryBar.tsx` 顶部读取 causes 数据：

```typescript
const causes = useDashboardStore((s) => s.commandState.causes);
```

在中间区域（Center section）替换现有的策略建议显示逻辑。在 `{isRelieved && executedStrategy ? (` 分支之后的 else 分支中，将现有内容替换为同时显示归因和建议：

```tsx
) : (
  <>
    {causes.length > 0 && (
      <span style={{ fontSize: 12, color: '#94A3B8' }}>
        原因：
        <span style={{ color: causes[0].color, fontWeight: 500 }}>
          {causes[0].label}（{causes[0].confidence}%）
        </span>
      </span>
    )}
    <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
    {activeStrategies.length > 0 && (
      <span style={{ fontSize: 12, color: '#94A3B8' }}>
        建议：
        <span style={{ color: '#00D0E9', fontWeight: 500, textShadow: '0 0 6px rgba(0,208,233,0.3)' }}>
          {activeStrategies.map(s => s.name).join(' + ')}
        </span>
      </span>
    )}
  </>
)}
```

- [ ] **Step 2: 补充预计缓解时间显示**

在右侧区域（Right section），将现有的 `{cmd.estimatedRelief}缓解` 改为更完整的表述：

```tsx
{!isRelieved && cmd.estimatedRelief && (
  <span style={{ fontSize: 12, color: '#64748B' }}>
    预计{cmd.estimatedRelief}缓解
  </span>
)}
```

- [ ] **Step 3: 优化达标退出状态的文案**

在 `isRelieved` 分支的左侧区域中，将 `拥堵已缓解（指数 {cmd.congestionIndex.toFixed(1)}）` 改为与用户故事一致的表述：

```tsx
<span style={{ fontSize: 12, color: '#2ED573' }}>
  拥堵已缓解（指数 {cmd.congestionIndex.toFixed(1)}，持续下降中）
</span>
```

在 `isRelieved` 分支的中间区域中，将 `策略 {executedStrategy.id} 执行有效` 改为：

```tsx
<span style={{ fontSize: 12, fontWeight: 500, color: '#2ED573', textShadow: '0 0 6px rgba(46,213,115,0.3)' }}>
  策略 {executedStrategy.id} {executedStrategy.name} 执行有效
</span>
```

- [ ] **Step 4: 验证 dev server 编译无报错**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/command/CommandSummaryBar.tsx
git commit -m "feat(command): enhance summary bar with cause info and relief time"
```

---

### Task 3: 策略工作台文案优化（StrategyCommandPanel）

**Files:**
- Modify: `src/components/command/StrategyCommandPanel.tsx`

- [ ] **Step 1: ActiveStrategyCard 补充触发条件显示**

在 `ActiveStrategyCard` 组件中，在"责任人"行下方添加触发条件行。在 `getResponsible` 显示的 `<div>` 后面添加：

```tsx
{strategy.triggerCondition && (
  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
    触发条件：<span style={{ color: '#94A3B8' }}>{strategy.triggerCondition}</span>
  </div>
)}
```

注意：需要给 `ActiveStrategyCard` 的 props 中的 `strategy` 类型确保包含 `triggerCondition`，它已经在 Task 1 中添加到 `CommandStrategy` 类型。

- [ ] **Step 2: ActiveStrategyCard 补充预计生效时间**

在效果进度条下方的"当前 X ↓Y"行后面，添加生效时间提示：

```tsx
<div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
  预计生效：<span style={{ color: '#00D0E9' }}>{strategy.effectTime}</span>
</div>
```

- [ ] **Step 3: AltStrategyCard 补充生效时间**

在 `AltStrategyCard` 组件中，在 badges row（PermissionBadge + 星级）和 execute button 之间，添加生效时间行：

```tsx
{/* Effect time */}
<div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>
  生效时间：<span style={{ color: '#94A3B8' }}>{strategy.effectTime}</span>
</div>
```

- [ ] **Step 4: 验证编译**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/command/StrategyCommandPanel.tsx
git commit -m "feat(command): add trigger condition and effect time to strategy cards"
```

---

### Task 4: 通信时间线文案优化（CommandCommPanel）

**Files:**
- Modify: `src/components/command/CommandCommPanel.tsx`

- [ ] **Step 1: 标题改为"执行动态"**

在 `CommandCommPanel.tsx` 的 Header 区域，将 `指挥通信时间线` 改为 `执行动态`：

```tsx
<span style={{
  fontSize: 12, fontWeight: 600, color: '#E2E8F0',
  letterSpacing: '0.5px',
}}>执行动态</span>
```

- [ ] **Step 2: 补充消息类型标签**

新增类型标签映射（在文件顶部 `typeBg` 定义附近）：

```typescript
const typeLabel: Record<string, { text: string; color: string }> = {
  system: { text: '系统', color: '#00D0E9' },
  ai: { text: 'AI', color: '#A78BFA' },
  command: { text: '指挥', color: '#2ED573' },
  field: { text: '现场', color: '#94A3B8' },
  approval: { text: '审批', color: '#2ED573' },
  alert: { text: '告警', color: '#FF4757' },
};
```

在消息卡片的 Time + source 行中，在 `<ItemIcon>` 和时间之间插入类型标签：

```tsx
{/* Time + source */}
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <ItemIcon size={12} color={iconInfo.color} />
  <span style={{
    fontSize: 9, padding: '0 4px', borderRadius: 3,
    background: `${(typeLabel[item.type] || typeLabel.field).color}15`,
    color: (typeLabel[item.type] || typeLabel.field).color,
    fontWeight: 600,
  }}>
    {(typeLabel[item.type] || typeLabel.field).text}
  </span>
  <span style={{
    fontSize: 11, color: 'rgba(0,208,233,0.8)',
    fontFamily: '"DIN Alternate", "DIN", "Consolas", "Monaco", monospace',
    fontWeight: 600,
    textShadow: '0 0 6px rgba(0,208,233,0.3)',
  }}>{item.time}</span>
  <span style={{ fontSize: 11, color: '#94A3B8' }}>{item.source}</span>
  {isApproval && (
    <CheckCircle size={11} color="#2ED573" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }} />
  )}
</div>
```

- [ ] **Step 3: 紧急消息补充"紧急"标签**

在消息内容区域，如果 `isUrgent` 为 true，在内容前面加上紧急标签：

```tsx
<div style={{
  fontSize: 11,
  color: isUrgent || isAlert ? '#FCA5A5' : '#C9CDD4',
  fontWeight: isUrgent || isAlert ? 600 : 400,
  lineHeight: 1.5, flex: 1,
}}>
  {isUrgent && (
    <span style={{
      fontSize: 9, padding: '0 4px', borderRadius: 3, marginRight: 4,
      background: 'rgba(255,71,87,0.2)', color: '#FF4757', fontWeight: 700,
    }}>紧急</span>
  )}
  {item.content}
</div>
```

- [ ] **Step 4: 验证编译**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/command/CommandCommPanel.tsx
git commit -m "feat(command): rename comm panel title and add message type labels"
```

---

### Task 5: 流程条补充预计耗时（StrategyFlowBar）

**Files:**
- Modify: `src/components/command/StrategyFlowBar.tsx`

- [ ] **Step 1: 定义每步预计耗时范围**

在 `StrategyFlowBar.tsx` 顶部，在 `nextStepHints` 定义后面添加：

```typescript
const stepDuration: Record<number, string> = {
  1: '0-1 分钟',
  2: '1-5 分钟',
  3: '5-20 分钟',
  4: '20-30 分钟',
};
```

- [ ] **Step 2: 在步骤卡片中显示预计耗时**

在 `StrategyFlowBar` 的步骤卡片中，在时间显示的 `<div>` 后面添加预计耗时：

```tsx
<div style={{
  fontSize: 10,
  color: isDone || isActive ? '#94A3B8' : '#64748B',
  fontFamily: 'monospace',
}}>
  {time}
</div>
{!isDone && (
  <div style={{
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  }}>
    预计 {stepDuration[step.id]}
  </div>
)}
```

- [ ] **Step 3: 当前步骤显示实际已用时间**

在 `StrategyFlowBar` 组件中，添加计算实际耗时的逻辑。在 `getStepTime` 函数后面添加：

```typescript
// Calculate elapsed time for active step
const getElapsedTime = (stepId: number): string => {
  if (stepId !== activeFlowStep) return '';
  const msg = commandFeed.find((f) => f.step === stepId);
  if (!msg) return '';
  
  // Parse time (format: HH:MM)
  const [hour, min] = msg.time.split(':').map(Number);
  const now = new Date();
  const msgTime = new Date();
  msgTime.setHours(hour, min, 0, 0);
  
  const diffMs = now.getTime() - msgTime.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return '刚开始';
  if (diffMin < 60) return `已用 ${diffMin} 分钟`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `已用 ${hours}h${mins}m`;
};
```

然后在步骤卡片的时间显示中，如果是 active 状态，显示实际耗时：

```tsx
<div style={{
  fontSize: 10,
  color: isDone || isActive ? '#94A3B8' : '#64748B',
  fontFamily: 'monospace',
}}>
  {time}
  {isActive && getElapsedTime(step.id) && (
    <span style={{ marginLeft: 4, color: '#00D0E9' }}>
      ({getElapsedTime(step.id)})
    </span>
  )}
</div>
```

- [ ] **Step 4: 验证编译**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/command/StrategyFlowBar.tsx
git commit -m "feat(command): add estimated duration and elapsed time to flow steps"
```

---

### Task 6: 人员标注点击反馈优化（PersonMarker）

**Files:**
- Modify: `src/components/command/PersonMarker.tsx`

- [ ] **Step 1: 添加点击缩放动画**

在 `PersonMarker.tsx` 的 marker 点击事件中，添加缩放动画。在 `marker.on('click', () => {` 内部，在调用 `onClick` 之前添加：

```typescript
// Click scale animation
const contentEl = marker.getContent();
if (contentEl) {
  contentEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
  contentEl.style.transform = 'scale(0.9)';
  setTimeout(() => {
    contentEl.style.transform = 'scale(1.0)';
  }, 100);
}
```

- [ ] **Step 2: 添加选中光晕效果**

在 `PersonMarker.tsx` 中，需要接收一个 `isSelected` prop 来判断是否选中。修改 `PersonMarkerProps` interface：

```typescript
interface PersonMarkerProps {
  person: FieldPerson;
  map: any;
  onClick?: (person: FieldPerson) => void;
  isSelected?: boolean;
}
```

然后在创建 marker content 时，如果 `isSelected` 为 true，添加光晕层：

```typescript
// 选中光晕（在 content 创建后，avatar 创建前）
if (isSelected) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    top: -6px;
    left: -6px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,208,233,0.3) 0%, transparent 70%);
    z-index: 0;
    animation: glowPulse 2s infinite;
  `;
  content.appendChild(glow);
  
  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes glowPulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
}
```

- [ ] **Step 3: 更新 CommandMap 传递 isSelected prop**

在 `CommandMap.tsx` 中，渲染 `PersonMarker` 时传递 `isSelected`：

```tsx
<PersonMarker
  key={person.id}
  person={person}
  map={mapInstance.current}
  onClick={handlePersonClick}
  isSelected={selectedPerson?.id === person.id}
/>
```

- [ ] **Step 4: 验证编译**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/components/command/PersonMarker.tsx src/components/command/CommandMap.tsx
git commit -m "feat(command): add click animation and selected glow to person markers"
```

---

### Task 7: 地图交互细节优化（CommandMap）

**Files:**
- Modify: `src/components/command/CommandMap.tsx`

- [ ] **Step 1: 人员弹窗增加淡入动画**

在 `CommandMap.tsx` 中，找到人员操作弹窗的渲染部分（`{selectedPerson && popupPosition && (`），给弹窗容器添加入场动画样式：

```tsx
<div
  ref={popupRef}
  style={{
    position: 'absolute',
    left: popupPosition.x,
    top: popupPosition.y,
    background: 'rgba(13,27,42,0.95)',
    border: '1px solid rgba(0,208,233,0.3)',
    borderRadius: 6,
    padding: 12,
    minWidth: 160,
    zIndex: 300,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    animation: 'personPopupFadeIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }}
>
```

然后在 `CommandMap` 的 `<style>` 标签中添加动画定义：

```css
@keyframes personPopupFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: 人员弹窗边界检测优化**

在 `handlePersonClick` 函数中，优化弹窗位置计算逻辑，避免超出地图区域。在 `setPopupPosition` 调用前添加边界检测：

```typescript
const handlePersonClick = (person: FieldPerson) => {
  setSelectedPerson(person);
  
  // Calculate popup position with boundary check
  const mapContainer = mapRef.current;
  if (!mapContainer) return;
  
  const mapRect = mapContainer.getBoundingClientRect();
  const popupWidth = 160;
  const popupHeight = 120;
  const padding = 20;
  
  // Get pixel position from lng/lat
  const pixel = mapInstance.current.lngLatToContainer(
    new (window as any).AMap.LngLat(person.position[0], person.position[1])
  );
  
  let x = pixel.x + 40; // offset to right of marker
  let y = pixel.y - 60; // offset above marker
  
  // Boundary check
  if (x + popupWidth > mapRect.width - padding) {
    x = pixel.x - popupWidth - 40; // show on left
  }
  if (y < padding) {
    y = padding;
  }
  if (y + popupHeight > mapRect.height - padding) {
    y = mapRect.height - popupHeight - padding;
  }
  
  setPopupPosition({ x, y });
};
```

- [ ] **Step 3: 无人机飞行轨迹线绘制**

在 `CommandMap.tsx` 中，在无人机巡逻动画逻辑中添加轨迹线绘制。在 `droneMarkerRef` 定义后添加轨迹线引用：

```typescript
const droneTrajectoryRef = useRef<any>(null);
```

在无人机移动逻辑中，记录轨迹点并绘制虚线。在 `dronePatrolIntervalRef.current = setInterval` 内部，在更新 marker 位置后添加：

```typescript
// Update trajectory line
if (!droneTrajectoryRef.current && (window as any).AMap) {
  const AMap = (window as any).AMap;
  droneTrajectoryRef.current = new AMap.Polyline({
    path: [],
    strokeColor: '#00D0E9',
    strokeWeight: 2,
    strokeOpacity: 0.4,
    strokeStyle: 'dashed',
    strokeDasharray: [10, 5],
    zIndex: 150,
  });
  droneTrajectoryRef.current.setMap(mapInstance.current);
}

// Add current position to trajectory
if (droneTrajectoryRef.current) {
  const path = droneTrajectoryRef.current.getPath();
  path.push(new (window as any).AMap.LngLat(currentPos[0], currentPos[1]));
  
  // Keep only last 20 points
  if (path.length > 20) {
    path.shift();
  }
  
  droneTrajectoryRef.current.setPath(path);
}
```

在 cleanup 中清理轨迹线：

```typescript
return () => {
  // ... existing cleanup
  if (droneTrajectoryRef.current) {
    droneTrajectoryRef.current.setMap(null);
    droneTrajectoryRef.current = null;
  }
};
```

- [ ] **Step 4: 无人机图标旋转动画**

在无人机 marker 的 content 创建中，给图标添加旋转动画。找到无人机图标的 SVG 创建部分，给容器添加旋转样式：

```typescript
droneIcon.style.cssText = `
  width: 24px;
  height: 24px;
  animation: droneRotate 3s linear infinite;
`;

// Add rotation animation
const style = document.createElement('style');
style.textContent = `
  @keyframes droneRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
```

- [ ] **Step 5: 验证编译**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 6: Commit**

```bash
git add src/components/command/CommandMap.tsx
git commit -m "feat(command): add popup animation, boundary check, drone trajectory and rotation"
```

---

### Task 8: 最终验证

**Files:**
- All modified files

- [ ] **Step 1: 完整编译检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 启动 dev server 验证界面**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npm run dev`
Expected: 服务启动成功，浏览器打开 http://localhost:5173

- [ ] **Step 3: 手动测试关键功能**

测试清单：
1. 切换到指挥模式，检查摘要条是否显示归因信息和预计缓解时间
2. 检查策略卡片是否显示触发条件和生效时间
3. 检查通信时间线标题是否改为"执行动态"，消息是否有类型标签
4. 检查流程条步骤是否显示预计耗时
5. 点击地图人员标注，检查是否有缩放动画和选中光晕
6. 检查人员弹窗是否有淡入动画，位置是否合理
7. 检查无人机是否有飞行轨迹线和旋转动画

- [ ] **Step 4: 更新 progress.md**

在 `/Users/zhangmingchen/projects/xuwen-traffic-dashboard-react/.claude/progress.md` 的"V4.0 待完善"部分，将已完成的项目标记为完成：

```markdown
**V4.0 文案与交互打磨已完成（2026-04-17）：**
- ✅ PRD 文案同步到界面（摘要条、策略卡片、通信时间线）
- ✅ 用户故事表达补齐（归因信息、预计缓解时间、触发条件）
- ✅ 地图交互微调（人员标注动画、弹窗优化、无人机轨迹）
- ✅ 数据结构预留（策略冲突类型、人员轨迹字段）

**V4.0 待完善：**
- [ ] 策略冲突检测（PRD H2-04，互斥/约束/联动规则）
- [ ] 人员聚类（PRD E3-03，缩放较小时按部门聚类）
- [ ] 人员移动轨迹线（PRD E3-06，移动中人员显示虚线路径）
- [ ] 执行资源面板（PRD E4-01~04，当前策略关联的人员/物资展示）
- [ ] 高德地图深色主题优化（当前用遮罩层模拟，需要调试样式权限）
```

- [ ] **Step 5: 最终 commit**

```bash
git add .claude/progress.md
git commit -m "docs: update progress for command mode polish completion"
```

---

## 实施完成

所有任务完成后，指挥模式 V4.0 的文案、用户故事表达、地图交互将与 PRD 和用户故事完全一致。
