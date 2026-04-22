# AI 分析屏地图视觉重设计 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化 AI 分析屏地图视觉效果，通过热力区配色优化、毛玻璃卡片、视觉关联和动画效果，打造高端大屏质感

**Architecture:** Phase 1 聚焦地图视觉优化（热力区配色、卡片样式、连线、动画），Phase 2 重构左右面板（分析要素列表、策略建议），Phase 3 优化打磨（防遮挡算法、流线动效）

**Tech Stack:** React 18 + TypeScript + 高德地图 JS API + CSS3 动画

---

## Phase 1: 地图视觉优化（P0）

### Task 1: 热力区配色调整

**Files:**
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:12-40`
- Modify: `src/components/ai-analysis/ai-analysis-mode.css:449-453`

**Step 1: 修改热力区配色数据**

在 `AIAnalysisMap.tsx` 中，将城区热力区的颜色从青色改为紫色，并调整透明度：

```typescript
const heatAreas = [
  {
    id: 'port',
    name: '港口积压',
    value: '2847辆',
    center: [110.096, 20.226],
    radius: 2300,
    fill: '#FF4757',      // 红色 - 问题（现状）
    stroke: '#FF4757',
    type: 'problem'
  },
  {
    id: 'road',
    name: '进港大道',
    value: '3.2km',
    center: [110.152, 20.260],
    radius: 2800,
    fill: '#F5A623',      // 橙色 - 风险（预警）
    stroke: '#F5A623',
    type: 'risk'
  },
  {
    id: 'city',
    name: '城区承压',
    value: '指数65',
    center: [110.183, 20.322],
    radius: 2100,
    fill: '#7C5CFC',      // 紫色 - 预测（趋势）← 关键改动
    stroke: '#7C5CFC',
    type: 'prediction'
  },
];
```

**Step 2: 调整热力区透明度**

在 `AIAnalysisMap.tsx:184-194` 中，调整 Circle 的透明度：

```typescript
const heat = heatAreas.map((area) => new AMap.Circle({
  center: area.center,
  radius: area.radius,
  strokeColor: area.stroke,
  strokeWeight: 1,
  strokeOpacity: 0.35,    // 从 0.42 调整为 0.35
  fillColor: area.fill,
  fillOpacity: 0.15,      // 从 0.18 调整为 0.15
  zIndex: 41,
  bubble: true,
}));
```

**Step 3: 更新图例样式**

在 `ai-analysis-mode.css:449-453` 中，更新城区图例颜色：

```css
.amap-twin-label--city {
  border-color: rgba(124, 92, 252, 0.3);
  color: #7C5CFC;
  box-shadow: 0 0 18px rgba(124, 92, 252, 0.12);
}
```

**Step 4: 更新地图图例文字**

在 `AIAnalysisMap.tsx:301-306` 中，更新图例文字：

```typescript
<div className="ai-analysis-map__legend">
  <span><i className="legend-dot legend-dot--danger" />问题热区</span>
  <span><i className="legend-dot legend-dot--warning" />风险热区</span>
  <span><i className="legend-dot legend-dot--prediction" />预测热区</span>
  <span><i className="legend-dot legend-dot--success" />AI建议</span>
