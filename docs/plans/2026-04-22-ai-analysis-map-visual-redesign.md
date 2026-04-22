# AI 分析屏地图视觉重设计

**日期**: 2026-04-22  
**状态**: 设计完成，待实施  
**优先级**: P0（核心体验优化）

## 背景

当前 AI 分析屏的地图视觉编排存在以下问题：
1. 城区热力区使用青色 `#00d0e9`，与 UI 主色相同，缺少区分度
2. 三个热力区颜色相近（橙、红、青），重叠时视觉混乱
3. AI 卡片样式单一，缺少层次感和毛玻璃效果
4. 卡片与热力区之间没有视觉关联，用户不知道卡片对应哪个区域
5. 卡片位置固定，可能遮挡关键地图区域

用户反馈：**视觉效果是核心，否则会看起来很 low**

## 设计目标

1. **视觉高级**：毛玻璃、渐变、动画，打造高端大屏质感
2. **信息清晰**：热力区配色拉开色相，卡片与热力区建立视觉关联
3. **防遮挡**：卡片智能定位，避免遮挡关键区域
4. **动态感**：热力图呼吸、流线动效，增强吸引力

## 方案一：智能聚焦式（推荐）

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│              AI 状态条 (AIStatusBar)                     │
├──────────────┬──────────────────────────┬───────────────┤
│  左侧面板    │      中间地图区域        │   右侧面板    │
│  (300px)     │      (flex: 1)          │   (400px)     │
│              │                          │               │
│ 分析要素列表 │  地图 + 热力区 + 标注点  │ Top 3 策略卡片│
│              │  + 图层控制器            │  (可折叠)     │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

### 核心组件

1. **AIAnalysisMode.tsx**（主容器）
   - 管理全局状态（选中要素、高亮策略）
   - 协调三个区域的联动

2. **AnalysisElementList.tsx**（左侧新组件）
   - 替代现有的 InsightPanel 和 CorrelationPanel
   - 显示问题检测、风险预警、趋势预测与因果推理三类要素

3. **AIAnalysisMap.tsx**（中间地图，改造）
   - 保留现有热力图和传导线
   - 移除现有的分析卡片（信息迁移到左侧列表）
   - 新增图层控制器

4. **StrategyRecommendationPanel.tsx**（右侧新组件）
   - 替代现有的 DecisionAssistPanel
   - 显示 Top 3 策略建议（可折叠卡片）
   - 支持高亮和展开选中策略

## 地图视觉编排方案（核心）

### 1. 热力图层配色优化

**当前问题**：
- 城区热力区用青色 `#00d0e9`，与 UI 主色相同，缺少区分度
- 三个热力区颜色相近（橙、红、青），重叠时视觉混乱

**优化方案**：

```typescript
const heatAreas = [
  {
    id: 'port',
    name: '港口积压',
    center: [110.096, 20.226],
    radius: 2300,
    fill: '#FF4757',      // 红色 - 问题（现状）
    type: 'problem'
  },
  {
    id: 'road',
    name: '进港大道',
    center: [110.152, 20.260],
    radius: 2800,
    fill: '#F5A623',      // 橙色 - 风险（预警）
    type: 'risk'
  },
  {
    id: 'city',
    name: '城区承压',
    center: [110.183, 20.322],
    radius: 2100,
    fill: '#7C5CFC',      // 紫色 - 预测（趋势）← 关键改动
    type: 'prediction'
  },
];
```

**配色逻辑**：红色（问题）→ 橙色（风险）→ 紫色（预测），色相拉开避免混淆。热力区 `fillOpacity: 0.15`，边框 `strokeOpacity: 0.35`。

### 2. AI 卡片样式升级

