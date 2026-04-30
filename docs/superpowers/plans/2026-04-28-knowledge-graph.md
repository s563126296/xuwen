# Strategy Knowledge Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive SVG knowledge graph showing strategy relationships (mutex/linkage/influence) and influence factors, integrated as a new tab in the analysis mode.

**Architecture:** Two files — a data module exporting typed graph nodes and edges, and an SVG React component with force-directed layout, hover highlighting, and click detail panel. The component is wired into the existing `MainViewArea` tab system by extending the `activeView` union type.

**Tech Stack:** React 18, TypeScript, SVG (no external graph library), inline styles matching existing dark theme.

---

### Task 1: Create Knowledge Graph Data Module

**Files:**
- Create: `src/utils/knowledgeGraphData.ts`

- [ ] **Step 1: Create the data file with types and exports**

```typescript
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
  { id: 'S-01', label: '应急车道借用', type: 'strategy', executionCount: 12, successRate: 89 },
  { id: 'S-02', label: 'S376省道分流', type: 'strategy', executionCount: 18, successRate: 76 },
  { id: 'S-04', label: '信号灯配时优化', type: 'strategy', executionCount: 24, successRate: 62 },
  { id: 'S-05', label: '港口增开班次', type: 'strategy', executionCount: 6, successRate: 83 },
  { id: 'S-07', label: '事故快速处置', type: 'strategy', executionCount: 12, successRate: 85 },
  { id: 'S-09', label: '诱导屏信息发布', type: 'strategy', executionCount: 30, successRate: 55 },
  { id: 'factor-weather', label: '天气', type: 'factor', versionTag: 'v1.1' },
  { id: 'factor-truck', label: '车型', type: 'factor', versionTag: 'v1.2' },
  { id: 'factor-road', label: '路况', type: 'factor', versionTag: 'v1.3' },
  { id: 'factor-inflow', label: '汇入车流', type: 'factor', versionTag: 'v1.4' },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { source: 'S-01', target: 'S-02', type: 'mutex', label: '互斥：同时分流冲突' },
  { source: 'S-02', target: 'S-04', type: 'linkage', label: '联动：分流+信号灯' },
  { source: 'S-02', target: 'S-09', type: 'linkage', label: '联动：分流+诱导屏' },
  { source: 'S-07', target: 'S-09', type: 'linkage', label: '联动：事故+信息发布' },
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/zhangmingchen/xuwen && npx tsc --noEmit 2>&1 | tail -5`
Expected: No new errors from this file.

---

### Task 2: Create KnowledgeGraph Component

**Files:**
- Create: `src/components/analysis/KnowledgeGraph.tsx`

The component uses a simple force-directed layout computed once on mount (100 iterations), renders via SVG, supports hover-highlighting of connected edges, and click-to-select node detail panel.

- [ ] **Step 1: Create the KnowledgeGraph component**

See full implementation below. Key design decisions:
- Force simulation runs in a `useMemo` — strategies placed in inner circle, factors in outer circle, then 100 iterations of repulsion + edge attraction settle the layout.
- Node radius scales with `executionCount` (min 18, max 32 for strategies; fixed 14 for factors).
- Edge colors: mutex = `#EF4444` dashed, linkage = `#3B82F6` solid, influence = `#8B5CF6` dotted.
- Hover sets `hoveredNodeId` state, which dims unconnected edges to 0.08 opacity.
- Click sets `selectedNodeId`, rendering a detail panel overlay inside the SVG foreignObject.

