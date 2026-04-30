# 徐闻智慧交通大屏 v2.1 — 部署说明

## 快速启动

### 方式一：本地预览（推荐）
```bash
# 安装一个简单的静态文件服务器
npx serve .

# 或者用 Python
python3 -m http.server 8080
```
然后打开浏览器访问 http://localhost:3000（serve）或 http://localhost:8080（Python）

### 方式二：部署到 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/xuwen-v2.1;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 浏览器要求
- Chrome 90+ （推荐）
- Edge 90+
- Firefox 90+
- 分辨率：1920×1080 或以上

## 包含文件
```
├── index.html              # 入口文件
├── assets/                 # JS/CSS 资源
├── avatars/                # 虚拟人头像资源
├── 项目介绍.md             # 项目整体介绍
├── 功能验证报告.md          # v2.1 功能验证清单
├── 演示讲解稿-总览模式.md   # 总览模式演示稿
├── 演示讲解稿-指挥模式.md   # 指挥模式演示稿
└── README.md               # 本文件
```

## 注意事项
1. 系统需要联网加载高德地图（需要网络环境支持访问 webapi.amap.com）
2. 当前为演示版本，使用模拟数据
3. 建议使用 1920×1080 分辨率的大屏或显示器
4. 首次加载地图可能需要 3-5 秒，请耐心等待

## 演示建议
1. 提前 5 分钟打开系统，让地图完全加载
2. 按照"项目介绍.md"中的六幕故事顺序演示
3. 重点演示：总览模式场景切换 → 指挥模式策略执行 → AI 策略模式模拟器
4. 预计演示时长：20 分钟
