# 指挥模式 V4.0 第二批 — 视频面板 + 无人机调度 设计文档

> 日期：2026-04-16
> 状态：已确认

---

## 一、功能概述

将 MapVideoDock 从静态占位符重写为可交互的视频面板，支持 5 路摄像头切换、无人机派出/召回、视频全屏查看。

## 二、MapVideoDock 重写

### 2.1 布局结构

保持右下角 260px 宽停靠面板，位于 `CommandMap` 内部 `position: absolute; right: 16; bottom: 16`。

内部三层结构（从上到下）：

1. **标题栏**（~28px）：当前摄像头名称 + 在线状态指示灯（绿色圆点）
2. **主视频区**（~110px）：Mock 深色背景 + HUD 叠加信息（摄像头编号、时间戳、REC 标记）
3. **底部区域**（~60px）：
   - 缩略图条：5 路摄像头小卡片（每个约 48x36px），横向排列，当前选中项 `border: 1px solid #00D0E9`
   - 操作按钮行：全屏 + 派出无人机/召回无人机

### 2.2 摄像头 Mock 数据

```typescript
const CAMERAS = [
  { id: 'cam-01', name: '城区路口', position: [110.160745, 20.306732] },
  { id: 'cam-02', name: '华四村', position: [110.157380, 20.291170] },
  { id: 'cam-03', name: '高速入口', position: [110.153524, 20.278910] },
  { id: 'cam-04', name: '南山上村', position: [110.147502, 20.250149] },
  { id: 'cam-05', name: '港口入口', position: [110.143228, 20.245138] },
];
```

5 路摄像头与地图上 5 个卡口标记一一对应。

### 2.3 视频画面 Mock

因无真实视频流，用深色背景 + HUD 风格模拟：

- 背景：`rgba(0,0,0,0.8)` + 噪点效果（CSS gradient 模拟）
- 左上角：摄像头编号标签（如 `CAM-02 华四村`），背景 `rgba(0,208,233,0.9)`
- 右上角：`● REC` 标记（红色闪烁）
- 底部：时间戳 + 分辨率信息（`11px, #64748B`）

### 2.4 状态管理

视频通道切换使用组件本地 `useState`：

```typescript
const [channel, setChannel] = useState(0); // 0~4 对应 5 个卡口
```

无人机状态由 store 管理（见第三节）。

### 2.5 样式规范

遵循视觉统一后的颜色体系：
- 面板背景：`rgba(10,15,25,0.92)`
- 边框：`1px solid rgba(0,208,233,0.12)`
- 毛玻璃：`backdrop-filter: blur(10px)`
- 选中缩略图边框：`#00D0E9`
- 未选中缩略图边框：`rgba(255,255,255,0.1)`

## 三、无人机调度

### 3.1 交互流程

一键派出，无二次确认：

1. 用户点击"派出无人机"按钮
2. 调用 store `deployDrone()` action：
   - `dronesAvailable` 减 1
   - `isDroneDeployed` 设为 `true`
   - 向 `commandFeed` 追加系统消息：`"无人机 UAV-01 已派出，前往进港大道巡查"`
3. 视频面板自动切换到无人机视角：
   - 标题变为"无人机 UAV-01 · 巡航中"
   - 画面切换为俯拍 HUD 风格（更暗的背景 + 高度/速度/坐标叠加信息）
   - 缩略图条中追加一个"UAV"缩略图项，高亮选中
4. 按钮变为"召回无人机"（橙色边框样式）

### 3.2 召回流程

1. 用户点击"召回无人机"按钮
2. 调用 store `recallDrone()` action：
   - `dronesAvailable` 加 1
   - `isDroneDeployed` 设为 `false`
   - 向 `commandFeed` 追加系统消息：`"无人机 UAV-01 已召回"`
3. 视频面板切回上一个摄像头
4. 缩略图条中移除"UAV"项
5. 按钮恢复为"派出无人机"

### 3.3 资源限制

当 `dronesAvailable === 0` 时，"派出无人机"按钮置灰禁用，tooltip 提示"无可用无人机"。

### 3.4 地图动画

本期不做地图飞行动画（高德 MoveAnimation 依赖较重），留到后续优化。

## 四、全屏功能

### 4.1 交互

点击"全屏"按钮弹出 Modal，居中显示大尺寸视频画面。

### 4.2 Modal 规格

- 尺寸：800 x 450（16:9 比例）
- 复用项目已有的 Modal 组件（`src/components/Modal.tsx`）
- 内容：放大版的 HUD 视频画面
- 底部：摄像头名称 + 在线状态 + 关闭按钮
- ESC 或点击背景关闭

## 五、Store 扩展

### 5.1 CommandState 新增字段

```typescript
interface CommandState {
  // ... 现有字段 ...
  activeVideoChannel: number;  // 0-4 对应 5 个卡口
  isDroneDeployed: boolean;    // 无人机是否已派出
}
```

初始值：`activeVideoChannel: 0, isDroneDeployed: false`

### 5.2 新增 Actions

```typescript
deployDrone: () => void;   // 派出无人机
recallDrone: () => void;   // 召回无人机
```

## 六、文件改动清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/components/command/MapVideoDock.tsx` | 重写 | 完整重写为可交互视频面板 |
| `src/store/dashboardStore.ts` | 扩展 | CommandState 新增字段 + deployDrone/recallDrone actions |
| `src/components/command/CommandMap.tsx` | 微调 | 无人机状态传递给 MapVideoDock（如需要） |

## 七、不做的事情

- 真实视频流接入（依赖海康 API，待公安局协调）
- 地图上的无人机飞行动画（留到后续优化）
- 多架无人机同时派出（当前 Mock 只支持 1 架）
- 视频回放功能