```css
.amap-twin-card {
  padding: 10px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(7, 20, 38, 0.88), rgba(11, 29, 48, 0.82));
  backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(0, 208, 233, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-left: 3px solid var(--card-accent);
  animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.amap-twin-card--primary  { --card-accent: #00D0E9; }
.amap-twin-card--warning  { --card-accent: #F5A623; }
.amap-twin-card--danger   { --card-accent: #FF4757; }
.amap-twin-card--success  { --card-accent: #2ED573; }

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 3. 卡片与热力区视觉关联

用虚线连接卡片和热力区中心，`strokeOpacity: 0.35`，`strokeDasharray: [8, 4]`。

### 4. 卡片防遮挡算法

四象限斥力算法：计算卡片相对于所有热力区中心的合力方向，将卡片"推"到热力区外侧。多卡片防重叠：对已放置的卡片也加入斥力源，迭代 2-3 轮收敛。

### 5. 热力图呼吸动画

```typescript
let phase = 0;
const breatheInterval = setInterval(() => {
  phase += 0.03;
  const opacity = 0.15 + Math.sin(phase) * 0.05; // 0.10 ~ 0.20
  heatCircles.forEach(c => c.setOptions({ fillOpacity: opacity }));
}, 60);
```

### 6. 流线动效优化

虚线间距调整为 `[12, 6]`，增强流动感。

## 三联动交互

1. **进入页面** → 地图展示全局热力 + 左侧列表显示所有要素 + 右侧显示 Top 3 策略
2. **点击左侧列表项** → 地图聚焦到对应区域 + 右侧高亮对应策略并展开
3. **点击地图标注点** → 左侧列表滚动到对应项 + 右侧切换到该要素的策略

## 左侧面板：分析要素列表

### 要素类型

| 类型 | 图标颜色 | 说明 |
|------|----------|------|
| 问题检测 | `#FF4757` 红 | 当前已检测到的问题（港口积压、道路拥堵、设备故障等） |
| 风险预警 | `#F5A623` 橙 | 未来可能发生的风险（12小时内预警、极端天气风险等） |
| 趋势预测与因果推理 | `#7C5CFC` 紫 | 未来趋势预测 + 因果关系链 |

### 列表项结构

每个要素项包含：
- 类型图标（颜色区分）
- 要素名称
- 关键数值
- 严重程度标签
- 点击后地图聚焦 + 右侧展示策略

## 右侧面板：策略建议

### 默认展示 Top 3 策略

每个策略卡片包含：
- 策略名称 + 置信度
- 效能指标（拥堵下降、排队缩短、见效时间）
- 对应的问题/风险要素
- 可折叠的详细推演依据

### 联动高亮

点击地图要素或左侧列表项后，右侧高亮对应策略并自动展开。

## 需要修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `AIAnalysisMode.tsx` | 改造 | 替换左右面板组件，添加全局状态管理 |
| `AIAnalysisMap.tsx` | 改造 | 热力区配色、卡片样式、连线、动画 |
| `ai-analysis-mode.css` | 改造 | 新增卡片样式、动画、左侧列表样式 |
| `AnalysisElementList.tsx` | 新建 | 左侧分析要素列表 |
| `StrategyRecommendationPanel.tsx` | 新建 | 右侧策略建议面板 |
| `InsightPanel.tsx` | 移除引用 | 不再在主布局中使用 |
| `CorrelationPanel.tsx` | 移除引用 | 不再在主布局中使用 |
| `DecisionAssistPanel.tsx` | 移除引用 | 不再在主布局中使用 |

## 实施优先级

### Phase 1：地图视觉优化（P0）
1. 热力区配色调整（紫色替代青色）
2. AI 卡片样式升级（毛玻璃、左边框、动画）
3. 卡片与热力区连线
4. 热力图呼吸动画

### Phase 2：左右面板重构（P0）
1. 创建 AnalysisElementList 组件
2. 创建 StrategyRecommendationPanel 组件
3. 替换 AIAnalysisMode 中的面板引用
4. 实现三联动交互

### Phase 3：优化与打磨（P1）
1. 卡片防遮挡算法
2. 流线动效优化
3. 图层控制器增强

## 验收标准

1. 热力区配色清晰，紫色与青色 UI 主色区分明显
2. AI 卡片有毛玻璃效果，左边框色条醒目
3. 卡片与热力区有虚线连接，视觉关联清晰
4. 热力图有呼吸动画，视觉吸引力强
5. 左侧列表、地图、右侧策略三联动流畅
6. 整体视觉效果高级，不显得 low

## 风险与注意事项

1. **高德地图 API 限制**：部分动画效果（如流线 dashOffset）可能需要自定义 Canvas 覆盖物
2. **性能**：呼吸动画和连线需要控制刷新频率，避免卡顿
3. **兼容性**：`backdrop-filter` 需要浏览器支持，降级方案为纯色背景
4. **数据绑定**：左侧列表和右侧策略需要与地图要素建立数据关联

## 下一步

调用 `writing-plans` 技能，生成详细的实施计划。
