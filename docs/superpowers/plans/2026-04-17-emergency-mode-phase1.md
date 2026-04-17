# Emergency Mode Phase 1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建应急模式 Phase 1 MVP，包括红色预警横幅、三栏布局、滞留预测面板、应急资源地图、基础任务板和底部滞留趋势时间轴。

**Architecture:** 复用现有 overview/command 模式的页面结构和 Zustand store 模式，在 `systemMode === 'emergency'` 时渲染新的 `EmergencyMode` 容器。Phase 1 只实现 PRD 中最核心的可视化和状态表达，数据全部使用 mock state，先打通布局、模式切换和基础交互，不接真实外部接口。

**Tech Stack:** React 18 + TypeScript + Zustand + Recharts + 高德地图 JS API

---

## 文件结构

| 文件 | 改动类型 | 职责 |
|------|----------|------|
| `src/store/dashboardStore.ts` | Modify | 新增 EmergencyMode 的类型、mock 数据、状态和切换逻辑 |
| `src/App.tsx` | Modify | 在主渲染流程中接入 `systemMode === 'emergency'` |
| `src/components/emergency/EmergencyMode.tsx` | Create | 应急模式总容器，负责布局和子模块编排 |
| `src/components/emergency/EmergencyBanner.tsx` | Create | 顶部红色预警横幅（停航状态 / 预警等级 / 预测数据） |
| `src/components/emergency/EmergencyForecastPanel.tsx` | Create | 左栏上部：滞留预测（A 模块） |
| `src/components/emergency/SpecialVehiclePanel.tsx` | Create | 左栏中部：特殊车辆汇总（B 模块简化版） |
| `src/components/emergency/SupplyDemandPanel.tsx` | Create | 左栏下部：物资需求估算（C 模块简化版） |
| `src/components/emergency/EmergencyMap.tsx` | Create | 中央应急资源部署地图（D 模块基础版） |
| `src/components/emergency/EmergencyTaskBoard.tsx` | Create | 右栏上部：跨部门任务板（F 模块基础版） |
| `src/components/emergency/EmergencyPlanPanel.tsx` | Create | 右栏中部：应急预案与响应等级（G 模块基础版） |
| `src/components/emergency/EmergencyCommPanel.tsx` | Create | 右栏下部：通信记录（H 模块基础版） |
| `src/components/emergency/EmergencyTimeline.tsx` | Create | 底部滞留趋势时间轴（I 模块基础版） |
| `src/utils/emergencyEngine.ts` | Create | 轻量计算函数：响应等级、阶段、物资需求、预测曲线 |

---

### Task 1: Emergency Store 基础状态

**Files:**
- Modify: `src/store/dashboardStore.ts`
- Create: `src/utils/emergencyEngine.ts`

- [ ] **Step 1: 在 store 中新增 Emergency 类型定义**

在 `src/store/dashboardStore.ts` 的 command mode 类型定义后面新增以下类型：

```typescript
export type EmergencyLevel = 'IV' | 'III' | 'II' | 'I';
export type EmergencyPhase = 'warning' | 'shutdown_start' | 'peak' | 'recovery_prepare' | 'recovery';

export interface EmergencyForecast {
  currentStrandedVehicles: number;
  peakStrandedVehicles: number;
  strandedGrowthPerHour: number;
  estimatedResumeTime: string;
  estimatedRecoveryHours: number;
  estimatedShutdownHours: number;
  coldChainVehicles: number;
  hazardousVehicles: number;
  strandedPhase: EmergencyPhase;
}

export interface EmergencyTask {
  id: string;
  department: '公安交警' | '民政局' | '交通运输局' | '港口管理方' | '城管局' | '应急管理局';
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'received' | 'executing' | 'done';
  owner: string;
  updatedAt: string;
}

export interface EmergencyResourcePoint {
  id: string;
  type: 'parking' | 'supply' | 'personnel' | 'drone' | 'fuel';
  name: string;
  position: [number, number];
  status: 'normal' | 'warning' | 'critical';
  detail: string;
}

export interface EmergencyTimelinePoint {
  time: string;
  value: number;
  isPredicted?: boolean;
  isCurrent?: boolean;
}

export interface EmergencyCommItem {
  id: string;
  type: 'system' | 'department' | 'port' | 'alert';
  source: string;
  time: string;
  content: string;
  urgent?: boolean;
}

export interface EmergencyState {
  portShutdown: boolean;
  shutdownStartTime: string;
  emergencyLevel: EmergencyLevel;
  bannerTitle: string;
  bannerSubtitle: string;
  phaseLabel: string;
  forecast: EmergencyForecast;
  tasks: EmergencyTask[];
  resourcePoints: EmergencyResourcePoint[];
  timeline: EmergencyTimelinePoint[];
  communications: EmergencyCommItem[];
}
```

