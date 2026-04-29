// src/utils/knowledgeGraphData.ts

export interface GraphNode {
  id: string;
  label: string;
  type: 'strategy' | 'factor';
  x?: number;
  y?: number;
  executionCount?: number;
  successRate?: number;
  versionTag?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'mutex' | 'linkage' | 'influence';
  label?: string;
}

export const GRAPH_NODES: GraphNode[] = [
  // Strategies
  { id: 'S-01', label: '应急车道借用', type: 'strategy', executionCount: 12, successRate: 89 },
  { id: 'S-02', label: 'S376省道分流', type: 'strategy', executionCount: 18, successRate: 76 },
  { id: 'S-04', label: '信号灯配时优化', type: 'strategy', executionCount: 24, successRate: 62 },
  { id: 'S-05', label: '港口增开班次', type: 'strategy', executionCount: 6, successRate: 83 },
  { id: 'S-07', label: '事故快速处置', type: 'strategy', executionCount: 12, successRate: 85 },
  { id: 'S-09', label: '诱导屏信息发布', type: 'strategy', executionCount: 30, successRate: 55 },
  // Influence factors (from evolution records)
  { id: 'factor-weather', label: '天气', type: 'factor', versionTag: 'v1.1' },
  { id: 'factor-truck', label: '车型', type: 'factor', versionTag: 'v1.2' },
  { id: 'factor-road', label: '路况', type: 'factor', versionTag: 'v1.3' },
  { id: 'factor-inflow', label: '汇入车流', type: 'factor', versionTag: 'v1.4' },
];

export const GRAPH_EDGES: GraphEdge[] = [
  // Mutex (from strategyConflicts.ts)
  { source: 'S-01', target: 'S-02', type: 'mutex', label: '互斥：同时分流冲突' },
  // Linkage
  { source: 'S-02', target: 'S-04', type: 'linkage', label: '联动：分流+信号灯' },
  { source: 'S-02', target: 'S-09', type: 'linkage', label: '联动：分流+诱导屏' },
  { source: 'S-07', target: 'S-09', type: 'linkage', label: '联动：事故+信息发布' },
  // Influence (factors -> strategies)
  { source: 'factor-weather', target: 'S-01', type: 'influence' },
  { source: 'factor-weather', target: 'S-02', type: 'influence' },
  { source: 'factor-truck', target: 'S-01', type: 'influence' },
  { source: 'factor-truck', target: 'S-02', type: 'influence' },
  { source: 'factor-truck', target: 'S-04', type: 'influence' },
  { source: 'factor-road', target: 'S-01', type: 'influence' },
  { source: 'factor-road', target: 'S-02', type: 'influence' },
  { source: 'factor-road', target: 'S-07', type: 'influence' },
  { source: 'factor-inflow', target: 'S-02', type: 'influence' },
  { source: 'factor-inflow', target: 'S-04', type: 'influence' },
  { source: 'factor-inflow', target: 'S-07', type: 'influence' },
];
