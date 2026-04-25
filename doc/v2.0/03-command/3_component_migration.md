# 组件迁移清单

> **所属模块**：指挥模式
> **使用端**：PC 大屏
> **前置阅读**：`1_common.md`、`2_merge_analysis.md`

## 一、迁移概览

| 类别 | 数量 |
|------|------|
| 保留（指挥模式原有） | 14 个组件 |
| 迁入（从应急迁入） | 6 个组件 |
| 移除（应急独有，不迁入） | 14 个组件 |
| 合并到现有组件 | 5 个组件 |

## 二、保留清单（14 个）

### 主结构
- `CommandMode.tsx` - 主布局容器（需修改：增加场景切换 + 右侧面板拆分）

### 摘要与地图
- `CommandSummaryBar.tsx` - 摘要条（需修改：增加场景感知样式）
- `CommandMap.tsx` - 主地图（需修改：增加应急图层）
- `CommandMapLegend.tsx` - 地图图例
- `MapVideoDock.tsx` - 视频面板

### 策略面板
- `StrategyCommandPanel.tsx` - 策略面板（需修改：顶部增加预案入口）
- `StrategyFlowBar.tsx` - 策略执行流程条
- `StrategyConfirmModal.tsx` - 策略确认弹窗
- `HistoryStatsPanel.tsx` - 历史策略统计

### 执行资源
- `ExecutionResourcePanel.tsx` - 执行资源面板（需修改：场景感知增加应急卡片）

### 通信
- `CommandCommPanel.tsx` - 通信面板（需修改：增加频道切换）
- `ChatWindow.tsx` - 聊天窗口
- `VideoCallWindow.tsx` - 视频通话
- `IncomingCallModal.tsx` - 来电弹窗
- `PhotoViewerModal.tsx` - 照片查看器

### 人员
- `PersonMarker.tsx` - 人员标注
- `PersonPopup.tsx` - 人员详情

### 报告与详情
- `CommandReportModal.tsx` - 指挥报告（需修改：增加应急场景内容）
- `CongestionDetailModal.tsx` - 拥堵详情

### 预测
- `PredictionCurveChart.tsx` - 预测曲线图

## 三、迁入清单（6 个）

### 特殊车辆
- `emergency/SpecialVehiclePanel.tsx` → `command/SpecialVehiclePanel.tsx`
  - 改造：作为 ExecutionResourcePanel 内的可折叠卡片
  - 显示条件：scene === 'emergency'

- `emergency/SpecialVehicleDetailModal.tsx` → `command/SpecialVehicleDetailModal.tsx`
  - 改造：直接迁入，无需修改

### 物资需求
- `emergency/SupplyDemandPanel.tsx` → `command/SupplyDemandPanel.tsx`
  - 改造：简化版，只保留需求/已调拨/缺口
  - 移除：复杂的估算逻辑（应急电源、盒饭份数等估算）
  - 显示条件：scene === 'emergency'

### 任务板
- `emergency/EmergencyTaskBoard.tsx` → `command/EmergencyTaskBoard.tsx`
  - 改造：简化为任务列表
  - 整合到 ExecutionResourcePanel 底部
  - 显示条件：scene === 'emergency'

### 预案
- `emergency/EmergencyPlanLibraryModal.tsx` → `command/EmergencyPlanLibraryModal.tsx`
  - 改造：作为快捷入口弹窗
  - 触发：策略面板顶部"启动预案"按钮

- `emergency/EmergencyPlanDetailModal.tsx` → `command/EmergencyPlanDetailModal.tsx`
  - 改造：直接迁入

## 四、移除清单（14 个）

### 5 阶段状态机相关
- `EmergencySimulator.tsx` - 后台模拟器
- `EmergencyTimeline.tsx` - 底部时间轴

### 滞留预测相关
- `EmergencyForecastPanel.tsx` - 滞留预测面板

### 视频会商
- `EmergencyVideoConference.tsx` - 多方视频会商
- `EmergencyVideoDock.tsx` - 视频监控面板

### 应急独有
- `EmergencyMap.tsx` - 应急地图（合并到 CommandMap）
- `EmergencyBanner.tsx` - 红色横幅（合并到 CommandSummaryBar）
- `EmergencyPlanPanel.tsx` - 预案面板（简化为快捷入口）
- `EmergencyCommPanel.tsx` - 应急通信（合并到 CommandCommPanel）
- `ResourceDispatchPanel.tsx` - 资源调度（合并到 ExecutionResourcePanel）
- `ResourceDetailModal.tsx` - 资源详情
- `EmergencyReportModal.tsx` - 应急报告（合并到 CommandReportModal）
- `AddTaskModal.tsx` - 添加任务弹窗

### 主入口
- `EmergencyMode.tsx` - 应急模式主组件（隐藏，不直接删除）

## 五、迁移注意事项

### 命名空间
- 所有迁入组件保持原命名（避免与指挥组件冲突）
- 命名前缀建议：保持 `Emergency` 前缀，便于识别来源
- 例：`SpecialVehiclePanel` 保持原名，但放在 command 目录下

### Store 引用替换
- 所有从应急组件迁入的代码，需要把 `useEmergencyStore` 替换为 `useCommandStore`
- 涉及字段：`specialVehicles`, `supplyDemand`, `emergencyTasks`, `activePlan`

### 样式调整
- 应急组件的红色主题需要调整为与指挥模式视觉一致
- 保留场景感知的红色（应急场景）和橙色（拥堵场景）

### 数据初始化
- 进入应急场景时，自动初始化特殊车辆、物资需求、任务板的 mock 数据
- 退出应急场景时，可保留数据但隐藏面板

## 六、迁移顺序建议

| 阶段 | 任务 | 说明 |
|------|------|------|
| 1 | commandStore 扩展 | 增加 scene、specialVehicles 等字段 |
| 2 | 场景切换逻辑 | 实现 scene 状态切换 |
| 3 | CommandSummaryBar 改造 | 增加场景感知样式 |
| 4 | CommandMode 布局调整 | 右侧面板拆分上下两块 |
| 5 | 特殊车辆面板迁入 | 折叠卡片形式 |
| 6 | 物资需求面板迁入 | 简化版 |
| 7 | 任务板整合 | 整合到执行资源面板 |
| 8 | 预案快捷入口 | 策略面板顶部按钮 |
| 9 | CommandMap 应急图层 | 停车区、无人机巡查 |
| 10 | 通信面板频道切换 | 应急场景自动切应急频道 |
| 11 | 应急模式隐藏 | 从导航栏移除 |
| 12 | 测试验收 | 全场景测试 |
