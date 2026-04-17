# 徐闻县智慧交通大屏系统 — 项目进度

> 最后更新：2026-04-17

---

## 当前状态：指挥模式 V4.0 第三批主体完成，应急模式 Phase 1 MVP 完成

---

## 一、已完成工作

### 总览模式（V2.1 ✅）

- 双核 15 指标体系（港口交通 5 + 县城交通 5 + 共享底座 5）
- GIS 模拟地图（道路网络 + 车辆仿真 + 无人机 + 信号灯 + 船舶动画）
- AI 态势研判面板（折叠/展开三栏布局 + 操作按钮切换模式）
- 设备详情弹窗（6 种类型分类展示）
- 琼州海峡通行指数（风力/能见度/通航状态）
- 节假日模式（五一黄金周 Mock）
- P0 UI 修复（字号提升 + 对比度 + 缩放 + aria 属性）
- V2.1 优化（左右面板均衡 + 头部天气 + 韧性说明弹窗 + 设备筛选/动画/离线高亮）

### 指挥模式（V4.0 第三批主体功能 🟢）

**V1→V3 迭代历程：**
- V1：简单三栏布局，数据硬编码
- V2：Store 数据流打通 + 归因引擎 + 策略推荐引擎 + 效果预测曲线
- V3：6 步决策链 Tab 架构 → 用户反馈"不像指挥中枢"
- V4：重新设计为"地图主屏 + 策略栏 + 通信面板"

**V4.0 第一批已完成（2026-04-16）：**
- 布局：地图主屏（70%）+ 右侧策略栏（300px）+ 底部通信面板（动态高度）
- CommandSummaryBar / StrategyCommandPanel / CommandCommPanel / MapVideoDock
- Store + 归因引擎 + 视觉统一 + V3 遗留组件清理

**V4.0 第二批已完成（2026-04-16~17）：**
- ✅ 视频面板增强（扫描线 + 网格 + AI 检测框 + 无人机俯拍 HUD）
- ✅ 无人机调度（派出/召回 + 地图飞行动画 + 四旋翼图标 + 华四村→港口入口巡逻）
- ✅ 策略执行消息流（4 条消息自动追加 + step 字段关联流程条）
- ✅ 策略执行流程条（StrategyFlowBar，4 步横向 + 点击定位消息）
- ✅ 右侧策略工作台重构（当前策略卡片 + 备选策略 + 自定义入口）
- ✅ 策略执行确认弹窗（StrategyConfirmModal）
- ✅ 动态布局（底部面板高度自适应）

**V4.0 调度交互体系已完成（2026-04-17）：**
- ✅ 地图人员标注（PersonMarker，3 个 Mock 人员，按部门分组）
- ✅ 人员操作弹窗（点击人员 → 视频通话 / 发送消息）
- ✅ 来电弹窗（IncomingCallModal，自动检测 phone 消息 + 来电铃声）
- ✅ 独立视频通话窗口（VideoCallWindow，红色 HUD，可最小化）
- ✅ 聊天浮窗（ChatWindow，群组 + 私聊 + 快捷回复 + 主动发起通话）
- ✅ 地图→聊天联动（openChatWith，点击人员自动打开私聊）
- ✅ 照片查看弹窗（PhotoViewerModal）
- ✅ 策略卡片条件动作（接听来电 / 查看照片，仅在有事件时显示）
- ✅ 策略执行自动联动视频源（setActiveVideoChannel）
- ✅ 拥堵态势详情弹窗（CongestionDetailModal，点击左上角卡片打开）

**V4.0 地图视觉增强已完成（2026-04-17）：**
- ✅ 拥堵热力渐变（6 段，绿→橙→红→深红，宽度 4→14px + 光晕）
- ✅ 车流粒子动画（6 个青色光点，速度随拥堵程度变化）
- ✅ 执行中路段脉冲（S376 分流线透明度脉冲 + 进港大道青色描边脉冲）
- ✅ 无人机飞行动画（四旋翼图标 + 华四村→港口入口往返巡逻）

**V4.0 第三批主体功能已完成（2026-04-17）：**
- ✅ 策略达标退出（拥堵指数 ≤ 3.0 时摘要条变绿 + [返回总览模式] 按钮）
- ✅ 效果未达标提示（达标率计算 + 橙色警告 + [查看追加方案] 入口）
- ✅ 指挥处置报告（CommandReportModal，基本信息 + 拥堵概况 + 策略列表 + 关键节点 + 效果评价）
- ✅ 事件升级到应急模式（EscalateConfirmModal，多条件触发 + 红色脉冲按钮 + 确认弹窗）