- [ ] **Step 2: 在 DashboardState 中新增 emergencyState 和 setEmergencyState**

在 `DashboardState` interface 中，command mode state 段落后面新增：

```typescript
  emergencyState: EmergencyState;
  setEmergencyState: (data: Partial<EmergencyState>) => void;
```

- [ ] **Step 3: 创建 emergencyEngine.ts 轻量计算函数**

创建 `src/utils/emergencyEngine.ts`，写入以下最小实现：

```typescript
import type { EmergencyForecast, EmergencyLevel, EmergencyPhase, EmergencyTimelinePoint } from '../store/dashboardStore';

export function getEmergencyLevel(peakVehicles: number, shutdownHours: number): EmergencyLevel {
  if (peakVehicles > 3000 || shutdownHours > 72) return 'I';
  if (peakVehicles > 1500 || shutdownHours > 24) return 'II';
  if (peakVehicles > 500 || shutdownHours > 6) return 'III';
  return 'IV';
}

export function getEmergencyPhase(portShutdown: boolean, current: number, peak: number, recovered: boolean): EmergencyPhase {
  if (!portShutdown) return 'warning';
  if (recovered) return 'recovery';
  if (current < peak * 0.5) return 'shutdown_start';
  return 'peak';
}

export function buildEmergencyTimeline(current: number, peak: number): EmergencyTimelinePoint[] {
  return [
    { time: '12:00', value: Math.round(current * 0.15) },
    { time: '13:00', value: Math.round(current * 0.35) },
    { time: '14:00', value: Math.round(current * 0.6) },
    { time: '15:00', value: current, isCurrent: true },
    { time: '16:00', value: Math.round((current + peak) / 2), isPredicted: true },
    { time: '18:00', value: peak, isPredicted: true },
    { time: '22:00', value: Math.round(peak * 0.92), isPredicted: true },
    { time: '次日08:00', value: Math.round(peak * 0.75), isPredicted: true },
  ];
}

export function estimateSupplyDemand(strandedVehicles: number) {
  const strandedPeople = Math.round(strandedVehicles * 2);
  const boxedMeals = Math.round(strandedPeople * 3 * 1.2);
  const waterBoxes = Math.round((strandedPeople * 3 * 1.2) / 10);
  return { strandedPeople, boxedMeals, waterBoxes };
}
```

- [ ] **Step 4: 在 store 中新增 defaultEmergencyState mock 数据**

在 `src/store/dashboardStore.ts` 中，紧接 `defaultCommandState` 之后添加：

