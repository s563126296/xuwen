# 徐闻智慧交通大屏 v2.2

AI驱动的交通指挥决策系统：总览监测 / 指挥处置 / 统计分析 三大模式。

## 当前进度

- 建设方案（第二至五章）✅ 已完成并生成 docx
- 模式收敛（7→3）✅ 导航栏已对齐方案
- 虚拟助手（小语）✅ 已补充到方案
- 系统 demo 可运行（`npm run dev` → http://127.0.0.1:5180）

## 下一步：Round 2 代码清理

1. 删除废弃模式代码：`port/`、`ai-analysis/`、`emergency/` 组件目录
2. `ai-strategy` 重构为 command 子视图
3. `emergency` 功能合并到 command「全面管控」阶段
4. 删除废弃 store：portStore、portPanelStore、emergencyStore
5. `SystemMode` 类型从 7 收敛到 3
6. build + 回归验证

## 技术栈

React + TypeScript + Vite + Zustand | 高德地图 GCJ-02 | Lucide 图标 | 深色主题 #0A0F19

## 关键文档

- 进度：`.claude/progress.md`
- 方案源：`doc/建设方案-第五章-服务内容.md` / `doc/建设方案-第二章至第四章-完整版2.md`
- 方案 docx：`doc/徐闻县智慧交通大屏-建设方案（第二章至第五章）.docx`

## Git

- Remote: https://github.com/s563126296/xuwen
- 推送需代理：`export https_proxy=http://127.0.0.1:7897 && git push`
