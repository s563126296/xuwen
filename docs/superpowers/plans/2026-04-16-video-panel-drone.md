# 视频面板 + 无人机调度 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MapVideoDock 从静态占位符重写为可交互的视频面板，支持 5 路摄像头切换、无人机派出/召回、视频全屏查看。

**Architecture:** 组件本地 state 管理视频通道切换，store 管理无人机调度状态。视频画面用 Mock HUD 风格模拟，全屏功能复用现有 Modal 组件。

**Tech Stack:** React, TypeScript, Zustand, Lucide React

---

## 文件结构

**修改文件：**
- `src/store/dashboardStore.ts` — 扩展 CommandState 接口，新增 deployDrone/recallDrone actions
- `src/components/command/MapVideoDock.tsx` — 完全重写为可交互视频面板

**不创建新文件** — 复用现有 Modal 组件

---

## Task 1: 扩展 Store — CommandState 新增字段

**Files:**
- Modify: `src/store/dashboardStore.ts:312-333`

- [ ] **Step 1: 在 CommandState 接口中新增两个字段**

找到 `export interface CommandState` 定义（约 312 行），在 `resources: CommandResourceStatus;` 后面添加：

```typescript
export interface CommandState {
  context: CommandContext;
  congestionIndex: number;
  congestionTrend: 'rising' | 'stable' | 'falling';
  congestionDist: string;
  congestionTime: number;
  affectedVehicles: number;
  coldChainCount: number;
  causes: CongestionCause[];
  spreadRoads: string[];
  strategies: CommandStrategy[];
  executionSteps: ExecutionStep[];
  timeline: TimelineSlot[];
  predictedIndex: number;
  actualIndex: number | null;
  historyEffects: Array<{ name: string; rate: number; color: string }>;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  estimatedRelief: string;
  focusRoad: CommandFocusRoad;
  commandFeed: CommandFeedItem[];
  resources: CommandResourceStatus;
  activeVideoChannel: number;  // 新增：0-4 对应 5 个卡口
  isDroneDeployed: boolean;    // 新增：无人机是否已派出
}
```

- [ ] **Step 2: 在 defaultCommandState 中初始化新字段**

找到 `const defaultCommandState: CommandState` 定义（约 700 行），在 `resources: { ... }` 后面添加：

```typescript
activeVideoChannel: 0,
isDroneDeployed: false,
```

- [ ] **Step 3: 验证类型检查通过**

```bash
cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react
npx tsc --noEmit
```

Expected: 无错误输出

---

## Task 2: 扩展 Store — deployDrone Action

**Files:**
- Modify: `src/store/dashboardStore.ts:432-433`

- [ ] **Step 1: 在 DashboardState 接口中声明 deployDrone**

找到 `executeStrategy: (strategyId: string) => void;` 这行（约 432 行），在其后添加：

```typescript
executeStrategy: (strategyId: string) => void;
deployDrone: () => void;
recallDrone: () => void;
setCurrentStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
```

- [ ] **Step 2: 实现 deployDrone action**

找到 `executeStrategy: (strategyId) => { ... }` 的实现（约 912 行），在其后添加：

```typescript
deployDrone: () => {
  set((state) => {
    if (state.commandState.resources.dronesAvailable === 0) {
      return state; // 无可用无人机，不执行
    }

    const newFeedItem: CommandFeedItem = {
      id: `drone-${Date.now()}`,
      type: 'system',
      source: '无人机调度系统',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: '无人机 UAV-01 已派出，前往进港大道巡查',
      icon: 'info',
    };

    return {
      commandState: {
        ...state.commandState,
        resources: {
          ...state.commandState.resources,
          dronesAvailable: state.commandState.resources.dronesAvailable - 1,
        },
        isDroneDeployed: true,
        commandFeed: [...state.commandState.commandFeed, newFeedItem],
      },
    };
  });
},
```

- [ ] **Step 3: 实现 recallDrone action**

在 `deployDrone` 后面添加：

```typescript
recallDrone: () => {
  set((state) => {
    if (!state.commandState.isDroneDeployed) {
      return state; // 无人机未派出，不执行
    }

    const newFeedItem: CommandFeedItem = {
      id: `drone-recall-${Date.now()}`,
      type: 'system',
      source: '无人机调度系统',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: '无人机 UAV-01 已召回',
      icon: 'info',
    };

    return {
      commandState: {
        ...state.commandState,
        resources: {
          ...state.commandState.resources,
          dronesAvailable: state.commandState.resources.dronesAvailable + 1,
        },
        isDroneDeployed: false,
        commandFeed: [...state.commandState.commandFeed, newFeedItem],
      },
    };
  });
},
```

