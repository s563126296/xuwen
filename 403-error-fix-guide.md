# 港口模式 403 错误修复方案

## 问题根因

**文件**: `src/components/port/panels/VideoMonitorPanel.tsx`  
**行号**: 13, 21

港口模式的视频监控面板使用了 Pexels 的外部视频资源，导致间歇性 403 错误。

## 外部视频 URL
```
https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4
https://videos.pexels.com/video-files/3015512/3015512-uhd_2560_1440_24fps.mp4
```

## 为什么会 403
1. Pexels 有防盗链机制，直接在 `<video>` 标签中使用可能被拒绝
2. 间歇性错误，可能有请求限流
3. Referer 检查，本地开发环境可能被拒绝

## 解决方案

### 方案 1：使用本地视频（推荐）

1. 下载视频到本地：
```bash
mkdir -p public/videos
# 下载或使用自己的监控视频
```

2. 修改代码：
```typescript
const cameras = [
  {
    name: '闸口监控',
    location: '徐闻港闸口 A-01',
    resolution: '1080P',
    channel: 'CH-01',
    ip: '10.68.1.101',
    videoUrl: '/videos/gate-monitor.mp4', // 本地视频
  },
  {
    name: '码头监控',
    location: '海安新港码头 B-03',
    resolution: '1080P',
    channel: 'CH-03',
    ip: '10.68.2.203',
    videoUrl: '/videos/dock-monitor.mp4', // 本地视频
  },
];
```

### 方案 2：使用占位视频

如果暂时没有真实视频，可以使用占位：

```typescript
const cameras = [
  {
    name: '闸口监控',
    location: '徐闻港闸口 A-01',
    resolution: '1080P',
    channel: 'CH-01',
    ip: '10.68.1.101',
    videoUrl: '', // 空 URL，依赖 onError 显示占位图标
  },
  {
    name: '码头监控',
    location: '海安新港码头 B-03',
    resolution: '1080P',
    channel: 'CH-03',
    ip: '10.68.2.203',
    videoUrl: '', // 空 URL
  },
];
```

代码已经有 `onError` 处理，会自动显示占位图标。

### 方案 3：环境区分

开发环境用占位，生产环境用真实视频流：

```typescript
const cameras = [
  {
    name: '闸口监控',
    location: '徐闻港闸口 A-01',
    resolution: '1080P',
    channel: 'CH-01',
    ip: '10.68.1.101',
    videoUrl: import.meta.env.PROD 
      ? 'rtsp://10.68.1.101/stream' // 生产环境：真实监控流
      : '/videos/gate-monitor.mp4',  // 开发环境：本地视频
  },
  {
    name: '码头监控',
    location: '海安新港码头 B-03',
    resolution: '1080P',
    channel: 'CH-03',
    ip: '10.68.2.203',
    videoUrl: import.meta.env.PROD
      ? 'rtsp://10.68.2.203/stream'
      : '/videos/dock-monitor.mp4',
  },
];
```

## 推荐方案

**立即修复**：使用方案 2（空 URL），依赖现有的 onError 处理  
**长期方案**：使用方案 3（环境区分），生产环境接入真实监控流

## 修复步骤

1. 打开 `src/components/port/panels/VideoMonitorPanel.tsx`
2. 将第 13 行和第 21 行的 `videoUrl` 改为空字符串或本地路径
3. 测试港口模式，确认不再有 403 错误
4. 如果需要视频效果，准备本地视频文件放到 `public/videos/` 目录

## 验证

修复后运行：
```bash
npm run dev
```

访问 http://127.0.0.1:5181，切换到港口模式，检查：
- 控制台无 403 错误
- 视频监控面板正常显示（占位图标或本地视频）
