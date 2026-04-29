import { Zap, TrendingUp, GitBranch, Share2 } from 'lucide-react';
import { useAnalysisStore } from '../../stores';
import StrategySimulator from '../analysis/StrategySimulator';
import EvolutionRecords from '../analysis/EvolutionRecords';
import DecisionTree from '../analysis/DecisionTree';
import KnowledgeGraph from '../analysis/KnowledgeGraph';

const TABS = [
  { id: 'simulator' as const, label: '策略模拟器', icon: Zap },
  { id: 'evolution' as const, label: '进化记录', icon: TrendingUp },
  { id: 'decision' as const, label: '决策树', icon: GitBranch },
  { id: 'knowledge' as const, label: '知识图谱', icon: Share2 },
];

export default function AIStrategyMainView() {
  const activeView = useAnalysisStore((s) => s.analysisState.activeView);
  const setAnalysisView = useAnalysisStore((s) => s.setAnalysisView);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(13,27,42,0.8)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: 2,
        padding: '8px 16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {TABS.map(tab => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setAnalysisView(tab.id)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid #8B5CF6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <Icon size={13} color={isActive ? '#8B5CF6' : '#64748B'} />
              <span style={{ fontSize: 12, color: isActive ? '#E2E8F0' : '#64748B', fontWeight: isActive ? 600 : 400 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* View content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, paddingRight: 24 }}>
        {activeView === 'simulator' && <StrategySimulator />}
        {activeView === 'evolution' && <EvolutionRecords />}
        {activeView === 'decision' && <DecisionTree />}
        {activeView === 'knowledge' && <KnowledgeGraph />}
      </div>
    </div>
  );
}
