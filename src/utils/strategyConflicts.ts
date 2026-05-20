type ConflictType = 'exclusive' | 'constraint' | 'linkage';

interface StrategyConflict {
  strategyA: string;
  strategyB: string;
  type: ConflictType;
  description: string;
  suggestion?: string;
}

export const STRATEGY_CONFLICTS: StrategyConflict[] = [
  { strategyA: 'S-01', strategyB: 'S-04', type: 'constraint', description: '应急车道借用与徐海路分流同时启用时，总分流比例需 ≤ 60%', suggestion: '推荐先启用 S-01 进港大道分流，效果不足再追加 S-04 徐海路分流' },
  { strategyA: 'S-02', strategyB: 'S-04', type: 'constraint', description: 'S376 分流与环半岛公路分流同时启用时，需确保两条替代路不互相拥堵', suggestion: '建议间隔 10 分钟启用，先观察 S376 效果' },
  { strategyA: 'S-01', strategyB: 'S-05', type: 'constraint', description: '全面管控已包含进港大道分流，无需重复启用 S-01', suggestion: '全面管控启用后 S-01 自动纳入' },
];

export const STRATEGY_LINKAGES: Array<{ trigger: string; action: string; description: string }> = [
  { trigger: 'S-01/S-02/S-04 分流启动', action: '触发 S-09', description: '自动发布诱导屏分流信息' },
  { trigger: 'S-05 全面管控启动', action: '触发 S-09 + 全网诱导屏', description: '全面管控自动联动所有诱导屏发布' },
  { trigger: '任意分流策略启动', action: '建议启用临时停车区', description: '分流策略启用后建议同步开放临时停车区承接早到车辆' },
  { trigger: 'S-07 远端拦截启动', action: '触发 S-09 上游诱导屏', description: '远端拦截自动联动上游诱导屏发布预警' },
];

export function checkConflicts(executingIds: string[], newId: string): StrategyConflict[] {
  const conflicts: StrategyConflict[] = [];
  for (const execId of executingIds) {
    for (const conflict of STRATEGY_CONFLICTS) {
      const pair = [conflict.strategyA, conflict.strategyB];
      if ((pair.includes(execId) && pair.includes(newId)) || (pair.includes(newId) && pair.includes(execId))) {
        conflicts.push(conflict);
      }
    }
  }
  return conflicts;
}
