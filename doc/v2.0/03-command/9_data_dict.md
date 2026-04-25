# 指挥模式 v2.0 — 数据字典

## 1. 场景类型

| 值 | 含义 | 触发条件 |
|----|------|---------|
| congestion | 日常拥堵场景 | 拥堵指数 > 4 |
| emergency | 应急场景 | 停航/台风预警 |

## 2. 应急响应等级

| 值 | 含义 |
|----|------|
| I | I 级（最高） |
| II | II 级 |
| III | III 级 |
| IV | IV 级 |

## 3. 特殊车辆类型

| 值 | 含义 |
|----|------|
| cold_chain | 冷链车 |
| hazmat | 危化品车 |
| medical | 医疗车 |
| police | 警车 |

## 4. 物资需求类型

| 值 | 含义 |
|----|------|
| food | 盒饭 |
| water | 饮用水 |
| power | 应急电源 |
| medical | 医疗物资 |

## 5. 任务状态

| 值 | 含义 |
|----|------|
| pending | 待接收 |
| received | 已接收 |
| executing | 执行中 |
| arrived | 已到场 |
| completed | 已完成 |

## 6. 预案类型

| 值 | 含义 |
|----|------|
| typhoon_shutdown | 台风停航预案 |
| fog_shutdown | 大雾停航预案 |
| spring_rush | 春运高峰预案 |
| accident | 重大事故预案 |
| extreme_stranding | 极端滞留预案 |
| cross_dept | 跨部门联动预案 |

## 7. 通信频道

| 值 | 含义 |
|----|------|
| all | 全部 |
| traffic_police | 公安交警 |
| civil_affairs | 民政局 |
| transport | 交通局 |
| port | 港口 |
| city_admin | 城管 |
| emergency | 应急 |

## 8. 摘要条样式

| 场景 | 背景色 | 文字色 |
|------|-------|-------|
| congestion | 橙色渐变 #F5A623 | 白色 |
| emergency | 红色渐变 #FF4757 | 白色 |
| normal | 蓝色渐变 #00D0E9 | 白色 |
