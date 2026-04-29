// Decision tree data structure for strategy recommendation engine

export interface TreeNode {
  id: string;
  label: string;
  type: 'condition' | 'cause' | 'strategy' | 'root';
  children?: TreeNode[];
  hitCount?: number;
  successRate?: number;
  versionTag?: string;
  strategyId?: string;
  effect?: string;
}

export const DECISION_TREE: TreeNode = {
  id: 'root',
  label: '拥堵指数 > 6.0',
  type: 'root',
  children: [
    {
      id: 'cause-port',
      label: '主因：港口积压（>60%）',
      type: 'cause',
      hitCount: 45,
      successRate: 82,
      children: [
        {
          id: 'port-sunny', label: '晴天', type: 'condition', children: [
            { id: 'port-sunny-s02', label: 'S-02 分流（500辆/h）', type: 'strategy', strategyId: 'S-02', effect: '500辆/h', hitCount: 18, successRate: 87 },
          ],
        },
        {
          id: 'port-fog', label: '大雾/雨天', type: 'condition', versionTag: 'v1.1', children: [
            { id: 'port-fog-s02', label: 'S-02 分流（350辆/h）', type: 'strategy', strategyId: 'S-02', effect: '350辆/h', hitCount: 8, successRate: 75 },
          ],
        },
        {
          id: 'port-truck', label: '大货车>40%', type: 'condition', versionTag: 'v1.2', children: [
            { id: 'port-truck-s02', label: 'S-02 分流（375辆/h）', type: 'strategy', strategyId: 'S-02', effect: '375辆/h', hitCount: 5, successRate: 72 },
          ],
        },
        {
          id: 'port-road', label: 'S376拥堵', type: 'condition', versionTag: 'v1.3', children: [
            { id: 'port-road-s207', label: 'S207 备用分流', type: 'strategy', strategyId: 'S-02', effect: '备用路线', hitCount: 3, successRate: 80 },
          ],
        },
        {
          id: 'port-wind', label: '风力>8级', type: 'condition', children: [
            { id: 'port-wind-park', label: '临时停车区', type: 'strategy', effect: '临时停车', hitCount: 2, successRate: 90 },
          ],
        },
      ],
    },
    {
      id: 'cause-traffic',
      label: '主因：流量高峰（>30%）',
      type: 'cause',
      hitCount: 30,
      successRate: 78,
      children: [
        { id: 'traffic-signal', label: 'S-04 信号灯优化 + S-14 交警增援', type: 'strategy', strategyId: 'S-04', effect: '信号优化', hitCount: 24, successRate: 78 },
      ],
    },
    {
      id: 'cause-accident',
      label: '主因：事故阻断',
      type: 'cause',
      hitCount: 12,
      successRate: 85,
      children: [
        { id: 'accident-s07', label: 'S-07 事故快速处置 + 备用路线', type: 'strategy', strategyId: 'S-07', effect: '快速处置', hitCount: 12, successRate: 85 },
      ],
    },
    {
      id: 'cause-weather',
      label: '主因：天气影响',
      type: 'cause',
      hitCount: 8,
      successRate: 70,
      children: [
        { id: 'weather-limit', label: '降速限流 + 预警信息发布', type: 'strategy', strategyId: 'S-09', effect: '限流预警', hitCount: 8, successRate: 70 },
      ],
    },
  ],
};