</div>
```

**Step 5: 添加紫色图例样式**

在 `ai-analysis-mode.css:617-620` 后添加：

```css
.legend-dot--prediction { background: #7C5CFC; }
```

**Step 6: 验证视觉效果**

启动开发服务器，检查：
- 城区热力区显示为紫色
- 三个热力区颜色区分明显（红、橙、紫）
- 透明度适中，不会过于抢眼

**Step 7: 提交更改**

```bash
git add src/components/ai-analysis/AIAnalysisMap.tsx src/components/ai-analysis/ai-analysis-mode.css
git commit -m "feat(ai-analysis): 优化热力区配色，紫色替代青色"
```

---

### Task 2: AI 卡片样式升级

**Files:**
- Modify: `src/components/ai-analysis/ai-analysis-mode.css:455-514`

**Step 1: 升级卡片基础样式**

在 `ai-analysis-mode.css:455-466` 中，替换 `.amap-twin-card` 样式：

```css
.amap-twin-card {
  display: grid;
  grid-template-columns: 14px auto;
  gap: 2px 5px;
  min-width: 132px;
  padding: 10px 14px;
  border-radius: 8px;
  /* 毛玻璃渐变背景 */
  background: linear-gradient(
    135deg,
    rgba(7, 20, 38, 0.88),
    rgba(11, 29, 48, 0.82)
  );
  backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(0, 208, 233, 0.18);
  /* 双层阴影 */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  /* 类型色左边框 */
  border-left: 3px solid var(--card-accent);
  /* 入场动画 */
  animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Step 2: 添加卡片类型色变量**

在 `.amap-twin-card--warning` 等样式前添加：

```css
.amap-twin-card--primary  { --card-accent: #00D0E9; }
.amap-twin-card--warning  { --card-accent: #F5A623; }
.amap-twin-card--danger   { --card-accent: #FF4757; }
.amap-twin-card--success  { --card-accent: #2ED573; }
```

**Step 3: 添加入场动画**

在 `ai-analysis-mode.css` 末尾（@media 前）添加：

```css
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Step 4: 移除旧的卡片类型样式**

删除 `ai-analysis-mode.css:492-514` 中的旧样式（`.amap-twin-card--warning`、`--danger`、`--success` 的 border-color 和 icon color 设置），因为已经用 CSS 变量统一处理。

**Step 5: 验证视觉效果**

检查：
- 卡片有毛玻璃效果（背景模糊）
- 左边框色条醒目（根据卡片类型显示不同颜色）
- 卡片有淡入动画
- 双层阴影增强立体感

**Step 6: 提交更改**

```bash
git add src/components/ai-analysis/ai-analysis-mode.css
git commit -m "feat(ai-analysis): 升级AI卡片样式，增加毛玻璃和动画效果"
```

---

### Task 3: 卡片与热力区视觉关联

**Files:**
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:5-10`
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:133`
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:225-229`

**Step 1: 扩展 SemanticOverlayGroups 类型**

在 `AIAnalysisMap.tsx:5-10` 中，添加 connectors 字段：

```typescript
type SemanticOverlayGroups = {
  heat: any[];
  flows: any[];
  labels: any[];
  cards: any[];
  connectors: any[];  // 新增
};
```

**Step 2: 初始化 connectors 为空数组**

在 `AIAnalysisMap.tsx:133` 中：

```typescript
const semanticOverlaysRef = useRef<SemanticOverlayGroups>({ 
  heat: [], 
  flows: [], 
  labels: [], 
  cards: [],
  connectors: []  // 新增
});
```

**Step 3: 创建连线函数**

在 `createInsightCard` 函数后添加：

```typescript
function createConnector(
  cardPosition: [number, number],
  heatCenter: [number, number],
  tone: string
) {
  const colorMap: Record<string, string> = {
    primary: '#00D0E9',
    warning: '#F5A623',
    danger: '#FF4757',
    success: '#2ED573'
  };
  
  return {
    path: [cardPosition, heatCenter],
    color: colorMap[tone] || '#00D0E9',
  };
}
```

**Step 4: 生成连线覆盖物**

在创建 `cards` 后添加连线生成逻辑（在 `AIAnalysisMap.tsx:223` 后）：

```typescript
const connectors = insightCards.map((card, index) => {
  const targetArea = heatAreas[index % heatAreas.length];
  const connectorData = createConnector(card.position, targetArea.center, card.tone);
  
  return new AMap.Polyline({
    path: connectorData.path,
    strokeColor: connectorData.color,
    strokeOpacity: 0.35,
    strokeWeight: 1,
    strokeStyle: 'dashed',
    strokeDasharray: [8, 4],
    lineJoin: 'round',
    zIndex: 40,
    bubble: true,
  });
});
```

**Step 5: 添加连线到地图**

在 `AIAnalysisMap.tsx:225-229` 中，修改：

```typescript
semanticOverlaysRef.current = { heat, flows, labels, cards, connectors };
map.add([...heat, ...flows, ...connectors, ...labels, ...cards]);
setVisible(heat, visibilityRef.current.showHeatmap);
setVisible(flows, visibilityRef.current.showTrafficFlow);
setVisible([...connectors, ...labels, ...cards], visibilityRef.current.showAnalysisCards);
```

**Step 6: 更新清理逻辑**

在 `AIAnalysisMap.tsx:246` 中：

```typescript
semanticOverlaysRef.current = { heat: [], flows: [], labels: [], cards: [], connectors: [] };
```

**Step 7: 更新显示/隐藏逻辑**

在 `AIAnalysisMap.tsx:263` 中：

```typescript
setVisible([...semanticOverlaysRef.current.connectors, ...semanticOverlaysRef.current.labels, ...semanticOverlaysRef.current.cards], showAnalysisCards);
```

**Step 8: 验证视觉效果**

检查：
- 每个卡片与对应热力区有虚线连接
- 连线颜色与卡片类型色一致
- 连线透明度适中，不抢视觉焦点
- 切换"分析卡"按钮时，连线同步显示/隐藏

**Step 9: 提交更改**

```bash
git add src/components/ai-analysis/AIAnalysisMap.tsx
git commit -m "feat(ai-analysis): 添加卡片与热力区的虚线连接"
```

---

### Task 4: 热力图呼吸动画

**Files:**
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:143-248`

**Step 1: 添加呼吸动画逻辑**

在地图初始化完成后（`map.add` 之后），添加呼吸动画：

```typescript
// 在 AIAnalysisMap.tsx:229 后添加
let phase = 0;
const breatheInterval = setInterval(() => {
  if (!semanticOverlaysRef.current.heat.length) return;
  phase += 0.03;
  const opacity = 0.15 + Math.sin(phase) * 0.05; // 0.10 ~ 0.20
  semanticOverlaysRef.current.heat.forEach(circle => {
    circle.setOptions({ fillOpacity: opacity });
  });
}, 60);
```

**Step 2: 添加清理逻辑**

在 `return` 清理函数中（`AIAnalysisMap.tsx:234` 处），添加：

```typescript
return () => {
  destroyed = true;
  clearInterval(breatheInterval);  // 新增
  const overlays = Object.values(semanticOverlaysRef.current).flat();
  // ... 其余清理逻辑
};
```

**Step 3: 验证动画效果**

检查：
- 热力区有轻微的透明度变化（呼吸效果）
- 动画流畅，不卡顿
- 切换热力区显示/隐藏时，动画正常工作
- 组件卸载时，动画正确停止

**Step 4: 提交更改**

```bash
git add src/components/ai-analysis/AIAnalysisMap.tsx
git commit -m "feat(ai-analysis): 添加热力图呼吸动画效果"
```

---

### Task 5: 流线动效优化

**Files:**
- Modify: `src/components/ai-analysis/AIAnalysisMap.tsx:196-207`

**Step 1: 调整流线虚线间距**

在 `AIAnalysisMap.tsx:196-207` 中，修改 `strokeDasharray`：

```typescript
const flows = flowLines.map((flow) => new AMap.Polyline({
  path: flow.path,
  strokeColor: flow.color,
  strokeOpacity: 0.78,
  strokeWeight: flow.width,
  strokeStyle: 'dashed',
  strokeDasharray: [12, 6],  // 从 [14, 10] 调整为 [12, 6]
  lineJoin: 'round',
  lineCap: 'round',
  zIndex: 45,
  bubble: true,
}));
```

**Step 2: 验证视觉效果**

检查：
- 流线虚线间距更紧凑
- 视觉上更有"流动感"
- 与热力区和卡片的视觉层次协调

**Step 3: 提交更改**

```bash
git add src/components/ai-analysis/AIAnalysisMap.tsx
git commit -m "feat(ai-analysis): 优化流线虚线间距，增强流动感"
```

---

## Phase 1 验收检查

运行开发服务器，进入 AI 分析屏，验证：

1. ✅ 热力区配色清晰（红、橙、紫），紫色与青色 UI 主色区分明显
2. ✅ AI 卡片有毛玻璃效果，左边框色条醒目
3. ✅ 卡片与热力区有虚线连接，视觉关联清晰
4. ✅ 热力图有呼吸动画，视觉吸引力强
5. ✅ 流线虚线间距优化，流动感增强
6. ✅ 整体视觉效果高级，不显得 low

---

## Phase 2: 左右面板重构（待设计）

Phase 2 将创建 `AnalysisElementList` 和 `StrategyRecommendationPanel` 组件，实现三联动交互。具体实施计划待 Phase 1 完成后补充。

---

## Phase 3: 优化与打磨（待设计）

Phase 3 将实现卡片防遮挡算法、流线动效优化、图层控制器增强。具体实施计划待 Phase 2 完成后补充。
