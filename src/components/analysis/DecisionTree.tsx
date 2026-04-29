import { useState, useCallback, useMemo } from 'react';
import { GitBranch, Sparkles } from 'lucide-react';
import { DECISION_TREE, type TreeNode } from '../../utils/decisionTreeData';

// Color scheme per node type
const NODE_COLORS: Record<TreeNode['type'], { fill: string; stroke: string; text: string }> = {
  root:      { fill: 'rgba(0,208,233,0.15)',  stroke: '#00D0E9', text: '#00D0E9' },
  cause:     { fill: 'rgba(245,166,35,0.15)',  stroke: '#F5A623', text: '#F5A623' },
  condition: { fill: 'rgba(139,92,246,0.15)',  stroke: '#8B5CF6', text: '#8B5CF6' },
  strategy:  { fill: 'rgba(46,213,115,0.15)',  stroke: '#2ED573', text: '#2ED573' },
};

const NODE_W = 180;
const NODE_H = 48;
const H_GAP = 40;
const V_GAP = 24;

// --- layout helpers ---
interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
}

function layoutTree(node: TreeNode, depth: number, expandedIds: Set<string>): LayoutNode {
  const isExpanded = expandedIds.has(node.id);
  const visibleChildren = isExpanded && node.children ? node.children : [];

  const childLayouts = visibleChildren.map(child => layoutTree(child, depth + 1, expandedIds));

  // Calculate total width needed for children
  const childrenWidth = childLayouts.reduce((sum, child) => sum + child.width, 0) + Math.max(0, childLayouts.length - 1) * H_GAP;
  const width = Math.max(NODE_W, childrenWidth);

  // Calculate total height
  const maxChildHeight = childLayouts.length > 0 ? Math.max(...childLayouts.map(c => c.height)) : 0;
  const height = NODE_H + (childLayouts.length > 0 ? V_GAP + maxChildHeight : 0);

  return {
    node,
    x: 0,
    y: 0,
    width,
    height,
    children: childLayouts,
  };
}

function positionNodes(layout: LayoutNode, x: number, y: number): void {
  layout.x = x;
  layout.y = y;

  if (layout.children.length === 0) return;

  // Position children horizontally centered under parent
  const childrenWidth = layout.children.reduce((sum, child) => sum + child.width, 0) + Math.max(0, layout.children.length - 1) * H_GAP;
  let childX = x + (layout.width - childrenWidth) / 2;
  const childY = y + NODE_H + V_GAP;

  layout.children.forEach(child => {
    positionNodes(child, childX, childY);
    childX += child.width + H_GAP;
  });
}

// --- Render helpers ---
interface NodeRendererProps {
  layout: LayoutNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

function NodeRenderer({ layout, expandedIds, onToggle }: NodeRendererProps) {
  const { node, x, y, children } = layout;
  const colors = NODE_COLORS[node.type];
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const centerX = x + NODE_W / 2;

  return (
    <>
      {/* Edges to children */}
      {children.map(child => {
        const childCenterX = child.x + NODE_W / 2;
        const childCenterY = child.y + NODE_H / 2;
        return (
          <line
            key={child.node.id}
            x1={centerX}
            y1={y + NODE_H}
            x2={childCenterX}
            y2={childCenterY}
            stroke="rgba(139,92,246,0.3)"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        );
      })}

      {/* Node rect */}
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2}
        rx={6}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        onClick={() => hasChildren && onToggle(node.id)}
      />

      {/* Version tag badge */}
      {node.versionTag && (
        <g>
          <rect
            x={x + NODE_W - 46}
            y={y + 4}
            width={40}
            height={16}
            rx={8}
            fill="rgba(139,92,246,0.85)"
            stroke="rgba(196,181,253,0.6)"
            strokeWidth={1}
          />
          <text
            x={x + NODE_W - 26}
            y={y + 15}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#F8FAFC"
          >
            {node.versionTag}
          </text>
        </g>
      )}

      {/* Expand/collapse indicator */}
      {hasChildren && (
        <text
          x={x + 10}
          y={y + 18}
          fontSize={14}
          fontWeight={700}
          fill={colors.text}
          style={{ pointerEvents: 'none' }}
        >
          {isExpanded ? '−' : '+'}
        </text>
      )}

      {/* Node label */}
      <text
        x={x + NODE_W / 2}
        y={y + 22}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#E2E8F0"
        style={{ pointerEvents: 'none' }}
      >
        {node.label.length > 20 ? `${node.label.slice(0, 20)}...` : node.label}
      </text>

      {/* Metadata */}
      {(node.hitCount !== undefined || node.successRate !== undefined) && (
        <text
          x={x + NODE_W / 2}
          y={y + 38}
          textAnchor="middle"
          fontSize={10}
          fill="#94A3B8"
          style={{ pointerEvents: 'none' }}
        >
          {node.hitCount !== undefined ? `命中 ${node.hitCount}` : ''}
          {node.hitCount !== undefined && node.successRate !== undefined ? ' | ' : ''}
          {node.successRate !== undefined ? `成功率 ${node.successRate}%` : ''}
        </text>
      )}

      {/* Tooltip via title */}
      <title>
        {[
          node.label,
          node.hitCount !== undefined ? `命中次数: ${node.hitCount}` : '',
          node.successRate !== undefined ? `成功率: ${node.successRate}%` : '',
          node.strategyId ? `策略ID: ${node.strategyId}` : '',
          node.effect ? `效果: ${node.effect}` : '',
          node.versionTag ? `版本标签: ${node.versionTag}` : '',
        ].filter(Boolean).join('\n')}
      </title>

      {/* Render children recursively */}
      {children.map(child => (
        <NodeRenderer
          key={child.node.id}
          layout={child}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

export default function DecisionTree() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['root', 'cause-port', 'cause-traffic', 'cause-accident', 'cause-weather'])
  );

  const toggleNode = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const layout = useMemo(() => {
    const treeLayout = layoutTree(DECISION_TREE, 0, expandedIds);
    positionNodes(treeLayout, 20, 20);
    return treeLayout;
  }, [expandedIds]);

  const svgWidth = layout.width + 40;
  const svgHeight = layout.height + 40;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={14} color="#8B5CF6" /> 策略决策树
        </h3>
        <p style={{ fontSize: 11, color: '#64748B' }}>
          基于拥堵成因、环境条件和历史效果的策略推荐逻辑。点击节点可展开或收起分支。
        </p>
      </div>

      <div style={{
        padding: 16,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        <svg width={svgWidth} height={svgHeight} style={{ minWidth: svgWidth, display: 'block' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <NodeRenderer layout={layout} expandedIds={expandedIds} onToggle={toggleNode} />
        </svg>
      </div>

      <div style={{
        marginTop: 16,
        padding: 14,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(0,208,233,0.05) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sparkles size={14} color="#8B5CF6" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>决策树洞察</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#C9CDD4', lineHeight: 1.8 }}>
          <li>港口积压是最高频主因，累计命中 45 次，整体成功率 82%</li>
          <li>v1.1、v1.2、v1.3 分别补充了天气、车型和路况因子，逐步提升策略适配性</li>
          <li>晴天场景下 S-02 分流效果最佳，单小时缓解能力可达 500 辆</li>
          <li>点击不同分支可查看决策路径，辅助理解 AI 推荐依据</li>
        </ul>
      </div>
    </div>
  );
}