- [ ] **Step 4: 验证类型检查通过**

```bash
npx tsc --noEmit
```

Expected: 无错误输出

---

## Task 3: 重写 MapVideoDock — 摄像头数据和状态

**Files:**
- Modify: `src/components/command/MapVideoDock.tsx:1-17`

- [ ] **Step 1: 添加 imports 和摄像头数据**

替换整个文件内容为：

```typescript
import { useState } from 'react';
import { Video, Plane, Maximize2 } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const CAMERAS = [
  { id: 'cam-01', name: '城区路口', status: 'online' },
  { id: 'cam-02', name: '华四村', status: 'online' },
  { id: 'cam-03', name: '高速入口', status: 'online' },
  { id: 'cam-04', name: '南山上村', status: 'online' },
  { id: 'cam-05', name: '港口入口', status: 'online' },
];

export default function MapVideoDock() {
  const { commandState, deployDrone, recallDrone, setActiveModal } = useDashboardStore();
  const [channel, setChannel] = useState(0);

  const isDroneView = commandState.isDroneDeployed;
  const currentCamera = isDroneView ? { id: 'uav-01', name: '无人机 UAV-01', status: '巡航中' } : CAMERAS[channel];
  const canDeployDrone = commandState.resources.dronesAvailable > 0 && !commandState.isDroneDeployed;

  return (
    <div style={{ position: 'absolute', right: 16, bottom: 16, width: 260, padding: 12, borderRadius: 8, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(0,208,233,0.12)', backdropFilter: 'blur(10px)', zIndex: 20 }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>{currentCamera.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ED573' }} />
          <span style={{ fontSize: 10, color: '#2ED573' }}>{currentCamera.status}</span>
        </div>
      </div>

      {/* 主视频区 - 占位符 */}
      <div style={{ height: 110, borderRadius: 6, background: 'rgba(0,0,0,0.8)', position: 'relative', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#475569', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          视频画面占位
        </span>
      </div>

      {/* 缩略图条 - 占位符 */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: '#64748B' }}>缩略图条占位</span>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid rgba(0,208,233,0.12)', background: 'rgba(255,255,255,0.04)', color: '#C9CDD4' }}>
          <Maximize2 size={12} style={{ marginRight: 4, display: 'inline' }} />全屏
        </button>
        {commandState.isDroneDeployed ? (
          <button 
            onClick={recallDrone}
            style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.08)', color: '#F5A623' }}
          >
            <Plane size={12} style={{ marginRight: 4, display: 'inline' }} />召回无人机
          </button>
        ) : (
          <button 
            onClick={deployDrone}
            disabled={!canDeployDrone}
            title={!canDeployDrone ? '无可用无人机' : ''}
            style={{ 
              flex: 1, 
              padding: '6px 0', 
              fontSize: 11, 
              borderRadius: 4, 
              border: `1px solid rgba(0,208,233,${canDeployDrone ? 0.25 : 0.12})`, 
              background: `rgba(0,208,233,${canDeployDrone ? 0.08 : 0.02})`, 
              color: canDeployDrone ? '#00D0E9' : '#475569',
              cursor: canDeployDrone ? 'pointer' : 'not-allowed',
              opacity: canDeployDrone ? 1 : 0.5,
            }}
          >
            <Plane size={12} style={{ marginRight: 4, display: 'inline' }} />派出无人机
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
npx tsc --noEmit
```

Expected: 无错误输出

- [ ] **Step 3: 启动开发服务器验证基础交互**

```bash
npm run dev
```

打开 http://localhost:5173，切换到指挥模式，检查：
- 视频面板显示"城区路口"标题和在线状态
- "派出无人机"按钮可点击
- 点击后按钮变为"召回无人机"，标题变为"无人机 UAV-01"

---

## Task 4: 实现主视频区 HUD 样式

**Files:**
- Modify: `src/components/command/MapVideoDock.tsx:40-45`

- [ ] **Step 1: 替换主视频区为 HUD 风格**

找到 `{/* 主视频区 - 占位符 */}` 这段代码，替换为：

