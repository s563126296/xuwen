# dashboardStore 拆分方案

## 当前问题

`dashboardStore.ts` 共 1762 行，包含 5 种模式的所有状态和逻辑，职责混乱，难以维护。

## 拆分策略

按模式拆分为 5 个独立 Store + 1 个 UI Store：

```
src/stores/
├── index.ts                 # 统一导出
├── overviewStore.ts         # 总览模式
├── portStore.ts             # 港口模式
├── commandStore.ts          # 指挥模式
├── emergencyStore.ts        # 应急模式
├── analysisStore.ts         # 分析模式
└── uiStore.ts               # UI 状态（模态框、面板展开等）
```

## 各 Store 职责划分

### 1. uiStore.ts（UI 状态）
**职责**：管理全局 UI 状态，不包含业务逻辑

**状态**：
- `systemMode`: 当前系统模式
- `activeModal`: 当前打开的模态框
- `selectedPort`: 选中的港口
- `selectedDirection`: 选中的方向
- `selectedDeviceType`: 选中的设备类型
- `selectedRoad`: 选中的道路
- `viewMode`: 视图模式
- `pendingStrategyId`: 待确认的策略 ID

**Actions**：
- `setSystemMode(mode)`
- `setActiveModal(modal)`
- `setSelectedPort(port)`
- `setSelectedDirection(direction)`
- `setSelectedDeviceType(type)`
- `setSelectedRoad(road)`
- `setViewMode(mode)`
- `setPendingStrategy(strategyId)`

---

### 2. overviewStore.ts（总览模式）
**职责**：总览模式的所有数据和逻辑

**状态**：
- `portData`: 港口数据
- `predictions`: 拥堵预测
- `roadCongestions`: 道路拥堵数据
- `aiSummary`: AI 摘要
- `straitTransitIndex`: 海峡通行指数
- `portDigestion`: 港口消化能力
- `tidalEffect`: 潮汐效应
- `corridorPressure`: 通道压力
- `corridorElasticity`: 通道弹性
- `systemResilience`: 系统韧性
- `shutdownProbability`: 停航概率
- `urbanHealth`: 城区健康度
- `pressureTransmission`: 压力传导
- `weatherCoupling`: 天气耦合
- `specialEvents`: 特殊事件
- `baselineMode`: 基线模式
- `holidayContext`: 节假日上下文
- `currentWeather`: 当前天气

**Actions**：
- `updatePortData(port, data)`
- `setPredictions(predictions)`
- `setRoadCongestions(data)`
- `setAiSummary(summary)`
- `toggleAiSummaryExpanded()`
- `setStraitTransitIndex(data)`
- `setPortDigestion(data)`
- `setTidalEffect(data)`
- `setCorridorPressure(data)`
- `setCorridorElasticity(data)`
- `setSystemResilience(data)`
- `setShutdownProbability(data)`
- `setUrbanHealth(data)`
- `setPressureTransmission(data)`
- `setWeatherCoupling(data)`
- `setSpecialEvents(data)`
- `setBaselineMode(mode)`
- `setHolidayContext(ctx)`
- `setCurrentWeather(data)`

---

### 3. commandStore.ts（指挥模式）
**职责**：指挥模式的所有数据和逻辑

**状态**：
- `commandState`: 指挥模式完整状态
  - `context`: 触发上下文
  - `congestionIndex`: 拥堵指数
  - `congestionTrend`: 拥堵趋势
  - `causes`: 拥堵原因
  - `strategies`: 策略列表
  - `executionSteps`: 执行步骤
  - `timeline`: 时间线
  - `commandFeed`: 指令流
  - `resources`: 资源状态
  - `fieldPersons`: 现场人员
  - `activeVideoChannel`: 视频通道
  - `isDroneDeployed`: 无人机状态
  - `incomingCallPersonId`: 来电人员
  - `isInCall`: 通话状态
  - `chatWindowOpen`: 聊天窗口状态
  - `executionResources`: 执行资源
  - `historyStats`: 历史统计