**V4.0 细节打磨已完成（2026-04-17）：**
- ✅ Web Audio API 音效（来电铃声 + 按钮咔哒 + 消息叮咚）
- ✅ 按钮微交互（scale 缩放 + cubic-bezier 缓动）
- ✅ 弹窗入场动画（滑入 + 淡入 + 弹性曲线）

**V4.0 文案与交互打磨已完成（2026-04-17）：**
- ✅ PRD 文案同步到界面（摘要条归因信息、策略卡片触发条件、通信时间线类型标签）
- ✅ 用户故事表达补齐（归因置信度、预计缓解时间、策略生效时间、流程步骤耗时）
- ✅ 地图交互微调（人员标注点击动画+选中光晕、弹窗淡入+边界检测、无人机轨迹线+旋转）
- ✅ 数据结构预留（StrategyConflict 类型、FieldPerson 轨迹字段、triggerCondition 字段）

**V4.0 待完善：**
- [ ] 策略冲突检测（PRD H2-04，互斥/约束/联动规则）
- [ ] 人员聚类（PRD E3-03，缩放较小时按部门聚类）
- [ ] 人员移动轨迹线（PRD E3-06，移动中人员显示虚线路径）
- [ ] 执行资源面板（PRD E4-01~04，当前策略关联的人员/物资展示）
- [ ] 高德地图深色主题优化（当前用遮罩层模拟，需要调试样式权限）

### 设计文档

| 文档 | 路径 |
| ---- | ---- |
| V4.0 设计方案 | `docs/superpowers/specs/2025-01-19-command-mode-v4-design.md` |
| V4.0 实施计划 | `docs/superpowers/plans/2025-01-19-command-mode-v4-phase1.md` |
| 视觉草图 | `docs/mockup/command-v4.html` |
| 指标体系设计 | `doc/modes/03-command/指挥模式-指标体系设计.md` |
| 用户故事体验稿 | `doc/modes/03-command/指挥模式用户故事体验稿.md` |
| 策略执行细则 | `doc/modes/03-command/策略执行细则.md` |
| PRD-指挥模式（已更新） | `doc/modes/03-command/PRD-指挥模式.md` |
| 视频面板+无人机设计 | `docs/superpowers/specs/2026-04-16-video-panel-drone-design.md` |
| 视频面板实施计划 | `docs/superpowers/plans/2026-04-16-video-panel-drone.md` |
| 策略工作流重设计 | `docs/superpowers/specs/2026-04-16-strategy-workflow-redesign.md` |
| 调度交互体系设计 | `docs/superpowers/specs/2026-04-17-command-dispatch-system-design.md` |
| 设计 vs 需求对照 | `docs/superpowers/specs/2026-04-17-design-vs-requirements-mapping.md` |

---

### Git 仓库

**已完成（2026-04-17）：**
- ✅ Git 仓库初始化（main 分支）
- ✅ .gitignore 配置（忽略 node_modules、dist、.DS_Store、对话记录等）
- ✅ 首次提交（commit 4dcdcb6）

---

## 二、待办事项

### P0 — 指挥模式

- [x] 视觉统一 ✅ 已完成（2026-04-16）
- [x] 清理 V3.0 遗留组件 ✅ 已完成（2026-04-16）
- [x] 第二批核心：视频面板 + 无人机 + 策略工作台 + 流程条 + 确认弹窗 ✅ 已完成（2026-04-16）
- [x] 第二批剩余：聊天窗口 + 视频通话 + 照片查看 + 地图视觉增强 ✅ 已完成（2026-04-17）
- [x] 第三批主体：策略退出 + 指挥报告 + 事件升级 ✅ 已完成（2026-04-17）
- [x] 调度交互体系：地图人员 + 来电弹窗 + 聊天浮窗 + 条件动作 ✅ 已完成（2026-04-17）
- [x] 细节打磨：音效 + 微交互 + 入场动画 ✅ 已完成（2026-04-17）
- [ ] 待完善：策略冲突检测 + 人员聚类 + 移动轨迹线 + 执行资源面板 + 地图深色主题

### P1 — 总览模式待优化

- [ ] AI 摘要条规则引擎（当前静态 mock）
- [ ] 设备详情弹窗按具体设备显示数据（当前固定 mock）
- [ ] 骨架屏加载状态

### 应急模式（Phase 1-5 ✅ 2026-04-17）

