import ReactECharts from 'echarts-for-react';
import { useOverviewStore } from '../../../stores/overviewStore';

const chartColors = {
  cyan: '#00f0ff',
  textSecondary: 'rgba(224,232,255,0.65)',
  axisLine: 'rgba(0,240,255,0.2)',
  splitLine: 'rgba(0,240,255,0.06)',
};

export default function PressureTrendChart() {
  const predictions = useOverviewStore((s) => s.predictions);

  // Split into actual and predicted segments
  const actualIdx = predictions.findIndex((p) => p.isPredicted);
  const splitIndex = actualIdx === -1 ? predictions.length : actualIdx;

  const times = predictions.map((p) => p.time);
  const actualData = predictions.map((p, i) => (i < splitIndex ? p.index : null));
  const predictedData = predictions.map((p, i) => (i >= splitIndex - 1 ? p.index : null));

  const option: echarts.EChartsOption = {
    grid: { top: 24, right: 16, bottom: 28, left: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,39,0.9)',
      borderColor: chartColors.axisLine,
      textStyle: { color: chartColors.textSecondary, fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: chartColors.axisLine } },
      axisLabel: { color: chartColors.textSecondary, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: { show: false },
      axisLabel: { color: chartColors.textSecondary, fontSize: 11 },
      splitLine: { lineStyle: { color: chartColors.splitLine } },
    },
    series: [
      {
        name: 'Actual',
        type: 'line',
        data: actualData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: chartColors.cyan, width: 2 },
        itemStyle: { color: chartColors.cyan },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,240,255,0.25)' },
              { offset: 1, color: 'rgba(0,240,255,0)' },
            ],
          },
        },
      },
      {
        name: 'Predicted',
        type: 'line',
        data: predictedData,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 6,
        lineStyle: { color: chartColors.cyan, width: 2, type: 'dashed' },
        itemStyle: { color: chartColors.cyan, borderColor: '#0a0e27', borderWidth: 1 },
      },
    ],
  };

  return (
    <div className="bs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bs-panel-title">压力预测趋势</div>
      <ReactECharts
        option={option}
        style={{ flex: 1, minHeight: 0 }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
