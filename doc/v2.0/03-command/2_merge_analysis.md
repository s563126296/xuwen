# 应急指挥合并详细分析

> **所属模块**：指挥模式
> **使用端**：PC 大屏
> **前置阅读**：`1_common.md`

## 基础信息

| 项目 | 内容 |
|------|------|
| 所属模块 | 指挥模式 |
| 文档类型 | 合并方案分析 |
| 使用端 | PC |
| 数据来源 | v1.0 指挥模式 + 应急模式实际代码 |

## 一、功能对比矩阵

### 指挥模式 vs 应急模式

| 功能领域 | 指挥模式（v1.0） | 应急模式（v1.0） | v2.0 处理 |
|---------|----------------|----------------|----------|
| **顶部摘要** | CommandSummaryBar | EmergencyBanner | 合并：场景感知切换样式 |
| **地图** | CommandMap（拥堵热力） | EmergencyMap（停车区+台风） | 合并：统一地图 + 图层叠加 |
| **策略面板** | StrategyCommandPanel | EmergencyPlanPanel | 合并：策略 + 预案入口 |
| **通信面板** | CommandCommPanel | EmergencyCommPanel | 合并：保留指挥 + 吸收频道 |
| **资源面板** | ExecutionResourcePanel | ResourceDispatchPanel + SupplyDemandPanel | 合并：扩展物资能力 |
| **特殊车辆** | 无 | SpecialVehiclePanel | 迁入：右栏折叠卡片 |
| **任务板** | 无 | EmergencyTaskBoard | 迁入：整合到执行资源 |
| **视频** | MapVideoDock（4路+无人机） | EmergencyVideoDock + EmergencyVideoConference | 保留指挥 + 移除会商 |
| **报告** | CommandReportModal | EmergencyReportModal | 合并：统一模板 |
| **模式升级** | EscalateConfirmModal | 无 | 移除：不再需要 |
| **滞留预测** | 无 | EmergencyForecastPanel | 移除：过于复杂 |
| **5阶段状态机** | 无 | EmergencySimulator | 移除：不切实际 |
| **底部时间轴** | 无 | EmergencyTimeline | 移除：指挥已有趋势 |

## 二、保留 / 迁入 / 移除清单

### 保留项（指挥模式 v1.0 全部保留）

| 组件 | 说明 |
|------|------|
| CommandSummaryBar | 摘要条 |
| CommandMap | 主地图 |
| StrategyCommandPanel | 策略面板 |
| ExecutionResourcePanel | 执行资源面板 |
| HistoryStatsPanel | 历史策略统计 |
| StrategyConfirmModal | 策略确认（含冲突检测）|
| StrategyFlowBar | 策略执行流程条 |
| CommandCommPanel | 通信面板 |
| ChatWindow | 聊天窗口 |
| VideoCallWindow | 视频通话 |
| MapVideoDock | 地图视频 |
| PersonMarker | 人员标注 |
| CommandReportModal | 指挥报告 |
| CongestionDetailModal | 拥堵详情 |

### 迁入项（从应急模式迁入）

| 组件 | 改造方式 | 放置位置 |
|------|---------|---------|
| SpecialVehiclePanel | 改为可折叠卡片 | 执行资源面板内 |
| SpecialVehicleDetailModal | 直接迁入 | 全局 Modal |
| SupplyDemandPanel | 简化版（只保留需求/已调拨/缺口） | 执行资源面板内 |
| EmergencyTaskBoard | 简化为任务列表 | 整合到执行资源面板 |
| EmergencyPlanLibraryModal | 改为快捷入口弹窗 | 策略面板顶部触发 |
| EmergencyPlanDetailModal | 直接迁入 | 全局 Modal |

### 移除项（不迁入）

| 组件 | 移除原因 |
|------|---------|
| EmergencySimulator | 5阶段状态机过于复杂 |
| EmergencyForecastPanel | 滞留预测依赖大量数据 |
| EmergencyTimeline | 指挥模式已有趋势图 |
| EmergencyVideoConference | 多方会商功能保留基础通信即可 |
| EmergencyVideoDock | 已有 MapVideoDock 替代 |
| EmergencyMap | 与 CommandMap 合并 |
| EmergencyBanner | 与 CommandSummaryBar 合并 |
| EmergencyPlanPanel | 简化为快捷入口 |
| EmergencyCommPanel | 与 CommandCommPanel 合并 |
| ResourceDispatchPanel | 与 ExecutionResourcePanel 合并 |
| EmergencyReportModal | 与 CommandReportModal 合并 |
| EscalateConfirmModal | 不再需要升级 |
| AddTaskModal | 整合到执行资源面板 |