**Phase 1-3 已完成（2026-04-17 上午）：**
- ✅ Emergency Store + Engine（emergencyEngine.ts：响应等级、阶段判定、物资估算、时间轴生成）
- ✅ 10 个 UI 组件：
  - EmergencyMode.tsx — 主布局容器（三栏 + 横幅 + 时间轴）
  - EmergencyBanner.tsx — 顶部红色预警横幅（停航状态 + 响应等级 + 阶段 + 台风气象信息）
  - EmergencyForecastPanel.tsx — 左栏：滞留预测（A 模块 + 迷你趋势图）
  - SpecialVehiclePanel.tsx — 左栏：特殊车辆追踪（B 模块 + 冷链倒计时）
  - SupplyDemandPanel.tsx — 左栏：物资需求估算（C 模块 + 调拨按钮）
  - EmergencyMap.tsx — 中央：应急资源部署地图（D 模块 + 台风路径动画 + 无人机巡逻路线）
  - EmergencyTaskBoard.tsx — 右栏：跨部门任务板（F 模块 + 状态流转）
  - EmergencyPlanPanel.tsx — 右栏：应急预案（G 模块基础版）
  - EmergencyCommPanel.tsx — 右栏：通信记录（H 模块 + 实时输入）
  - EmergencyTimeline.tsx — 底部：滞留趋势时间轴（I 模块）
- ✅ 阶段自动切换（5 阶段状态机 + 横幅/任务板联动）
- ✅ 任务板交互（确认接收、进度更新、新增任务）
- ✅ 地图深色主题 + 台风实时气象信息
- ✅ App.tsx 集成（emergency 模式路由）

**Phase 4-5 已完成（2026-04-17 下午）：**
- ✅ EmergencySimulator.tsx — 后台模拟器（滞留增长、台风移动、阶段推进、任务自动生成）
- ✅ 声音告警（新通信/任务状态变更提示音）
- ✅ 应急模式切换动画优化（红色闪烁 + 淡入）
- ✅ 应急报告弹窗（事件概况、滞留统计、物资保障、任务执行、关键时间节点）
- ✅ 物资调拨功能（点击"调拨"按钮增加库存 + 自动记录通信）
- ✅ 滞留趋势图（预测面板底部 sparkline 图表）
- ✅ 冷链倒计时（特殊车辆面板显示已滞留时长，颜色动态变化）
- ✅ 地图增强（停车区使用率动态计算 + 无人机巡查路线）
- ✅ 台风路径动画（历史轨迹 + 预测路径 + 台风图标实时移动）
- ✅ 布局优化（左右栏 flex 比例分配，防止溢出）
- ✅ 地图 InfoWindow 关闭按钮修复

**Phase 6 已完成（2026-04-17 晚上）：**
- ✅ 竞品调研分析（应急指挥系统核心功能缺口识别）
- ✅ 预案数字化执行系统（P0 级核心功能）：
  - 数据层：6 个预案完整定义（台风停航 18 步骤、大雾停航、春运高峰、重大事故、极端滞留、跨部门联动）
  - Store：PlanId, PlanStep, EmergencyPlan, ActivePlanExecution 类型定义
  - Store Actions：activatePlan（启动预案 → 自动生成当前阶段任务）、advancePlanPhase（阶段推进 → 追加新任务）
  - Engine：generateTasksFromPlan（预案步骤 → 任务板任务转换）
  - EmergencyPlanPanel 重写：未启动状态（"选择预案"按钮）+ 执行状态（预案名称 + 5 段阶段进度条 + 任务完成率 + 操作按钮）
  - EmergencyPlanLibraryModal：6 个预案卡片（2 列 3 行），点击"启动预案"自动生成任务
  - EmergencyPlanDetailModal：5 个阶段 Tab + 步骤列表（部门标签、负责人、时限、完成标准、任务状态）
  - 预案与任务板联动：启动预案 → 自动生成该阶段任务 → 阶段推进 → 追加新任务

**Phase 7 待做（融合通信 P0）：**
- [ ] 即时通讯系统（@人、群组、指令下达、消息留痕）
- [ ] 应急队伍管理（值班人员、联动单位通讯录、快速联系）
- [ ] 通信面板增强（消息分类、@提醒、已读未读、紧急消息置顶）
- [ ] 指令下达与确认（指挥员发指令 → 部门确认接收 → 执行反馈）

**Phase 8 待做（资源调度闭环 P0）：**
- [ ] 资源调度面板（人员/车辆/设备实时状态）
- [ ] 任务派发与反馈（派发 → 确认 → 到场 → 完成）
- [ ] 地图资源点位实时状态更新
- [ ] 特殊车辆明细追踪（冷链车告警规则、危化品车监控、地图标注）