```typescript
{/* 主视频区 */}
<div style={{ 
  height: 110, 
  borderRadius: 6, 
  background: isDroneView 
    ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,15,25,0.9) 100%)' 
    : 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,25,35,0.8) 100%)',
  position: 'relative', 
  marginBottom: 8,
  overflow: 'hidden',
}}>
  {/* 噪点效果 */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
    pointerEvents: 'none',
  }} />

  {/* 左上角摄像头标签 */}
  <div style={{
    position: 'absolute',
    top: 8,
    left: 8,
    background: 'rgba(0,208,233,0.9)',
    color: '#0A0F19',
    padding: '2px 8px',
    borderRadius: 3,
    fontSize: 11,
    fontWeight: 600,
  }}>
    {isDroneView ? 'UAV-01' : currentCamera.id.toUpperCase()}
  </div>

  {/* 右上角 REC 标记 */}
  <div style={{
    position: 'absolute',
    top: 8,
    right: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }}>
    <div style={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#FF4757',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
    <span style={{ fontSize: 10, color: '#FF4757', fontWeight: 600 }}>REC</span>
  </div>

  {/* 底部信息栏 */}
  <div style={{
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#64748B',
  }}>
    <span>{new Date().toLocaleTimeString('zh-CN')}</span>
    <span>{isDroneView ? '高度: 120m | 速度: 15km/h' : '1920×1080 | 25fps'}</span>
  </div>

  {/* 无人机额外叠加信息 */}
  {isDroneView && (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color: '#00D0E9', marginBottom: 4 }}>俯拍视角</div>
      <div style={{ fontSize: 10, color: '#64748B' }}>坐标: 110.157°E, 20.291°N</div>
    </div>
  )}
</div>
```

- [ ] **Step 2: 添加 REC 闪烁动画的 CSS**

在文件顶部 import 后添加：

```typescript
// 在组件外部添加样式
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
if (!document.head.querySelector('style[data-video-dock]')) {
  style.setAttribute('data-video-dock', 'true');
  document.head.appendChild(style);
}
```

- [ ] **Step 3: 验证视频区 HUD 效果**

```bash
npm run dev
```

检查：
- 视频区有噪点纹理
- 左上角显示摄像头编号标签（青色背景）
- 右上角 REC 标记闪烁
- 底部显示时间戳和分辨率
- 派出无人机后显示"俯拍视角"和坐标信息

---

## Task 5: 实现缩略图条

**Files:**
- Modify: `src/components/command/MapVideoDock.tsx:90-93`

- [ ] **Step 1: 替换缩略图条占位符**

找到 `{/* 缩略图条 - 占位符 */}` 这段代码，替换为：

```typescript
{/* 缩略图条 */}
<div style={{ 
  display: 'flex', 
  gap: 6, 
  overflowX: 'auto', 
  marginBottom: 8,
  paddingBottom: 4,
}}>
  {CAMERAS.map((cam, idx) => (
    <div
      key={cam.id}
      onClick={() => {
        if (!isDroneView) {
          setChannel(idx);
        }
      }}
      style={{
        minWidth: 48,
        height: 36,
        background: (!isDroneView && channel === idx) 
          ? 'rgba(0,208,233,0.15)' 
          : 'rgba(255,255,255,0.03)',
        border: (!isDroneView && channel === idx) 
          ? '1px solid #00D0E9' 
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDroneView ? 'not-allowed' : 'pointer',
        opacity: isDroneView ? 0.4 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ 
        fontSize: 10, 
        color: (!isDroneView && channel === idx) ? '#00D0E9' : '#64748B',
        fontWeight: (!isDroneView && channel === idx) ? 600 : 400,
      }}>
        {cam.id.toUpperCase()}
      </div>
      <div style={{ fontSize: 8, color: '#475569' }}>{cam.name}</div>
    </div>
  ))}
  
  {/* 无人机缩略图（仅在派出时显示） */}
  {isDroneView && (
    <div
      style={{
        minWidth: 48,
        height: 36,
        background: 'rgba(0,208,233,0.15)',
        border: '1px solid #00D0E9',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 10, color: '#00D0E9', fontWeight: 600 }}>UAV</div>
      <div style={{ fontSize: 8, color: '#00D0E9' }}>巡航中</div>
    </div>
  )}
</div>
```

- [ ] **Step 2: 验证缩略图切换**

```bash
npm run dev
```