## 三、Store 合并方案

### 当前状态
- `commandStore` - 指挥模式状态
- `emergencyStore` - 应急模式状态（独立）

### 合并后
- `commandStore` 扩展，吸收应急核心字段
- `emergencyStore` 移除

### 新增字段

```typescript
interface CommandState {
  // 原有字段保留
  // ...

  // 新增：场景类型
  scene: 'congestion' | 'emergency';

  // 新增：从 emergencyStore 迁入
  specialVehicles: SpecialVehicle[];
  supplyDemand: SupplyDemandItem[];
  emergencyTasks: EmergencyTask[];

  // 新增：简化版预案执行
  activePlan: {
    planId: string;
    planName: string;
    progress: number;  // 0-100
    activeTasks: string[];
  } | null;
}
```

### 移除字段
原 `emergencyStore` 中以下字段不迁入：
- forecast（滞留预测）
- timeline（5阶段时间轴）
- typhoonPath（台风路径）
- videoConference（视频会商）

## 四、布局变化

### v1.0 指挥模式布局
- 摘要条（顶部）
- 地图（左侧 70%）+ 策略面板（右侧 300px）
- 通信面板（底部）

### v2.0 指挥模式布局
- 摘要条（顶部，场景感知）
- 地图（左侧 65%）+ 右侧面板（35%）
- 右侧面板分为：
  - 上：策略面板（保留 + 预案入口）
  - 下：执行资源面板（扩展，应急时增加折叠卡片）
- 通信面板（底部，频道切换增强）

## 五、场景切换逻辑

### 触发应急场景
- 港口停航通知
- 台风橙色/红色预警
- 手动切换

### 触发日常拥堵场景
- 拥堵指数 > 4
- 退出应急条件满足

### 切换时的变化

| 元素 | 日常拥堵 | 应急场景 |
|------|---------|---------|
| 摘要条样式 | 橙色 | 红色 |
| 摘要条内容 | 拥堵指数 + 趋势 | 预警信息 + 滞留数 |
| 策略面板顶部 | 隐藏预案入口 | 显示"启动预案"按钮 |
| 执行资源面板 | 显示人员/物资基础信息 | 增加特殊车辆 + 物资需求 + 任务板 |
| 地图图层 | 拥堵热力 + 分流路线 | 增加停车区 + 无人机巡查 |
| 通信面板 | 默认频道 | 自动切换应急频道 |

## 六、优先级

| 任务 | 优先级 | 工作量 |
|------|-------|--------|
| commandStore 扩展 | P0 | 2 天 |
| 场景切换逻辑 | P0 | 1 天 |
| 摘要条场景感知 | P0 | 1 天 |
| 特殊车辆面板迁入 | P0 | 1 天 |
| 物资需求面板迁入 | P0 | 1 天 |
| 任务板整合 | P0 | 2 天 |
| 预案快捷入口 | P0 | 1 天 |
| 应急模式代码隐藏 | P0 | 1 天 |
| 测试与调试 | P0 | 2 天 |
| **总计** | | **12 天** |

## 七、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 界面过于复杂 | 中 | 应急功能作为可折叠卡片 |
| 场景切换状态混乱 | 高 | 统一状态管理，引入 scene 字段 |
| 应急功能简化过度 | 中 | 与项目经理确认保留清单 |
| 直接删除代码风险 | 高 | 先隐藏不删，v2.0 稳定后再清理 |

## 八、验收标准

- [ ] 指挥模式可在拥堵和应急两种场景间切换
- [ ] 摘要条根据场景显示不同样式和内容
- [ ] 应急场景下显示特殊车辆面板
- [ ] 应急场景下显示物资需求面板
- [ ] 应急场景下显示任务板
- [ ] 应急场景下策略面板显示预案入口
- [ ] 日常场景下不显示应急专属面板
- [ ] 应急模式从导航栏隐藏
- [ ] 原有指挥模式功能不受影响