```typescript
const defaultEmergencyState: EmergencyState = {
  portShutdown: true,
  shutdownStartTime: '14:30',
  emergencyLevel: 'II',
  bannerTitle: '台风“摩羯”橙色预警 · 徐闻港已停航',
  bannerSubtitle: '预计停航 48 小时 · 预计峰值滞留 3200 辆 · 冷链车约 180 辆',
  phaseLabel: '阶段2：停航初期',
  forecast: {
    currentStrandedVehicles: 1960,
    peakStrandedVehicles: 3200,
    strandedGrowthPerHour: 180,
    estimatedResumeTime: '后天 10:00',
    estimatedRecoveryHours: 6,
    estimatedShutdownHours: 48,
    coldChainVehicles: 157,
    hazardousVehicles: 24,
    strandedPhase: 'shutdown_start',
  },
  tasks: [
    { id: 'em-task-1', department: '公安交警', title: '部署 6 组交警至进港大道', priority: 'high', status: 'executing', owner: '王队', updatedAt: '15:02' },
    { id: 'em-task-2', department: '交通运输局', title: '启用 P-1 / P-2 临时停车区', priority: 'high', status: 'received', owner: '李科', updatedAt: '14:58' },
    { id: 'em-task-3', department: '民政局', title: '准备首批 5000 份盒饭和 800 箱水', priority: 'medium', status: 'pending', owner: '张主任', updatedAt: '15:05' },
    { id: 'em-task-4', department: '港口管理方', title: '确认预计复航窗口并回传', priority: 'high', status: 'received', owner: '港调中心', updatedAt: '15:08' },
  ],
  resourcePoints: [
    { id: 'p1', type: 'parking', name: 'P-1 港口周边停车区', position: [110.1465, 20.243], status: 'warning', detail: '容量 350 辆 · 当前使用率 82%' },
    { id: 'p2', type: 'parking', name: 'P-2 S376 交叉口停车区', position: [110.158, 20.289], status: 'normal', detail: '容量 280 辆 · 当前使用率 46%' },
    { id: 's1', type: 'supply', name: '盒饭/饮水发放点', position: [110.1505, 20.263], status: 'normal', detail: '盒饭 3200 份 · 饮水 600 箱' },
    { id: 'g1', type: 'personnel', name: '交警临时指挥点', position: [110.1538, 20.279], status: 'normal', detail: '交警 12 人在岗' },
    { id: 'd1', type: 'drone', name: '无人机巡查点', position: [110.1574, 20.2911], status: 'normal', detail: '无人机 1 架巡逻中' },
  ],
  timeline: [],
  communications: [
    { id: 'ec-1', type: 'system', source: '系统', time: '14:30', content: '收到港口停航通知，自动切换应急模式', urgent: true },
    { id: 'ec-2', type: 'port', source: '港口管理方', time: '14:36', content: '预计停航 48 小时，复航时间待气象确认' },
    { id: 'ec-3', type: 'department', source: '公安交警', time: '15:02', content: '首批交警已到进港大道执勤点位' },
  ],
};
```

- [ ] **Step 5: 用 emergencyEngine 计算 timeline 和等级**

在 store 初始化部分，给 `emergencyState` 赋值时使用：

```typescript
import { getEmergencyLevel, buildEmergencyTimeline } from '../utils/emergencyEngine';
```

并在 `create(...)` 返回对象中写入：

```typescript
  emergencyState: {
    ...defaultEmergencyState,
    emergencyLevel: getEmergencyLevel(
      defaultEmergencyState.forecast.peakStrandedVehicles,
      defaultEmergencyState.forecast.estimatedShutdownHours,
    ),
    timeline: buildEmergencyTimeline(
      defaultEmergencyState.forecast.currentStrandedVehicles,
      defaultEmergencyState.forecast.peakStrandedVehicles,
    ),
  },
  setEmergencyState: (data) => set((state) => ({
    emergencyState: { ...state.emergencyState, ...data },
  })),
```

- [ ] **Step 6: 写失败测试（如果项目没有测试基础设施则先记录并跳过）**

检查项目是否已有 Vitest 配置；若无，则本任务记录“Phase 1 不新增测试框架，先用 TypeScript 编译 + 浏览器验收作为验证”，不要擅自安装依赖。

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && ls vitest.config.*`
Expected: 若无文件，则记录“无测试基础设施，跳过自动化测试”

- [ ] **Step 7: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 8: Commit**

```bash
git add src/store/dashboardStore.ts src/utils/emergencyEngine.ts
git commit -m "feat(emergency): add emergency state and engine"
```

---

### Task 2: EmergencyMode 主布局接入

**Files:**
- Create: `src/components/emergency/EmergencyMode.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 EmergencyMode 容器**

