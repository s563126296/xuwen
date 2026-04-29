import { useState, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { GRAPH_NODES, GRAPH_EDGES, type GraphNode, type GraphEdge } from '../../utils/knowledgeGraphData';

// --- Force-directed layout ---

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

  // Initialize: strategies in inner circle, factors in outer circle
  const layoutNodes: LayoutNode[] = nodes.map((n) => {
    const isStrategy = n.type === 'strategy';
    const group = isStrategy ? strategies : factors;
    const idx = group.indexOf(n);
    const radius = isStrategy ? Math.min(width, height) * 0.22 : Math.min(width, height) * 0.38;
    const angle = (2 * Math.PI * idx) / group.length - Math.PI / 2;
    return { ...n, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), vx: 0, vy: 0 };
  });

  const nodeMap = new Map(layoutNodes.map(n => [n.id, n]));

  // Run 100 iterations of force simulation
  for (let iter = 0; iter < 100; iter++) {
    // Repulsion between all node pairs
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
      n.x = Math.max(50, Math.min(width - 50, n.x));
      n.y = Math.max(50, Math.min(height - 50, n.y));
    }
  }

  return layoutNodes;
}

// --- Helpers ---

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

function getConnectedEdges(nodeId: string): GraphEdge[] {
  return GRAPH_EDGES.filter(e => e.source === nodeId || e.target === nodeId);
}

const LEGEND_ITEMS = [
  { color: '#00D0E9', label: '策略节点', dash: '' },
  { color: '#8B5CF6', label: '影响因子', dash: '' },
  { color: '#EF4444', label: '互斥关系', dash: '6 4' },
  { color: '#3B82F6', label: '联动关系', dash: '' },
  { color: '#8B5CF6', label: '影响关系', dash: '2 4' },
];

// --- Component ---

export default function KnowledgeGraph() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const WIDTH = 900;
  const HEIGHT = 560;

  const layoutNodes = useMemo(() => computeLayout(GRAPH_NODES, GRAPH_EDGES, WIDTH, HEIGHT), []);
  const nodeMap = useMemo(() => new Map(layoutNodes.map(n => [n.id, n])), [layoutNodes]);

  const connectedEdgeSet = useMemo(() => {
    if (!hoveredNodeId) return null;
    const connected = getConnectedEdges(hoveredNodeId);
    return new Set(connected.map(e => `${e.source}-${e.target}`));
  }, [hoveredNodeId]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null;
  const selectedEdges = selectedNodeId ? getConnectedEdges(selectedNodeId) : [];

  const isNodeConnectedToHovered = (nodeId: string): boolean => {
    if (!connectedEdgeSet) return true;
    if (nodeId === hoveredNodeId) return true;
    for (const key of connectedEdgeSet) {
      const [src, tgt] = key.split('-');
      if (src === nodeId || tgt === nodeId) return true;
    }
    return false;
  };

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
              const dimmed = hoveredNodeId && !isNodeConnectedToHovered(node.id);
              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {(isHovered || isSelected) && (
                    <circle cx={node.x} cy={node.y} r={r + 4} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.5} />
                  )}
                  <circle
                    cx={node.x} cy={node.y} r={r}
                    fill={`${fill}22`}
                    stroke={fill}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={dimmed ? 0.3 : 1}
                    style={{ transition: 'opacity 0.2s' }}
                  />
                  <text
                    x={node.x} y={node.y + (isStrategy ? -r - 6 : -r - 4)}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize={isStrategy ? 11 : 10}
                    fontWeight={isStrategy ? 600 : 400}
                  >
                    {node.label}
                  </text>
                  {isStrategy && (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fill={fill} fontSize={10} fontWeight={700}>
                      {node.id}
                    </text>
                  )}
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