```tsx
import { useState, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { GRAPH_NODES, GRAPH_EDGES, type GraphNode, type GraphEdge } from '../../utils/knowledgeGraphData';

interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function computeLayout(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number): LayoutNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const strategies = nodes.filter(n => n.type === 'strategy');
  const factors = nodes.filter(n => n.type === 'factor');

  const layoutNodes: LayoutNode[] = nodes.map((n) => {
    const isStrategy = n.type === 'strategy';
    const group = isStrategy ? strategies : factors;
    const idx = group.indexOf(n);
    const radius = isStrategy ? Math.min(width, height) * 0.22 : Math.min(width, height) * 0.38;
    const angle = (2 * Math.PI * idx) / group.length - Math.PI / 2;
    return { ...n, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), vx: 0, vy: 0 };
  });

  const nodeMap = new Map(layoutNodes.map(n => [n.id, n]));

  for (let iter = 0; iter < 100; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const a = layoutNodes[i];
        const b = layoutNodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 800 / (dist * dist);
        dx = (dx / dist) * force;
        dy = (dy / dist) * force;
        a.vx += dx; a.vy += dy;
        b.vx -= dx; b.vy -= dy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 120) * 0.01;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    // Center gravity
    for (const n of layoutNodes) {
      n.vx += (cx - n.x) * 0.005;
      n.vy += (cy - n.y) * 0.005;
    }

    // Apply velocity with damping
    const damping = 0.85;
    for (const n of layoutNodes) {
      n.vx *= damping; n.vy *= damping;
      n.x += n.vx; n.y += n.vy;
      // Clamp to bounds
      n.x = Math.max(50, Math.min(width - 50, n.x));
      n.y = Math.max(50, Math.min(height - 50, n.y));
    }
  }

  return layoutNodes;
}

function getNodeRadius(node: GraphNode): number {
  if (node.type === 'factor') return 14;
  const count = node.executionCount ?? 10;
  return Math.max(18, Math.min(32, 14 + count * 0.6));
}

function getEdgeStyle(type: GraphEdge['type']): { stroke: string; dasharray: string } {
  switch (type) {
    case 'mutex': return { stroke: '#EF4444', dasharray: '6 4' };
    case 'linkage': return { stroke: '#3B82F6', dasharray: '' };
    case 'influence': return { stroke: '#8B5CF6', dasharray: '2 4' };
  }
}

function getConnectedEdges(nodeId: string, edges: GraphEdge[]): GraphEdge[] {
  return edges.filter(e => e.source === nodeId || e.target === nodeId);
}

const LEGEND_ITEMS = [
  { color: '#00D0E9', label: '策略节点', dash: '' },
  { color: '#8B5CF6', label: '影响因子', dash: '' },
  { color: '#EF4444', label: '互斥关系', dash: '6 4' },
  { color: '#3B82F6', label: '联动关系', dash: '' },
  { color: '#8B5CF6', label: '影响关系', dash: '2 4' },
];

export default function KnowledgeGraph() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const WIDTH = 900;
  const HEIGHT = 560;

  const layoutNodes = useMemo(() => computeLayout(GRAPH_NODES, GRAPH_EDGES, WIDTH, HEIGHT), []);
  const nodeMap = useMemo(() => new Map(layoutNodes.map(n => [n.id, n])), [layoutNodes]);

  const connectedEdgeSet = useMemo(() => {
    if (!hoveredNodeId) return null;
    const connected = getConnectedEdges(hoveredNodeId, GRAPH_EDGES);
    return new Set(connected.map(e => `${e.source}-${e.target}`));
  }, [hoveredNodeId]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null;
  const selectedEdges = selectedNodeId ? getConnectedEdges(selectedNodeId, GRAPH_EDGES) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Share2 size={14} color="#8B5CF6" /> 策略知识图谱
        </h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>
          展示策略间的互斥、联动关系及影响因子，节点大小反映执行次数
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* SVG Graph */}
        <div style={{
          flex: 1,
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* Edges */}
            {GRAPH_EDGES.map((edge, i) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;
              const style = getEdgeStyle(edge.type);
              const edgeKey = `${edge.source}-${edge.target}`;
              const dimmed = connectedEdgeSet && !connectedEdgeSet.has(edgeKey);
              return (
                <line
                  key={i}
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke={style.stroke}
                  strokeWidth={edge.type === 'influence' ? 1 : 1.5}
                  strokeDasharray={style.dasharray}
                  opacity={dimmed ? 0.08 : 0.6}
                  style={{ transition: 'opacity 0.2s' }}
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((node) => {
              const r = getNodeRadius(node);
              const isStrategy = node.type === 'strategy';
              const fill = isStrategy ? '#00D0E9' : '#8B5CF6';
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNodeId === node.id;
              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow ring on hover/select */}
                  {(isHovered || isSelected) && (
                    <circle cx={node.x} cy={node.y} r={r + 4} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.5} />
                  )}
                  <circle
                    cx={node.x} cy={node.y} r={r}
                    fill={`${fill}22`}
                    stroke={fill}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={hoveredNodeId && hoveredNodeId !== node.id && !connectedEdgeSet?.has(`${hoveredNodeId}-${node.id}`) && !connectedEdgeSet?.has(`${node.id}-${hoveredNodeId}`) ? 0.3 : 1}
                    style={{ transition: 'opacity 0.2s' }}
                  />
                  {/* Label */}
                  <text
                    x={node.x} y={node.y + (isStrategy ? -r - 6 : -r - 4)}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize={isStrategy ? 11 : 10}
                    fontWeight={isStrategy ? 600 : 400}
                  >
                    {node.label}
                  </text>
                  {/* ID inside strategy nodes */}
                  {isStrategy && (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fill={fill} fontSize={10} fontWeight={700}>
                      {node.id}
                    </text>
                  )}
                  {/* Version tag for factors */}
                  {node.versionTag && (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#A78BFA" fontSize={8}>
                      {node.versionTag}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.dash ? (
                  <svg width={20} height={2}><line x1={0} y1={1} x2={20} y2={1} stroke={item.color} strokeWidth={2} strokeDasharray={item.dash} /></svg>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                )}
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div style={{
            width: 220,
            flexShrink: 0,
            padding: 16,
            background: 'rgba(13,27,42,0.9)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>
              {selectedNode.label}
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 12 }}>
              {selectedNode.type === 'strategy' ? `策略 ${selectedNode.id}` : `影响因子 · ${selectedNode.versionTag}`}
            </div>

            {selectedNode.type === 'strategy' && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9' }}>{selectedNode.executionCount}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>执行次数</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2ED573' }}>{selectedNode.successRate}%</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>成功率</div>
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>关联关系</div>
            {selectedEdges.length === 0 && (
              <div style={{ fontSize: 11, color: '#475569' }}>无关联</div>
            )}
            {selectedEdges.map((edge, i) => {
              const other = edge.source === selectedNode.id ? edge.target : edge.source;
              const otherNode = nodeMap.get(other);
              const style = getEdgeStyle(edge.type);
              const typeLabel = edge.type === 'mutex' ? '互斥' : edge.type === 'linkage' ? '联动' : '影响';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 0',
                  borderBottom: i < selectedEdges.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: style.stroke, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#E2E8F0' }}>
                    {typeLabel} → {otherNode?.label ?? other}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/zhangmingchen/xuwen && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors from KnowledgeGraph.tsx.

---

### Task 3: Wire KnowledgeGraph into Analysis Mode Tabs

**Files:**
- Modify: `src/stores/analysisStore.ts:54` — extend `activeView` union
- Modify: `src/components/analysis/MainViewArea.tsx` — add tab + render

- [ ] **Step 1: Extend activeView type in analysisStore.ts**

In `src/stores/analysisStore.ts`, line 54, change:
```typescript
  activeView: 'simulator' | 'trend' | 'compare' | 'strategy' | 'event' | 'heatmap';
```
to:
```typescript
  activeView: 'simulator' | 'trend' | 'compare' | 'strategy' | 'event' | 'heatmap' | 'knowledge';
```

- [ ] **Step 2: Add tab and render in MainViewArea.tsx**

Add import at top of `src/components/analysis/MainViewArea.tsx`:
```typescript
import KnowledgeGraph from './KnowledgeGraph';
```

Add to the `TABS` array (after the heatmap entry):
```typescript
  { id: 'knowledge' as const, label: '知识图谱', icon: Share2 },
```

Add `Share2` to the lucide-react import:
```typescript
import { TrendingUp, GitCompare, Target, Clock, Grid3X3, Zap, Share2 } from 'lucide-react';
```

Add render case in the view content section:
```typescript
        {activeView === 'knowledge' && <KnowledgeGraph />}
```

- [ ] **Step 3: Verify full TypeScript compilation**

Run: `cd /Users/zhangmingchen/xuwen && npx tsc --noEmit 2>&1 | tail -20`
Expected: Clean compilation, zero errors.

---

### Task 4: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `cd /Users/zhangmingchen/xuwen && npx tsc --noEmit`
Expected: Exit code 0, no output.

- [ ] **Step 2: Do NOT commit** — per task instructions, no commit.