创建 `src/components/emergency/EmergencyMode.tsx`：

```tsx
import EmergencyBanner from './EmergencyBanner';
import EmergencyForecastPanel from './EmergencyForecastPanel';
import SpecialVehiclePanel from './SpecialVehiclePanel';
import SupplyDemandPanel from './SupplyDemandPanel';
import EmergencyMap from './EmergencyMap';
import EmergencyTaskBoard from './EmergencyTaskBoard';
import EmergencyPlanPanel from './EmergencyPlanPanel';
import EmergencyCommPanel from './EmergencyCommPanel';
import EmergencyTimeline from './EmergencyTimeline';

export default function EmergencyMode() {
  return (
    <>
      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, zIndex: 110 }}>
        <EmergencyBanner />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 144,
          left: 16,
          right: 16,
          bottom: 180,
          display: 'flex',
          gap: 12,
        }}
      >
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EmergencyForecastPanel />
          <SpecialVehiclePanel />
          <SupplyDemandPanel />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <EmergencyMap />
        </div>

        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EmergencyTaskBoard />
          <EmergencyPlanPanel />
          <EmergencyCommPanel />
        </div>
      </div>

      <EmergencyTimeline />
    </>
  );
}
```

- [ ] **Step 2: 在 App.tsx 中接入 EmergencyMode**

在 `src/App.tsx` 顶部 imports 增加：

```tsx
import EmergencyMode from './components/emergency/EmergencyMode';
```

在 overview / command 条件渲染后面添加：

```tsx
        {systemMode === 'emergency' && <EmergencyMode />}
```

- [ ] **Step 3: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 4: Commit**

```bash
git add src/components/emergency/EmergencyMode.tsx src/App.tsx
git commit -m "feat(emergency): add emergency mode layout container"
```

---

### Task 3: 顶部红色预警横幅

**Files:**
- Create: `src/components/emergency/EmergencyBanner.tsx`

- [ ] **Step 1: 创建横幅组件**

创建 `src/components/emergency/EmergencyBanner.tsx`：

```tsx
import { AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const levelColorMap = {
  I: '#FF4757',
  II: '#FF6B35',
  III: '#F5A623',
  IV: '#00D0E9',
} as const;

export default function EmergencyBanner() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const color = levelColorMap[emergency.emergencyLevel];

  return (
    <div
      style={{
        height: 56,
        margin: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: `linear-gradient(90deg, ${color}22 0%, rgba(10,15,25,0.96) 35%, rgba(10,15,25,0.96) 100%)`,
        boxShadow: `0 0 24px ${color}22`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={18} color={color} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: color }}>{emergency.bannerTitle}</div>
          <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2 }}>{emergency.bannerSubtitle}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>响应等级</div>
          <div style={{ fontSize: 18, fontWeight: 700, color }}>{emergency.emergencyLevel}级</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>当前阶段</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{emergency.phaseLabel}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add src/components/emergency/EmergencyBanner.tsx
git commit -m "feat(emergency): add top emergency alert banner"
```

---

### Task 4: 左栏三个基础面板

**Files:**
- Create: `src/components/emergency/EmergencyForecastPanel.tsx`
- Create: `src/components/emergency/SpecialVehiclePanel.tsx`
- Create: `src/components/emergency/SupplyDemandPanel.tsx`
- Modify: `src/utils/emergencyEngine.ts`

- [ ] **Step 1: 给 emergencyEngine 补充物资需求函数导出**

确认 `estimateSupplyDemand` 已导出；如果未导出，改为：

