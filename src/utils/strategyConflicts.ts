type ConflictType = 'exclusive' | 'constraint' | 'linkage';

interface StrategyConflict {
  strategyA: string;
  strategyB: string;
  type: ConflictType;
  description: string;
  suggestion?: string;
}

export const STRATEGY_CONFLICTS: StrategyConflict[] = [
  { strategyA: 'S-01', strategyB: 'S-13', type: 'exclusive', description: '应急车道借用与潮汐车道不可同时执行，出港仅剩1车道+无应急车道' },
  { strategyA: 'S-02', strategyB: 'S-03', type: 'constraint', description: '总分流比例需 ≤ 60%', suggestion: '推荐比例 S376:G207 = 6:4' },
  { strategyA: 'S-04', strategyB: 'S-02', type: 'constraint', description: '分流启动后15分钟，信号灯应从拥堵配时逐步回调', suggestion: '分流生效后自动调整信号灯配时' },
  { strategyA: 'S-06', strategyB: 'S-04', type: 'constraint', description: '限流后进港大道流量下降，信号灯配时应同步回调', suggestion: '限流比例 ≤ 50% 时信号灯保持当前配时' },
  { strategyA: 'S-06', strategyB: 'S-08', type: 'constraint', description: '限流导致城区排队超3个路口时，必须同步启用临时停车区', suggestion: '建议同步启用 S-08 临时停车区' },
  { strategyA: 'S-11', strategyB: 'S-02', type: 'constraint', description: '分时限货后客车占比升高，分流效果打折（客车响应率约60%）', suggestion: '分流比例需上调10%补偿' },
];

export const STRATEGY_LINKAGES: Array<{ trigger: string; action: string; description: string }> = [
  { trigger: 'S-07 事故在G207', action: '禁用 S-03', description: '目标路段有事故，G207分流不可用' },
  { trigger: 'S-07 事故在S376', action: '禁用 S-02', description: '目标路段有事故，S376分流不可用' },
  { trigger: 'S-07 事故在进港大道', action: '建议 S-02+S-03', description: '主路事故，自动建议分流' },
  { trigger: 'S-02/S-03 分流启动', action: '触发 S-09', description: '自动发布诱导屏分流信息' },
  { trigger: 'S-06 限流启动', action: '检查 S-08', description: '城区排队超3路口则建议启用停车区' },
  { trigger: 'S-01 应急车道借用', action: '禁用 S-13', description: '自动禁用潮汐车道建议' },
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