**Phase 9 待做（视频会商 P1）：**
- [ ] 视频会商面板（多方视频会议）
- [ ] 现场视频回传（无人机/执法记录仪）
- [ ] 视频画中画（地图 + 视频同屏）

**Phase 10 待做（其他增强）：**
- [ ] 客流预测预警（基于历史数据 + 实时数据）
- [ ] 气象联动自动触发预案（台风预警 → 自动启动预案）
- [ ] 旅客信息发布（通知、媒体通报、官方渠道一键发布）
- [ ] 事件日志导出
- [ ] 与指挥模式衔接（复航消化期自动切换）

### P2 — 其他模式

- [ ] 应急模式 Phase 2（策略优化 + 数据对接）
- [ ] 港口模式 / 分析模式

### P3 — 外部数据对接

- [ ] 海康视频流（待公安局协调）
- [ ] 港口闸机 API（待港口方配合）
- [ ] 气象 API（和风天气）
- [ ] 信号灯配时系统
- [ ] 高德地图 Key：指挥模式 d68ecc01797b67df1d265f2aa29ebc87 / 总览模式 988acd5b2cac04c94920a79ee3c54231
- [ ] Git 仓库初始化

---

## 三、已知问题

1. SVG 模拟地图折叠面板后只拉伸不显示更多内容（接入高德后解决）
2. 高德地图深色主题样式未生效（当前用 CSS 遮罩层模拟，需调试 API Key 样式权限）

---

## 四、用户故事与 PRD 覆盖度

详见 `docs/superpowers/specs/2026-04-17-design-vs-requirements-mapping.md`

- 用户故事 6 步决策链：100% 覆盖
- 用户故事人员互动场景：100% 覆盖（地图人员 + 聊天 + 通话）
- PRD 地图功能（D 模块）：80% 覆盖（D-05~D-10 用 Mock 数据）
- PRD 视频功能（E 模块）：100% 覆盖（含通话模式）
- PRD 执行跟踪（H 模块）：100% 覆盖（含流程留痕 + 报告 + 升级）
- PRD 通信系统（E2 模块）：100% 覆盖（群聊 + 私聊 + 快捷回复）
- PRD 人员标注（E3 模块）：80% 覆盖（缺聚类和轨迹线）
- PRD 资源展示（E4 模块）：未实现（留到后续）

---

## 五、项目文件结构

```text
src/components/
├── overview/           # 总览模式（16 个组件）
├── command/            # 指挥模式 V4.0（17 个组件）
│   ├── CommandMode.tsx           # 布局容器（动态高度）
│   ├── CommandSummaryBar.tsx     # 指挥摘要条（达标退出 + 升级入口）
│   ├── StrategyCommandPanel.tsx  # 右侧策略工作台（状态提示 + 条件动作）
│   ├── StrategyFlowBar.tsx       # 策略执行流程条（4步 + 消息关联）
│   ├── StrategyConfirmModal.tsx  # 策略执行确认弹窗
│   ├── CommandCommPanel.tsx      # 底部通信时间线（动态高度 + 流程条）
│   ├── CommandMap.tsx            # 高德地图（人员标注 + 热力渐变 + 粒子 + 脉冲 + 无人机）
│   ├── MapVideoDock.tsx          # 视频面板（5路摄像头 + 无人机 + HUD）
│   ├── PersonMarker.tsx          # 地图人员标记
│   ├── IncomingCallModal.tsx     # 来电弹窗（音效 + 入场动画）
│   ├── VideoCallWindow.tsx       # 独立视频通话窗口（红色 HUD）
│   ├── ChatWindow.tsx            # 聊天浮窗（群组 + 私聊 + 快捷回复）
│   ├── PhotoViewerModal.tsx      # 照片查看弹窗
│   ├── CongestionDetailModal.tsx # 拥堵态势详情弹窗
│   ├── CommandReportModal.tsx    # 指挥处置报告弹窗
│   ├── EscalateConfirmModal.tsx  # 事件升级确认弹窗
│   └── PredictionCurveChart.tsx  # 效果预测曲线（Recharts）
├── Header.tsx, Modal.tsx, ModeSwitcher.tsx ...
src/store/dashboardStore.ts       # Zustand 状态管理
src/utils/commandEngine.ts        # 归因引擎 + 策略推荐引擎
src/utils/soundEffects.ts         # Web Audio API 音效
```