```typescript
export function estimateSupplyDemand(strandedVehicles: number) {
  const strandedPeople = Math.round(strandedVehicles * 2);
  const boxedMeals = Math.round(strandedPeople * 3 * 1.2);
  const waterBoxes = Math.round((strandedPeople * 3 * 1.2) / 10);
  return { strandedPeople, boxedMeals, waterBoxes };
}
```

- [ ] **Step 2: 创建 EmergencyForecastPanel**

创建 `src/components/emergency/EmergencyForecastPanel.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyForecastPanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);

  return (
    <div className="card" style={{ padding: 14, minHeight: 220 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>A. 滞留预测</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>当前滞留</div><div style={{ fontSize: 24, color: '#FF6B35', fontWeight: 700 }}>{forecast.currentStrandedVehicles}</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>预计峰值</div><div style={{ fontSize: 24, color: '#FF4757', fontWeight: 700 }}>{forecast.peakStrandedVehicles}</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>增速</div><div style={{ fontSize: 18, color: '#F5A623', fontWeight: 600 }}>+{forecast.strandedGrowthPerHour}/h</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>预计复航</div><div style={{ fontSize: 18, color: '#00D0E9', fontWeight: 600 }}>{forecast.estimatedResumeTime}</div></div>
      </div>
      <div style={{ marginTop: 14, padding: 10, borderRadius: 6, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)' }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>停航时长 / 消化时间</div>
        <div style={{ marginTop: 4, fontSize: 13, color: '#E2E8F0' }}>
          预计停航 {forecast.estimatedShutdownHours} 小时 · 复航后消化约 {forecast.estimatedRecoveryHours} 小时
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 SpecialVehiclePanel**

创建 `src/components/emergency/SpecialVehiclePanel.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

