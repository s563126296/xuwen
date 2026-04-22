import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { GitBranch, HelpCircle } from 'lucide-react';

const COLORS = {
  primary: '#4da6ff',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
};

interface SankeyTooltipParam {
  dataType?: string;
  data?: {
    source?: string;
    target?: string;
    value?: number;
  };
  name?: string;
}

export default function CorrelationPanel() {
  const chartOption = useMemo<EChartsOption>(() => {
    const nodes = [
      { name: '港口放行', itemStyle: { color: COLORS.primary } },
      { name: '天气变化', itemStyle: { color: COLORS.warning } },
      { name: '节假日效应', itemStyle: { color: COLORS.success } },
      { name: '进港大道拥堵', itemStyle: { color: `${COLORS.primary}99` } },
      { name: '南港大道拥堵', itemStyle: { color: `${COLORS.primary}99` } },
      { name: '环城路拥堵', itemStyle: { color: `${COLORS.primary}99` } },
      { name: 'G15入口拥堵', itemStyle: { color: `${COLORS.primary}99` } },
      { name: '城区整体拥堵', itemStyle: { color: COLORS.danger } },
      { name: '港区排队延长', itemStyle: { color: COLORS.danger } },
      { name: '跨海效率下降', itemStyle: { color: COLORS.danger } },
    ];

    const links = [
      { source: '港口放行', target: '进港大道拥堵', value: 68 },
      { source: '港口放行', target: '南港大道拥堵', value: 52 },
      { source: '港口放行', target: 'G15入口拥堵', value: 45 },
      { source: '天气变化', target: '进港大道拥堵', value: 28 },
      { source: '天气变化', target: '环城路拥堵', value: 35 },
      { source: '节假日效应', target: '南港大道拥堵', value: 42 },
      { source: '节假日效应', target: '环城路拥堵', value: 38 },
      { source: '进港大道拥堵', target: '城区整体拥堵', value: 72 },
      { source: '进港大道拥堵', target: '港区排队延长', value: 24 },
      { source: '南港大道拥堵', target: '城区整体拥堵', value: 58 },
      { source: '环城路拥堵', target: '城区整体拥堵', value: 45 },
      { source: 'G15入口拥堵', target: '跨海效率下降', value: 38 },
      { source: 'G15入口拥堵', target: '城区整体拥堵', value: 32 },
      { source: '城区整体拥堵', target: '港区排队延长', value: 55 },
      { source: '港区排队延长', target: '跨海效率下降', value: 62 },
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: `${COLORS.primary}40`,
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: unknown) => {
          const item = params as SankeyTooltipParam;
          if (item.dataType === 'edge') {
            return `${item.data?.source} → ${item.data?.target}<br/>贡献度: ${item.data?.value}%`;
          }
          return item.name ?? '';
        },
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links,
          nodeWidth: 12,
          nodeGap: 8,
          layoutIterations: 32,
          orient: 'horizontal',
          label: {
            color: 'rgba(255,255,255,0.7)',
            fontSize: 10,
            fontFamily: 'Noto Sans SC',
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.3,
            curveness: 0.5,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              opacity: 0.6,
            },
          },
        },
      ],
    };
  }, []);

  const topFactor = useMemo(() => ({
    name: '港口放行',
    contribution: 68,
    timeLag: '15-25分钟',
  }), []);

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <GitBranch size={15} />
        <h3>因果推理</h3>
        <span className="ai-panel__badge">AI</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div className="xw-analysis-card-body">
          <div className="xw-analysis-card-topline">
            <div className="xw-analysis-card-title">
              <span>因果推理链</span>
              <span className="xw-help-tip" title="展示港口放行、天气、节假日等因素如何通过道路拥堵传导至城区和跨海效率的因果关系链">
                <HelpCircle size={12} />
              </span>
            </div>
          </div>

          <div className="xw-analysis-chart">
            <ReactECharts option={chartOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>

          <div className="xw-causal-footer">
            <div className="stat-mini">
              <span>主要因子</span>
              <strong className="data-glow">{topFactor.name}</strong>
            </div>
            <div className="stat-mini">
              <span>贡献度</span>
              <strong className="data-glow">{topFactor.contribution}%</strong>
            </div>
            <div className="stat-mini">
              <span>时滞</span>
              <strong className="data-glow">{topFactor.timeLag}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