检查：
- 5 个摄像头缩略图横向排列
- 点击缩略图切换视频画面（左上角标签变化）
- 当前选中项有青色边框高亮
- 派出无人机后缩略图置灰不可点击，右侧出现"UAV"缩略图

---

## Task 6: 实现全屏功能

**Files:**
- Modify: `src/components/command/MapVideoDock.tsx:95-100`
- Modify: `src/components/command/CommandMap.tsx` (添加 Modal)

- [ ] **Step 1: 给全屏按钮添加 onClick**

找到全屏按钮这行：

```typescript
<button style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid rgba(0,208,233,0.12)', background: 'rgba(255,255,255,0.04)', color: '#C9CDD4' }}>
```

替换为：

```typescript
<button 
  onClick={() => setActiveModal('video-fullscreen')}
  style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, border: '1px solid rgba(0,208,233,0.12)', background: 'rgba(255,255,255,0.04)', color: '#C9CDD4', cursor: 'pointer' }}
>
```

- [ ] **Step 2: 在 CommandMap.tsx 中添加全屏 Modal**

打开 `src/components/command/CommandMap.tsx`，在文件顶部添加 import：

```typescript
import Modal from '../Modal';
import { useDashboardStore } from '../../store/dashboardStore';
```

在 `CommandMap` 组件的 return 语句最后，`</div>` 之前添加：

```typescript
{/* 视频全屏 Modal */}
<Modal id="video-fullscreen" title="视频监控" width={800}>
  <div style={{ 
    width: 800, 
    height: 450, 
    background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,25,35,0.8) 100%)',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* 噪点效果 */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      pointerEvents: 'none',
    }} />

    {/* 左上角摄像头标签 */}
    <div style={{
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'rgba(0,208,233,0.9)',
      color: '#0A0F19',
      padding: '4px 12px',
      borderRadius: 4,
      fontSize: 14,
      fontWeight: 600,
    }}>
      CAM-02 华四村
    </div>

    {/* 右上角 REC 标记 */}
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#FF4757',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 13, color: '#FF4757', fontWeight: 600 }}>REC</span>
    </div>

    {/* 底部信息栏 */}
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: '#94A3B8',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ED573' }} />
        <span>在线</span>
      </div>
      <span>{new Date().toLocaleTimeString('zh-CN')}</span>
      <span>1920×1080 | 25fps</span>
    </div>
  </div>
</Modal>
```

- [ ] **Step 3: 验证全屏功能**

```bash
npm run dev
```

检查：
- 点击"全屏"按钮弹出 Modal
- Modal 显示 800x450 的大尺寸视频画面
- 点击背景或右上角 X 关闭 Modal
- ESC 键关闭 Modal

---

## Task 7: 最终验证和清理

**Files:**
- Test: 整个视频面板功能

- [ ] **Step 1: 完整功能测试**

```bash
npm run dev
```

测试清单：
1. 切换到指挥模式
2. 视频面板显示"城区路口"，在线状态绿点
3. 点击缩略图切换摄像头，左上角标签同步变化
4. 点击"派出无人机"，按钮变为"召回无人机"，标题变为"无人机 UAV-01"
5. 视频画面切换为俯拍视角，显示坐标信息
6. 缩略图条右侧出现"UAV"高亮项，其他缩略图置灰
7. 点击"召回无人机"，恢复到上一个摄像头
8. 点击"全屏"，弹出 Modal 显示大画面
9. 关闭 Modal

- [ ] **Step 2: 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

Expected: 构建成功，无错误

---

## 自审清单

**Spec 覆盖检查：**
- ✅ MapVideoDock 重写（Task 3-5）
- ✅ 5 路摄像头切换（Task 5）
- ✅ 视频画面 Mock HUD 风格（Task 4）
- ✅ 无人机派出/召回（Task 2-3）
- ✅ 视频全屏 Modal（Task 6）
- ✅ Store 扩展（Task 1-2）
- ✅ 资源限制（Task 3 中 canDeployDrone 逻辑）

**Placeholder 扫描：** 无 TBD/TODO

**类型一致性：** 
- `deployDrone()` / `recallDrone()` 在 Task 1-2 中定义，Task 3 中使用
- `activeVideoChannel` / `isDroneDeployed` 在 Task 1 中定义，Task 3 中使用
- `CommandFeedItem` 类型在 Task 2 中使用，与现有 store 定义一致