export default function SpecialVehiclePanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);

  return (
    <div className="card" style={{ padding: 14, minHeight: 170 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>B. 特殊车辆追踪</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>冷链车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9' }}>{forecast.coldChainVehicles} 辆</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>危化品车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF6B35' }}>{forecast.hazardousVehicles} 辆</span>
        </div>
        <div style={{ padding: 10, borderRadius: 6, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <div style={{ fontSize: 11, color: '#F5A623', fontWeight: 600 }}>重点关注</div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#CBD5E1' }}>冷链车需要优先安排有电源停车位，复航后优先放行。</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 SupplyDemandPanel**

创建 `src/components/emergency/SupplyDemandPanel.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';
import { estimateSupplyDemand } from '../../utils/emergencyEngine';

export default function SupplyDemandPanel() {
  const stranded = useDashboardStore((s) => s.emergencyState.forecast.currentStrandedVehicles);
  const { strandedPeople, boxedMeals, waterBoxes } = estimateSupplyDemand(stranded);

  return (
    <div className="card" style={{ padding: 14, minHeight: 190 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>C. 物资需求估算</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>滞留人数</div><div style={{ fontSize: 20, fontWeight: 700, color: '#E2E8F0' }}>{strandedPeople}</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>盒饭需求</div><div style={{ fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{boxedMeals}</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>饮水需求</div><div style={{ fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>{waterBoxes} 箱</div></div>
        <div><div style={{ fontSize: 11, color: '#64748B' }}>储备充足率</div><div style={{ fontSize: 20, fontWeight: 700, color: '#FF6B35' }}>68%</div></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 6: Commit**

```bash
git add src/components/emergency/EmergencyForecastPanel.tsx src/components/emergency/SpecialVehiclePanel.tsx src/components/emergency/SupplyDemandPanel.tsx src/utils/emergencyEngine.ts
git commit -m "feat(emergency): add forecast, vehicle and supply panels"
```

---

### Task 5: 中央应急地图基础版

**Files:**
- Create: `src/components/emergency/EmergencyMap.tsx`

- [ ] **Step 1: 创建应急地图组件**

创建 `src/components/emergency/EmergencyMap.tsx`：

```tsx
import { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const points = useDashboardStore((s) => s.emergencyState.resourcePoints);

  useEffect(() => {
    let destroyed = false;

    AMapLoader.load({
      key: 'd68ecc01797b67df1d265f2aa29ebc87',
      version: '2.0',
      plugins: ['AMap.Scale'],
    }).then((AMap: any) => {
      if (destroyed || !mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        zoom: 12.8,
        center: [110.150, 20.265],
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
      });

      mapInstance.current = map;

      points.forEach((point) => {
        const color = point.status === 'critical' ? '#FF4757' : point.status === 'warning' ? '#F5A623' : '#00D0E9';
        const label = point.type === 'parking' ? '停' : point.type === 'supply' ? '物' : point.type === 'personnel' ? '警' : point.type === 'drone' ? '机' : '油';

        const marker = new AMap.Marker({
          position: point.position,
          content: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#0A0F19;font-size:12px;font-weight:700;box-shadow:0 0 10px ${color}66;">${label}</div>
            <div style="padding:2px 8px;border-radius:4px;background:rgba(10,15,25,0.88);border:1px solid ${color}55;color:#E2E8F0;font-size:11px;white-space:nowrap;">${point.name}</div>
          </div>`,
          offset: new AMap.Pixel(-13, -30),
          zIndex: 200,
        });

        marker.on('click', () => {
          const info = new AMap.InfoWindow({
            content: `<div style="padding:4px 6px;color:#111827;min-width:180px;"><strong>${point.name}</strong><div style="margin-top:6px;">${point.detail}</div></div>`,
            offset: new AMap.Pixel(0, -24),
          });
          info.open(map, point.position);
        });

        map.add(marker);
      });
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) mapInstance.current.destroy();
    };
  }, [points]);

  return (
    <div className="card" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '8px 12px', borderRadius: 6, background: 'rgba(10,15,25,0.92)', border: '1px solid rgba(255,71,87,0.18)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>D. 应急资源部署地图</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>停车区 / 物资发放点 / 交警部署点 / 无人机巡查点</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add src/components/emergency/EmergencyMap.tsx
git commit -m "feat(emergency): add emergency resource map"
```

---

### Task 6: 右栏基础任务板 / 预案 / 通信

**Files:**
- Create: `src/components/emergency/EmergencyTaskBoard.tsx`
- Create: `src/components/emergency/EmergencyPlanPanel.tsx`
- Create: `src/components/emergency/EmergencyCommPanel.tsx`

- [ ] **Step 1: 创建 EmergencyTaskBoard**

创建 `src/components/emergency/EmergencyTaskBoard.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

const priorityColor = {
  high: '#FF4757',
  medium: '#F5A623',
  low: '#00D0E9',
} as const;

const statusLabel = {
  pending: '待接收',
  received: '已接收',
  executing: '执行中',
  done: '已完成',
} as const;

export default function EmergencyTaskBoard() {
  const tasks = useDashboardStore((s) => s.emergencyState.tasks);

  return (
    <div className="card" style={{ padding: 14, minHeight: 260 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>F. 跨部门任务板</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', border: `1px solid ${priorityColor[task.priority]}33` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{task.title}</div>
              <div style={{ fontSize: 10, color: priorityColor[task.priority], fontWeight: 700 }}>{statusLabel[task.status]}</div>
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
              <span>{task.department} · {task.owner}</span>
              <span>{task.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 EmergencyPlanPanel**

创建 `src/components/emergency/EmergencyPlanPanel.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyPlanPanel() {
  const emergency = useDashboardStore((s) => s.emergencyState);

  return (
    <div className="card" style={{ padding: 14, minHeight: 160 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>G. 应急预案</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>当前预案</div>
          <div style={{ fontSize: 15, color: '#FF6B35', fontWeight: 700, marginTop: 2 }}>EP-01 台风停航应急预案</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>响应等级</div>
          <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 700, marginTop: 2 }}>{emergency.emergencyLevel}级响应</div>
        </div>
        <div style={{ padding: 10, borderRadius: 6, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.18)' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>执行进度</div>
          <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: '46%', height: '100%', background: 'linear-gradient(90deg, #FF6B35, #FF4757)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 EmergencyCommPanel**

创建 `src/components/emergency/EmergencyCommPanel.tsx`：

```tsx
import { useDashboardStore } from '../../store/dashboardStore';

const typeColor = {
  system: '#00D0E9',
  department: '#2ED573',
  port: '#F5A623',
  alert: '#FF4757',
} as const;

export default function EmergencyCommPanel() {
  const communications = useDashboardStore((s) => s.emergencyState.communications);

  return (
    <div className="card" style={{ padding: 14, minHeight: 220 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>H. 通信记录</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {communications.map((item) => (
          <div key={item.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(13,27,42,0.72)', borderLeft: `3px solid ${typeColor[item.type]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 600 }}>{item.source}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>{item.time}</div>
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: item.urgent ? '#FCA5A5' : '#CBD5E1' }}>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 5: Commit**

```bash
git add src/components/emergency/EmergencyTaskBoard.tsx src/components/emergency/EmergencyPlanPanel.tsx src/components/emergency/EmergencyCommPanel.tsx
git commit -m "feat(emergency): add task board, plan panel and comm panel"
```

---

### Task 7: 底部滞留趋势时间轴

**Files:**
- Create: `src/components/emergency/EmergencyTimeline.tsx`

- [ ] **Step 1: 创建时间轴组件**

创建 `src/components/emergency/EmergencyTimeline.tsx`：

```tsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyTimeline() {
  const timeline = useDashboardStore((s) => s.emergencyState.timeline);

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 12,
        height: 150,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>I. 滞留趋势时间轴</div>
      <div style={{ width: '100%', height: 100 }}>
        <ResponsiveContainer>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="emergencyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <ReferenceLine y={3200} stroke="#FF4757" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2} fill="url(#emergencyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add src/components/emergency/EmergencyTimeline.tsx
git commit -m "feat(emergency): add stranded vehicle timeline"
```

---

### Task 8: 最终联调与文档更新

**Files:**
- Modify: `.claude/progress.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 运行完整类型检查**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 2: 运行生产构建**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npm run build`
Expected: build 成功，输出 dist 产物

- [ ] **Step 3: 启动开发服务并手动验收**

Run: `cd /Users/zhangmingchen/projects/xuwen-traffic-dashboard-react && npm run dev`
Expected: 浏览器打开应急模式后可见：
- 红色应急横幅
- 左栏三个面板
- 中央地图的停车区/物资点/交警点位
- 右栏任务板/预案/通信记录
- 底部趋势时间轴
- 顶部模式切换可进入应急模式

- [ ] **Step 4: 更新项目文档进度**

在 `.claude/progress.md` 中：
1. 在“当前状态”中把应急模式从“有 PRD”更新为“Phase 1 MVP 开发完成”
2. 在“待办事项”中把“应急模式指标体系 + 前端开发”细分为后续剩余模块（特殊车辆细化、物资管理、视频无人机、通信闭环）

在 `CLAUDE.md` 中：
把“6. 应急模式开发”更新为“6. 应急模式 Phase 1 MVP 已完成，继续迭代剩余模块”。

- [ ] **Step 5: Commit**

```bash
git add .claude/progress.md CLAUDE.md
git commit -m "docs(emergency): update progress after phase 1 MVP"
```

---

## 自查

- Spec coverage: Phase 1 只覆盖 PRD 的核心 MVP 范围：A（核心）、B/C（简化汇总）、D（基础地图）、F/G/H（基础卡片）、I（基础时间轴）、顶部横幅和模式接入。未覆盖的视频画中画和完整闭环明确留到后续迭代。
- Placeholder scan: 无 TBD / TODO / implement later。
- Type consistency: EmergencyState / EmergencyForecast / EmergencyTask / EmergencyResourcePoint / EmergencyTimelinePoint / EmergencyCommItem 在所有组件中字段一致。