**Actions**：
- `setCommandState(data)`
- `enterCommandMode(action)`
- `exitCommandMode()`
- `executeStrategy(strategyId)`
- `deployDrone()`
- `recallDrone()`
- `setActiveVideoChannel(channel)`
- `setCurrentStep(step)`
- `addCommandFeedItem(content)`
- `startCall(personId)`
- `endCall()`
- `openChatWith(personId)`

---

### 4. emergencyStore.ts（应急模式）
**职责**：应急模式的所有数据和逻辑

**状态**：
- `emergencyState`: 应急模式完整状态
  - `portShutdown`: 港口停航状态
  - `shutdownStartTime`: 停航开始时间
  - `emergencyLevel`: 应急等级
  - `bannerTitle`: 横幅标题
  - `forecast`: 预测数据
  - `tasks`: 任务列表
  - `resourcePoints`: 资源点
  - `fieldResources`: 现场资源
  - `specialVehicles`: 特殊车辆
  - `timeline`: 时间线
  - `communications`: 通讯记录
  - `contacts`: 联系人
  - `activePlan`: 激活的预案
  - `activeVideoChannel`: 视频通道
  - `isDroneDeployed`: 无人机状态
  - `videoConference`: 视频会商
  - `typhoon`: 台风信息

**Actions**：
- `setEmergencyState(data)`
- `activatePlan(planId)`
- `advancePlanPhase(newPhase)`
- `setEmergencyVideoChannel(channel)`
- `deployEmergencyDrone()`
- `recallEmergencyDrone()`
- `startVideoConference(participantIds)`
- `endVideoConference()`

---

### 5. analysisStore.ts（分析模式）
**职责**：分析模式的所有数据和逻辑

**状态**：
- `analysisState`: 分析模式完整状态
  - `filters`: 筛选条件
  - `events`: 历史事件列表
  - `strategyRecords`: 策略记录
  - `selectedEventId`: 选中的事件 ID
  - `activeView`: 当前视图
  - `activeQuickFilter`: 快速筛选

**Actions**：
- `setAnalysisFilters(filters)`
- `selectAnalysisEvent(eventId)`
- `setAnalysisView(view)`
- `setAnalysisQuickFilter(filter)`

---

### 6. portStore.ts（港口模式）
**职责**：港口模式的所有数据和逻辑（目前未实现，预留）

**状态**：
- TBD

**Actions**：
- TBD

---

## 迁移步骤

### Phase 1: 创建新 Store 文件
1. 创建 `src/stores/` 目录
2. 创建 6 个新 Store 文件
3. 从 `dashboardStore.ts` 复制类型定义到各自文件

### Phase 2: 拆分状态和 Actions
1. 将 `dashboardStore.ts` 中的状态按模式分配到各 Store
2. 将 Actions 分配到各 Store
3. 保留 `dashboardStore.ts` 作为兼容层（re-export）

### Phase 3: 更新组件引用
1. 更新所有组件的 import 语句
2. 从 `useDashboardStore` 改为 `useOverviewStore`、`useCommandStore` 等
3. 逐个模式迁移，确保每个模式迁移后功能正常

### Phase 4: 清理
1. 删除 `dashboardStore.ts` 兼容层
2. 更新 `src/stores/index.ts` 统一导出

---

## 优势

1. **职责清晰**：每个 Store 只管理一个模式的状态
2. **易于维护**：单个文件 200-400 行，易于理解和修改
3. **性能优化**：组件只订阅需要的 Store，减少不必要的重渲染
4. **类型安全**：每个 Store 有独立的类型定义，避免类型污染
5. **并行开发**：不同模式可以独立开发，减少冲突

---

## 风险

1. **迁移工作量大**：需要更新所有组件的引用
2. **跨模式状态共享**：需要设计跨 Store 通信机制（如 `uiStore` 作为中介）
3. **测试覆盖**：需要确保迁移后功能完整性

---

## 建议

**先做 Phase 1-2**，创建新 Store 并拆分状态，保留 `dashboardStore.ts` 作为兼容层，确保现有功能不受影响。然后逐个模式迁移组件引用（Phase 3），最后清理（Phase 4）。
